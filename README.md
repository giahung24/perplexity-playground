# RAG Application

A modern RAG (Retrieval Augmented Generation) application built with FastAPI backend and React.js frontend, powered by Perplexity AI.

## 🚀 Features

- **Search Interface**: Simple search functionality with real-time results
- **RAG Chat**: Conversational AI with access to real-time information
- **Multiple Models**: Choose between Sonar, Sonar Pro, and Sonar Reasoning models
- **Streaming Support**: Real-time streaming responses for better UX
- **Docker Ready**: Self-hosted deployment with Docker Compose

## 🏗️ Architecture

```
├── backend/          # FastAPI application
│   ├── main.py      # Main application file
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React.js application
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Perplexity AI**: Search and chat functionality
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **React.js**: User interface
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client
- **React Router**: Navigation

## 📋 Prerequisites

- Docker and Docker Compose
- Perplexity API key ([Get one here](https://www.perplexity.ai/))

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rag_app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Perplexity API key:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   BACKEND_PORT=8000
   FRONTEND_PORT=3000
   ```

3. **Start the application**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 API Endpoints

### Search
```bash
POST /api/search
{
  "query": "artificial intelligence trends",
  "max_results": 10
}
```

### Chat
```bash
POST /api/chat
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "query": "What are the latest AI developments?",
  "model": "sonar",
  "stream": false,
  "web_search_options": {
    "search_recency_filter": "week",
    "max_search_results": 10
  }
}
```

### Available Models
```bash
GET /api/models
```

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PERPLEXITY_API_KEY` | Your Perplexity API key | Required |
| `BACKEND_PORT` | Backend server port | 8000 |
| `FRONTEND_PORT` | Frontend server port | 3000 |

## 🐳 Docker Configuration

The application is containerized with Docker Compose for easy deployment:

- **Backend**: Python 3.11 with FastAPI
- **Frontend**: Node.js with React
- **Development**: Hot reload enabled for both services

## 📚 Available Models

- **Sonar**: Standard Perplexity model for general queries
- **Sonar Pro**: Advanced model with enhanced capabilities
- **Sonar Reasoning**: Specialized model for complex reasoning tasks

## 🔍 Features in Detail

### Search Functionality
- Real-time search results
- Configurable result limits
- Source URLs and snippets
- Error handling and loading states

### RAG Chat
- Conversational interface
- Message history
- Multiple AI models
- Streaming responses
- Source citations
- Web search options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [API documentation](http://localhost:8000/docs)
- Review the logs: `docker compose logs`
- Open an issue on GitHub

## 🚀 Deployment

For production deployment:

1. Update environment variables for production
2. Configure proper CORS origins
3. Set up SSL/TLS certificates
4. Use production-ready databases if needed
5. Monitor logs and performance

```bash
# Production build
docker compose -f docker-compose.prod.yml up -d
```