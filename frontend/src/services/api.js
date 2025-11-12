import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchService = {
  async search(query, maxResults = 10) {
    try {
      const response = await api.post('/api/search', {
        query,
        max_results: maxResults,
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(error.response?.data?.detail || 'Search failed');
    }
  },
};

export const chatService = {
  async sendMessage(messages, query, model = 'sonar', streamMode = false, webSearchOptions = null) {
    try {
      if (streamMode) {
        // Handle streaming response
        return await this.sendStreamingMessage(messages, query, model, webSearchOptions);
      } else {
        // Handle regular response
        const response = await api.post('/api/chat', {
          messages,
          query,
          model,
          stream: false,
          web_search_options: webSearchOptions
        });
        return response.data;
      }
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(error.response?.data?.detail || 'Chat failed');
    }
  },

  async sendStreamingMessage(messages, query, model = 'sonar', webSearchOptions = null) {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        query,
        model,
        stream: true,
        web_search_options: webSearchOptions
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Chat streaming failed');
    }

    return response;
  },

  async getAvailableModels() {
    try {
      const response = await api.get('/api/models');
      return response.data;
    } catch (error) {
      console.error('Models error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch models');
    }
  },
};

export default api;