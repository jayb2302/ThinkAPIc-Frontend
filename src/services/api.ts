import axios from 'axios';
import { useUserStore } from '../stores/userStore';

// Helper function to get token from Pinia or localStorage
const getToken = () => {
  const userStore = useUserStore();
  return userStore.token || localStorage.getItem('token');
};

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// ✅ Automatically attach token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ✅ Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const userStore = useUserStore();

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);

      // If token expired, logout user
      if (error.response.status === 401) {
        userStore.logout();
        window.location.href = '/'; 
      }
    } else {
      console.error('Network/Server Error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;