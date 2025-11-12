"""
Pydantic models for the RAG Application API
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


class ModelType(str, Enum):
    sonar = "sonar"
    sonar_pro = "sonar-pro"
    sonar_reasoning = "sonar-reasoning"


class SearchQuery(BaseModel):
    query: str = Field(..., description="The search query string", example="artificial intelligence trends 2024")
    max_results: Optional[int] = Field(10, description="Maximum number of search results to return", ge=1, le=50)


class SearchResult(BaseModel):
    title: str = Field(..., description="Title of the search result")
    url: str = Field(..., description="URL of the search result")
    snippet: str = Field(..., description="Brief snippet or description of the content")


class SearchResponse(BaseModel):
    query: str = Field(..., description="The original search query")
    results: List[SearchResult] = Field(..., description="List of search results")


class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role", example="user", regex="^(user|assistant|system)$")
    content: str = Field(..., description="Message content", example="What are the latest trends in AI?")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history")
    query: str = Field(..., description="Current user query", example="Tell me about machine learning")
    model: Optional[ModelType] = Field(ModelType.sonar, description="Perplexity model to use")
    stream: Optional[bool] = Field(False, description="Enable streaming response")
    web_search_options: Optional[Dict] = Field(None, description="Additional web search configuration")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI-generated response")
    sources: Optional[List[str]] = Field([], description="List of source URLs or citations")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    allowed_origins: List[str] = Field(..., description="Configured CORS origins")
    timestamp: str = Field(..., description="Current timestamp")


class ApiInfoResponse(BaseModel):
    message: str = Field(..., description="API welcome message")
    status: str = Field(..., description="API status")
    docs: str = Field(..., description="Swagger UI URL")
    redoc: str = Field(..., description="ReDoc URL")


class ModelsResponse(BaseModel):
    models: List[Dict[str, str]] = Field(..., description="List of available models")