const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TOKEN_KEY = "satech_admin_token";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
});

const getAuthHeadersWithContentType = () => ({
  ...getAuthHeaders(),
  "Content-Type": "application/json"
});

export const videoService = {
  async getVideos() {
    try {
      const response = await fetch(`${BASE_URL}/api/videos`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  async createVideo(formData) {
    try {
      const response = await fetch(`${BASE_URL}/api/videos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  async updateVideo(id, formData) {
    try {
      const response = await fetch(`${BASE_URL}/api/videos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  async deleteVideo(id) {
    try {
      const response = await fetch(`${BASE_URL}/api/videos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};