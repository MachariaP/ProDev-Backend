// chamahub-frontend/src/services/api.ts
import axios from 'axios';

// Use the correct environment variable name
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for production
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, {
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('🔄 Attempting token refresh...');
        
        // FIX: Use the correct refresh endpoint (without duplicating /api/v1)
        const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = refreshResponse.data;
        localStorage.setItem('access_token', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        console.log('✅ Token refreshed successfully');
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
    }
    
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found:', error.config.url);
    }
    
    if (error.response?.status >= 500) {
      console.error('💥 Server error occurred');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - backend may be unreachable');
      console.log('📡 Attempting to connect to:', API_BASE_URL);
    }
    
    return Promise.reject(error);
  }
);

export default api;
