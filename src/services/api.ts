import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Helper function to get token from Pinia or localStorage
const getToken = () => {
  const authStore = useAuthStore();
  return authStore.token || localStorage.getItem("token");
};

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Automatically attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      const isJwtExpired =
        error.response.status === 401 &&
        error.response.data.message === "jwt expired";

      if (error.response.status === 401 && !isLoginRequest) {
        const authStore = useAuthStore();
        authStore.logOut();
        window.location.href = "/";
        if (isJwtExpired) {
          const event = new CustomEvent("token-expired");
          window.dispatchEvent(event);
        }
      }
    } else {
      //console.error('Network/Server Error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;
