const API_BASE = 'http://localhost:5000/api/news';

export const newsService = {
  // Fetch all news
  getAll: async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  // Fetch single news
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  // Create news
  create: async (newsData) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        body: newsData, // FormData instead of JSON.stringify
      });
      if (!response.ok) throw new Error('Failed to create news');
      return await response.json();
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },

  // Update news
  update: async (id, newsData) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: newsData, // FormData instead of JSON.stringify
      });
      if (!response.ok) throw new Error('Failed to update news');
      return await response.json();
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  },

  // Delete news
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete news');
      return await response.json();
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  },
};