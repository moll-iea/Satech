const API_BASE = 'http://localhost:5000/api/services';

export const serviceService = {
  // Fetch all services
  getAll: async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch services');
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Fetch single service
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      return await response.json();
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Create service
  create: async (serviceData) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        body: serviceData, // FormData instead of JSON.stringify
      });
      if (!response.ok) throw new Error('Failed to create service');
      return await response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service
  update: async (id, serviceData) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: serviceData, // FormData instead of JSON.stringify
      });
      if (!response.ok) throw new Error('Failed to update service');
      return await response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete service');
      return await response.json();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
};
