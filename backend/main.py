from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
import logging
from enum import Enum
from perplexity import Perplexity, AsyncPerplexity

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RAG Application API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ModelType(str, Enum):
    sonar = "sonar"
    sonar_pro = "sonar-pro"
    sonar_reasoning = "sonar-reasoning"

class SearchQuery(BaseModel):
    query: str
    max_results: Optional[int] = 10

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]

class ChatMessage(BaseModel):
    role: str  # 'user', 'assistant', 'system'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    query: str
    model: Optional[ModelType] = ModelType.sonar
    stream: Optional[bool] = False
    web_search_options: Optional[Dict] = None

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []

class PerplexityService:
    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable is required")
    
    async def search(self, query: str, max_results: int = 10) -> List[SearchResult]:
        """
        Perform search using AsyncPerplexity client
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
             stream: bool = False, web_search_options: Optional[Dict] = None) -> ChatResponse:
        """
        Perform chat using synchronous Perplexity client
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
    
    def _handle_streaming_response(self, client, completion_params) -> str:
        """
        Handle streaming response from Perplexity
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

# Initialize services
perplexity_service = PerplexityService()

@app.get("/")
async def root():
    return {"message": "RAG Application API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/search", response_model=SearchResponse)
async def search_endpoint(search_query: SearchQuery):
    """
    Search endpoint using Perplexity Search API
    """
    try:
        results = await perplexity_service.search(
            query=search_query.query,
            max_results=search_query.max_results
        )
        
        return SearchResponse(
            query=search_query.query,
            results=results
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in search endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatRequest):
    """
    Chat endpoint using Perplexity Chat API
    """
    try:
        response = perplexity_service.chat(
            messages=chat_request.messages,
            query=chat_request.query,
            model=chat_request.model,
            stream=chat_request.stream,
            web_search_options=chat_request.web_search_options
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/models")
async def get_available_models():
    """
    Get list of available Perplexity models
    """
    return {
        "models": [
            {"id": "sonar", "name": "Sonar", "description": "Standard Perplexity model"},
            {"id": "sonar-pro", "name": "Sonar Pro", "description": "Advanced Perplexity model"},
            {"id": "sonar-reasoning", "name": "Sonar Reasoning", "description": "Reasoning-focused Perplexity model"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
