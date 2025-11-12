"""
Service controllers for the RAG Application API
"""

import json
import os
import logging
from typing import List, Generator
from fastapi import HTTPException

from models import SearchResult, SearchResponse, ChatMessage, ChatResponse, ModelType
from perplexity import Perplexity, AsyncPerplexity

# Configure logging
logger = logging.getLogger(__name__)


class PerplexityService:
    """Service class for interacting with Perplexity API"""

    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable is required")

    async def search(self, query: str, max_results: int = 50) -> List[SearchResult]:
        """
        Perform search using AsyncPerplexity client

        Args:
            query: Search query string
            max_results: Maximum number of results to return

        Returns:
            List of SearchResult objects

        Raises:
            HTTPException: If the search service is unavailable
        """
        try:
            async with AsyncPerplexity(api_key=self.api_key) as client:
                search_result = await client.search.create(
                    query=query, max_results=max_results
                )

                search_results = []
                for result in getattr(search_result, "results", []):
                    search_results.append(
                        SearchResult(
                            title=getattr(result, "title", ""),
                            url=getattr(result, "url", ""),
                            snippet=getattr(result, "snippet", ""),
                        )
                    )

                return search_results
        except Exception as e:
            logger.error(f"Error calling Perplexity Search API: {str(e)}")
            raise HTTPException(status_code=500, detail="Search service unavailable")

    def chat(
        self,
        messages: List[ChatMessage],
        query: str,
        model: ModelType = ModelType.sonar,
        web_search_options: dict = None,
    ) -> ChatResponse:
        """
        Perform chat using synchronous Perplexity client

        Args:
            messages: List of chat messages for context
            query: Current user query
            model: Perplexity model to use
            stream: Whether to stream the response
            web_search_options: Additional web search configuration

        Returns:
            ChatResponse object

        Raises:
            HTTPException: If the chat service is unavailable
        """
        try:
            client = Perplexity(api_key=self.api_key)

            # Build conversation history with proper role alternation
            conversation = self._build_valid_conversation(messages, query)

            # Prepare completion parameters
            completion_params = {
                "messages": conversation,
                "model": model.value,
            }

            # Add web search options if provided
            if web_search_options:
                completion_params["web_search_options"] = web_search_options

            completion = client.chat.completions.create(**completion_params)
            content = (
                completion.choices[0].message.content if completion.choices else ""
            )

            # Extract sources/citations if available
            sources = []
            if hasattr(completion, "citations") and completion.citations:
                sources = completion.citations

            return ChatResponse(response=content, sources=sources)

        except Exception as e:
            logger.error(f"Error calling Perplexity Chat API: {str(e)}")
            raise HTTPException(status_code=500, detail="Chat service unavailable")

    def _build_valid_conversation(
        self, messages: List[ChatMessage], query: str
    ) -> List[dict]:
        """
        Build a valid conversation that follows Perplexity API requirements:
        - System messages (optional) come first
        - After system messages, user and assistant messages must alternate
        - Conversation should end with a user message

        Args:
            messages: List of chat messages for context
            query: Current user query

        Returns:
            List of properly formatted messages
        """
        conversation = []
        system_messages = []
        user_assistant_messages = []

        # Separate system messages from user/assistant messages
        for msg in messages:
            if msg.role == "system":
                system_messages.append({"role": msg.role, "content": msg.content})
            else:
                user_assistant_messages.append(
                    {"role": msg.role, "content": msg.content}
                )

        # Add system messages first
        conversation.extend(system_messages)

        # Ensure proper alternation for user/assistant messages
        if user_assistant_messages:
            # Validate and fix alternation
            fixed_messages = self._fix_message_alternation(user_assistant_messages)
            conversation.extend(fixed_messages)

        # Add the current query as a user message
        # Make sure the last message is from user for proper alternation
        if conversation and conversation[-1]["role"] == "user":
            # If the last message is already from user, we might need an assistant response first
            # For now, we'll replace it with the new query
            conversation[-1] = {"role": "user", "content": query}
        else:
            # Safe to add user message
            conversation.append({"role": "user", "content": query})

        return conversation

    def _fix_message_alternation(self, messages: List[dict]) -> List[dict]:
        """
        Fix message alternation to ensure user and assistant messages alternate properly

        Args:
            messages: List of user/assistant messages

        Returns:
            List of properly alternating messages
        """
        if not messages:
            return []

        fixed_messages = []
        last_role = None

        for msg in messages:
            current_role = msg["role"]

            # Skip consecutive messages from the same role (except the first message)
            if last_role is None or last_role != current_role:
                fixed_messages.append(msg)
                last_role = current_role
            else:
                # If we have consecutive messages from the same role, merge them or skip
                if fixed_messages:
                    # Merge with the previous message of the same role
                    fixed_messages[-1]["content"] += f"\n\n{msg['content']}"

        # Ensure we start with a user message if we have any messages
        if fixed_messages and fixed_messages[0]["role"] == "assistant":
            # Insert a default user message at the beginning
            fixed_messages.insert(
                0,
                {
                    "role": "user",
                    "content": "Hello, I'd like to continue our conversation.",
                },
            )

        return fixed_messages

    def chat_stream(
        self,
        messages: List[ChatMessage],
        query: str,
        model: ModelType = ModelType.sonar,
        web_search_options: dict = None,
    ):
        """
        Generate streaming chat response using Perplexity client

        Args:
            messages: List of chat messages for context
            query: Current user query
            model: Perplexity model to use
            web_search_options: Additional web search configuration

        Yields:
            Server-sent events with streaming content

        Raises:
            HTTPException: If the chat service is unavailable
        """
        try:
            import json

            client = Perplexity(api_key=self.api_key)

            # Build conversation history with proper role alternation
            conversation = self._build_valid_conversation(messages, query)

            # Prepare completion parameters
            completion_params = {
                "messages": conversation,
                "model": model.value,
                "stream": True,
            }

            # Add web search options if provided
            if web_search_options:
                completion_params["web_search_options"] = web_search_options

            # Start streaming
            stream = client.chat.completions.create(**completion_params)

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    # Send content as Server-Sent Events
                    yield f"data: {json.dumps({'content': content})}\n\n"

            # Send completion signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            logger.error(f"Error in streaming chat: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"


def build_allowed_origins() -> List[str]:
    """
    Build allowed CORS origins dynamically from environment variables

    Returns:
        List of allowed origin URLs
    """
    deploy_host = os.getenv("DEPLOY_HOST", "localhost")
    frontend_port = os.getenv("FRONTEND_PORT", "3000")

    # Build comprehensive list of allowed origins
    allowed_origins = [
        f"http://{deploy_host}:{frontend_port}",
        f"https://{deploy_host}:{frontend_port}",
        f"http://localhost:{frontend_port}",
        f"http://127.0.0.1:{frontend_port}",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ]

    logger.info(f"Configured CORS origins: {allowed_origins}")
    return allowed_origins
