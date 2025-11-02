import axios from "axios";

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
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error(`🔌 Network Error for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
    } else {
      console.error(`⚠️ Request Error:`, error.message);
    }
    return Promise.reject(error);
  }
);
