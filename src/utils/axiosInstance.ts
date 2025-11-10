import axios from "axios";
import toast from "react-hot-toast";

export const devURL = "http://localhost:4000/api/v1";

export const prodURL = "";

// Creating an instance of axios to make API calls to server
export const axiosInstance = axios.create({
  baseURL: devURL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // Log error responses for debugging
    if (error.response) {
      // Server responded with error status
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}:`, error.response.data);

      // Show user-friendly error messages
      if (error.response.status === 401) {
        toast.error("Unauthorized. Please sign in again.");
      } else if (error.response.status === 403) {
        toast.error("Access denied. You don't have permission.");
      } else if (error.response.status === 404) {
        toast.error("Resource not found.");
      } else if (error.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Network error - no response received
      console.error(`🔌 Network Error for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
      toast.error("Network error. Please check your internet connection.");
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      toast.error("Request timeout. Please try again.");
    } else {
      // Something else happened
      console.error(`⚠️ Request Error:`, error.message);
      toast.error("An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);
