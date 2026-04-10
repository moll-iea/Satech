const API_BASE = 'http://localhost:5000/api/exhibitions';
const TOKEN_KEY = 'satech_admin_token';

export const exhibitionService = {
  getAll: async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch exhibitions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch exhibition');
      return await response.json();
    } catch (error) {
      console.error('Error fetching exhibition:', error);
      throw error;
    }
  },

  create: async (exhibitionData) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: exhibitionData,
      });
      if (!response.ok) throw new Error('Failed to create exhibition');
      return await response.json();
    } catch (error) {
      console.error('Error creating exhibition:', error);
      throw error;
    }
  },

  update: async (id, exhibitionData) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: exhibitionData,
      });
      if (!response.ok) throw new Error('Failed to update exhibition');
      return await response.json();
    } catch (error) {
      console.error('Error updating exhibition:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete exhibition');
      return await response.json();
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      throw error;
    }
  },
};