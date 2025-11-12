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
  async sendMessage(messages, query) {
    try {
      const response = await api.post('/api/chat', {
        messages,
        query,
      });
      return response.data;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(error.response?.data?.detail || 'Chat failed');
    }
  },
};

export default api;