"""
RAG Application API - Main FastAPI application
"""
import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from controllers import build_allowed_origins
from routes import router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RAG Application API",
    description="""
    A Retrieval Augmented Generation (RAG) application with Perplexity API integration.
    
    ## Features
    
    * **Search**: Perform web searches using Perplexity's search capabilities
    * **Chat**: Interactive chat with RAG functionality using Perplexity models
    * **Models**: Access to various Perplexity AI models
    
    ## Authentication
    
    This API requires a Perplexity API key to be configured on the server side.
    """,
    version="1.0.0",
    terms_of_service="https://example.com/terms/",
    contact={
        "name": "RAG Application Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# Build allowed origins
ALLOWED_ORIGINS = build_allowed_origins()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
)

# Include routes
app.include_router(router)

# Patch health endpoint to include CORS origins
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint with CORS configuration"""
    from routes import health_check as base_health_check
    return await base_health_check(ALLOWED_ORIGINS)


def custom_openapi():
    """
    Custom OpenAPI schema with additional metadata
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="RAG Application API",
        version="1.0.0",
        description="""
        A comprehensive Retrieval Augmented Generation (RAG) application with Perplexity API integration.
        
        This API provides powerful search and conversational AI capabilities using Perplexity's models.
        Perfect for building intelligent applications that require real-time web search and natural 
        language processing.
        
        ## Key Features
        
        * **🔍 Search**: Web search with Perplexity's advanced search capabilities
        * **💬 Chat**: Conversational AI with context awareness and source citations  
        * **🤖 Models**: Access to multiple Perplexity AI models
        * **📚 RAG**: Retrieval Augmented Generation for enhanced responses
        
        ## Getting Started
        
        1. Ensure your Perplexity API key is configured
        2. Use the `/api/search` endpoint for web searches
        3. Use the `/api/chat` endpoint for conversational interactions
        4. Check `/health` for service status
        
        ## Support
        
        For questions or issues, please contact our support team.
        """,
        routes=app.routes,
    )
    
    # Add custom tags metadata
    openapi_schema["tags"] = [
        {
            "name": "Root", 
            "description": "Basic API information and status"
        },
        {
            "name": "Health", 
            "description": "Service health and configuration endpoints"
        },
        {
            "name": "Search", 
            "description": "Web search functionality using Perplexity API"
        },
        {
            "name": "Chat", 
            "description": "Conversational AI with RAG capabilities"
        },
        {
            "name": "Models", 
            "description": "Available Perplexity AI models information"
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Set custom OpenAPI schema
app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
