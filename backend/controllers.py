"""
Service controllers for the RAG Application API
"""
import os
import logging
from typing import List
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
    
    async def search(self, query: str, max_results: int = 10) -> List[SearchResult]:
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
                    query=query,
                    max_results=max_results
                )
                
                search_results = []
                for result in getattr(search_result, "results", []):
                    search_results.append(SearchResult(
                        title=getattr(result, "title", ""),
                        url=getattr(result, "url", ""),
                        snippet=getattr(result, "snippet", "")
                    ))
                
                return search_results
        except Exception as e:
            logger.error(f"Error calling Perplexity Search API: {str(e)}")
            raise HTTPException(status_code=500, detail="Search service unavailable")
    
    def chat(self, messages: List[ChatMessage], query: str, model: ModelType = ModelType.sonar, 
             stream: bool = False, web_search_options: dict = None) -> ChatResponse:
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
            
            # Build conversation history
            conversation = []
            for msg in messages:
                conversation.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            # Add current query
            conversation.append({
                "role": "user",
                "content": query
            })
            
            # Prepare completion parameters
            completion_params = {
                "messages": conversation,
                "model": model.value,
                "stream": stream
            }
            
            # Add web search options if provided
            if web_search_options:
                completion_params["web_search_options"] = web_search_options
            
            if stream:
                return self._handle_streaming_response(client, completion_params)
            else:
                completion = client.chat.completions.create(**completion_params)
                content = completion.choices[0].message.content if completion.choices else ""
                
                # Extract sources/citations if available
                sources = []
                if hasattr(completion, 'citations') and completion.citations:
                    sources = completion.citations
                
                return ChatResponse(
                    response=content,
                    sources=sources
                )
                
        except Exception as e:
            logger.error(f"Error calling Perplexity Chat API: {str(e)}")
            raise HTTPException(status_code=500, detail="Chat service unavailable")
    
    def _handle_streaming_response(self, client, completion_params) -> ChatResponse:
        """
        Handle streaming response from Perplexity
        
        Args:
            client: Perplexity client instance
            completion_params: Parameters for the completion
            
        Returns:
            ChatResponse object
            
        Raises:
            HTTPException: If streaming fails
        """
        try:
            stream = client.chat.completions.create(**completion_params)
            
            response_content = ""
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    response_content += content
            
            return ChatResponse(
                response=response_content,
                sources=[]  # Streaming may not include citations
            )
        except Exception as e:
            logger.error(f"Error handling streaming response: {str(e)}")
            raise HTTPException(status_code=500, detail="Streaming error")


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
        "http://127.0.0.1:3003"
    ]
    
    logger.info(f"Configured CORS origins: {allowed_origins}")
    return allowed_origins