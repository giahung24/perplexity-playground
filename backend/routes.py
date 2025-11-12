"""
API routes for the RAG Application
"""
import json
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Generator

from models import (
    SearchQuery, SearchResponse, ChatRequest, ChatResponse,
    HealthResponse, ApiInfoResponse, ModelsResponse
)
from controllers import PerplexityService

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize services
perplexity_service = PerplexityService()


@router.get("/", response_model=ApiInfoResponse, tags=["Root"])
async def root() -> Dict[str, str]:
    """
    Root endpoint returning basic API information
    """
    return {
        "message": "RAG Application API", 
        "status": "running", 
        "docs": "/docs", 
        "redoc": "/redoc"
    }


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check(allowed_origins: list) -> Dict[str, Any]:
    """
    Health check endpoint to verify service status and CORS configuration
    """
    return {
        "status": "healthy", 
        "allowed_origins": allowed_origins,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/search", response_model=SearchResponse, tags=["Search"])
async def search_endpoint(search_query: SearchQuery) -> SearchResponse:
    """
    Search endpoint using Perplexity Search API
    
    Perform web searches using Perplexity's search capabilities. Returns a list of 
    relevant search results with titles, URLs, and snippets.
    
    - **query**: The search query string
    - **max_results**: Maximum number of results to return (1-50)
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


@router.post("/api/chat", tags=["Chat"])
async def chat_endpoint(chat_request: ChatRequest):
    """
    Chat endpoint using Perplexity Chat API
    
    Interactive chat with RAG functionality using Perplexity models. Maintains 
    conversation history and provides AI-generated responses with source citations.
    
    - **messages**: Conversation history as a list of messages
    - **query**: Current user query
    - **model**: Perplexity model to use (sonar, sonar-pro, sonar-reasoning)
    - **stream**: Enable streaming response (optional)
    - **web_search_options**: Additional web search configuration (optional)
    """
    try:
        if chat_request.stream:
            # Return streaming response
            return StreamingResponse(
                perplexity_service.chat_stream(
                    messages=chat_request.messages,
                    query=chat_request.query,
                    model=chat_request.model,
                    web_search_options=chat_request.web_search_options
                ),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream",
                }
            )
        else:
            # Return regular response
            response = perplexity_service.chat(
                messages=chat_request.messages,
                query=chat_request.query,
                model=chat_request.model,
                web_search_options=chat_request.web_search_options
            )
            return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/api/models", response_model=ModelsResponse, tags=["Models"])
async def get_available_models() -> Dict[str, list]:
    """
    Get list of available Perplexity models
    
    Returns information about available Perplexity AI models including their 
    IDs, names, and descriptions.
    """
    return {
        "models": [
            {"id": "sonar", "name": "Sonar", "description": "Standard Perplexity model"},
            {"id": "sonar-pro", "name": "Sonar Pro", "description": "Advanced Perplexity model"},
            {"id": "sonar-reasoning", "name": "Sonar Reasoning", "description": "Reasoning-focused Perplexity model"}
        ]
    }