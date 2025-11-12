# RAG Application with Perplexity AI

A modern, production-ready RAG (Retrieval Augmented Generation) application built with FastAPI backend and React.js frontend, powered by Perplexity AI for intelligent search and conversational capabilities.

## ✨ Features

- 🔍 **Advanced Search**: Real-time web search with Perplexity's advanced capabilities
- 💬 **Intelligent Chat**: RAG-powered conversational AI with context awareness
- 🤖 **Multiple Models**: Access to Sonar, Sonar Pro, and Sonar Reasoning models
- ⚡ **Streaming Support**: Real-time streaming responses for enhanced UX
- 🐳 **Docker Ready**: Complete containerized deployment with Docker Compose
- 📚 **Interactive API Docs**: Comprehensive Swagger/OpenAPI documentation
- 🌐 **CORS Configured**: Cross-origin support for seamless frontend integration
- 🔒 **Production Ready**: Modular architecture with proper error handling

## 🏗️ Project Architecture

```
rag_app/
├── backend/                 # FastAPI Application
│   ├── main.py             # FastAPI app configuration & startup
│   ├── models.py           # Pydantic data models & validation
│   ├── controllers.py      # Business logic & service classes
│   ├── routes.py           # API route definitions
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container config
│   └── .dockerignore       # Docker ignore patterns
├── frontend/               # React.js Application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page-level components
│   │   │   ├── SearchPage.js
│   │   │   └── ChatPage.js
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── App.js          # Main App component
│   │   └── index.js        # React entry point
│   ├── public/             # Static assets
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── package.json        # Node.js dependencies
│   ├── Dockerfile          # Frontend container config
│   └── .dockerignore       # Docker ignore patterns
├── docker-compose.yml      # Multi-container orchestration
├── .env                    # Environment configuration
└── README.md              # Project documentation
```

## 🛠️ Technology Stack

### Backend Architecture
- **FastAPI**: High-performance Python web framework with automatic API docs
- **Pydantic**: Advanced data validation and serialization
- **Perplexity AI**: State-of-the-art search and conversational AI
- **Uvicorn**: Lightning-fast ASGI server
- **CORS Middleware**: Cross-origin resource sharing support

### Frontend Architecture  
- **React 18**: Modern React with hooks and concurrent features
- **Styled Components**: CSS-in-JS for component styling
- **React Router v6**: Declarative routing
- **Axios**: Promise-based HTTP client
- **React Markdown**: Markdown rendering support

### DevOps & Deployment
- **Docker**: Containerization for consistent deployments
- **Docker Compose**: Multi-container orchestration
- **Hot Reload**: Development-optimized container setup

## 📋 Prerequisites

