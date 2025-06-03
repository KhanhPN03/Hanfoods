// filepath: d:\Hang_ngoo\web\hffe\src\services\addressService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with token
const createAuthAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

const addressService = {
  // Get user's addresses
  getUserAddresses: async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get('/addresses/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  },

  // Get address by ID
  getAddressById: async (addressId) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching address by ID:', error);
      throw error;
    }
  },

  // Create new address
  createAddress: async (addressData) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Find or create address (for checkout to prevent duplicates)
  findOrCreateAddress: async (addressData) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post('/addresses/find-or-create', addressData);
      return response.data;
    } catch (error) {
      console.error('Error finding or creating address:', error);
      throw error;
    }
  }
};

export default addressService;