- **Docker & Docker Compose** (20.10+ recommended)
- **Perplexity API Key** - [Get your key here](https://www.perplexity.ai/)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/giahung24/perplexity-playground.git
cd rag_app
```

### 2. Environment Configuration
Create your environment file:
```bash
# Copy example and edit with your values
cp .env.example .env
```

Update `.env` with your configuration:
```env
# API Configuration
PERPLEXITY_API_KEY=pplx-your_api_key_here

# Port Configuration  
BACKEND_PORT=8010
FRONTEND_PORT=3003

# Deployment Configuration
DEPLOY_HOST=192.168.1.66  # Your server IP or localhost
```

### 3. Launch Application
```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up --build -d
```

### 4. Access Your Application
- 🌐 **Frontend UI**: `http://192.168.1.66:3003` (or your configured host/port)
- 🔧 **Backend API**: `http://192.168.1.66:8010`
- 📖 **Swagger Docs**: `http://192.168.1.66:8010/docs`
- 📚 **ReDoc**: `http://192.168.1.66:8010/redoc`

## � API Reference

### Search Endpoint
Perform intelligent web searches with configurable results:

```bash
POST /api/search
Content-Type: application/json

{
  "query": "latest AI developments 2024",
  "max_results": 10
}
```

**Response:**
```json
{
  "query": "latest AI developments 2024",
  "results": [
    {
      "title": "AI Breakthrough in 2024",
      "url": "https://example.com/ai-news",
      "snippet": "Recent developments in artificial intelligence..."
    }
  ]
}
```

### Chat Endpoint
Engage in RAG-powered conversations with context awareness:

```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello, I'm interested in AI trends"}
  ],
  "query": "What are the most significant AI developments this year?",
  "model": "sonar",
  "stream": false,
  "web_search_options": {
    "search_recency_filter": "week"
  }
}
```

### Health Check
Monitor service status and configuration:
```bash
GET /health
```

### Available Models
List all supported Perplexity AI models:
```bash
GET /api/models
```

## 🔧 Development Guide

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8010

# Access API docs
open http://localhost:8010/docs
```

### Frontend Development  
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Access application
open http://localhost:3003
```

### Full Stack Development
```bash
# Start both services with hot reload
docker compose up

# View logs
docker compose logs -f

# Rebuild specific service
docker compose build backend
docker compose build frontend
```

## 🌍 Environment Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PERPLEXITY_API_KEY` | Your Perplexity AI API key | `pplx-abc123...` | ✅ |
| `BACKEND_PORT` | Backend service port | `8010` | ❌ |
| `FRONTEND_PORT` | Frontend service port | `3003` | ❌ |
| `DEPLOY_HOST` | Server hostname/IP | `192.168.1.66` | ❌ |

## 🤖 Perplexity AI Models

| Model | ID | Description | Best For |
|-------|----|----|----------|
| **Sonar** | `sonar` | Standard model with balanced performance | General queries, everyday use |
| **Sonar Pro** | `sonar-pro` | Enhanced model with advanced capabilities | Complex research, detailed analysis |
| **Sonar Reasoning** | `sonar-reasoning` | Specialized for logical reasoning | Problem-solving, technical questions |

## 🔍 Feature Deep Dive

### 🔎 Intelligent Search
- **Real-time Results**: Instant search with live result updates
- **Source Attribution**: Direct links to original sources
- **Snippet Previews**: Relevant content excerpts
- **Configurable Limits**: Control result count (1-50)
- **Error Handling**: Graceful fallbacks and user feedback

### 💬 Chat Interface
- **Context Awareness**: Maintains conversation history
- **Multi-Model Support**: Switch between AI models seamlessly
- **Source Citations**: Transparent source attribution
- **Streaming Responses**: Real-time response generation
- **Rich Formatting**: Markdown support for enhanced readability

### 🐳 Docker Architecture
- **Multi-Stage Builds**: Optimized container images
- **Hot Reload**: Development-friendly volume mounts
- **Environment Isolation**: Clean separation of concerns
- **Production Ready**: Configurable for different environments

## 🚀 Production Deployment

### Environment Setup
```bash
# Production environment variables
PERPLEXITY_API_KEY=your_production_key
BACKEND_PORT=8010
FRONTEND_PORT=3003
DEPLOY_HOST=your-production-domain.com

# Security considerations
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Production Build
```bash
# Build for production
docker compose -f docker-compose.prod.yml build

# Deploy with production config
docker compose -f docker-compose.prod.yml up -d

# Monitor logs
docker compose logs -f
```

### Security Checklist
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates  
- [ ] Secure API key storage
- [ ] Enable production logging
- [ ] Configure monitoring and alerts

## 📊 Monitoring & Troubleshooting

### Health Checks
```bash
# Check service status
curl http://localhost:8010/health

# View container status
docker compose ps

# Check logs
docker compose logs backend
docker compose logs frontend
```

### Common Issues
- **CORS Errors**: Check `DEPLOY_HOST` and `FRONTEND_PORT` in `.env`
- **API Key Issues**: Verify `PERPLEXITY_API_KEY` is set correctly
- **Port Conflicts**: Ensure configured ports are available
- **Build Failures**: Check Docker logs and rebuild containers

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Submit** a pull request

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint and Prettier
- **Documentation**: Update README for new features
- **Testing**: Add tests for new functionality

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🆘 Support & Resources

### Documentation
- 📖 [API Documentation](http://localhost:8010/docs) - Interactive Swagger UI
- 📚 [ReDoc Documentation](http://localhost:8010/redoc) - Alternative API docs
- 🔗 [Perplexity AI Documentation](https://docs.perplexity.ai/)

### Getting Help
- � [Report Issues](https://github.com/giahung24/perplexity-playground/issues)
- 💬 [Discussions](https://github.com/giahung24/perplexity-playground/discussions)
- 📧 Email: support@example.com

### Quick Links
- 🌟 [Star this project](https://github.com/giahung24/perplexity-playground)
- 🍴 [Fork on GitHub](https://github.com/giahung24/perplexity-playground/fork)
- 📋 [View Issues](https://github.com/giahung24/perplexity-playground/issues)

---

<div align="center">

**Built with ❤️ using FastAPI, React, and Perplexity AI**

[⭐ Star](https://github.com/giahung24/perplexity-playground) • [🐛 Report Bug](https://github.com/giahung24/perplexity-playground/issues) • [✨ Request Feature](https://github.com/giahung24/perplexity-playground/issues)

</div>