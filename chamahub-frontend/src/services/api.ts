// chamahub-frontend/src/services/api.ts
import axios from 'axios';

// Use the correct environment variable name
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('📡 API Base URL:', API_BASE_URL); // Debug log

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
        status: error.response?.status,
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
        
        // Try multiple refresh endpoints for compatibility
        const refreshEndpoints = [
          `${API_BASE_URL}/api/v1/token/refresh/`,
          `${API_BASE_URL}/token/refresh/`,
          `${API_BASE_URL}/api/token/refresh/`,
        ];
        
        let refreshResponse = null;
        let refreshError = null;
        
        for (const endpoint of refreshEndpoints) {
          try {
            console.log(`🔄 Trying refresh endpoint: ${endpoint}`);
            refreshResponse = await axios.post(endpoint, {
              refresh: refreshToken,
            });
            console.log('✅ Token refreshed successfully');
            break;
          } catch (err) {
            refreshError = err;
            continue;
          }
        }
        
        if (!refreshResponse) {
          throw refreshError || new Error('All refresh endpoints failed');
        }
        
        const { access } = refreshResponse.data;
        localStorage.setItem('access_token', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
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
    
    // Handle 404 errors specifically
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found:', error.config.url);
      const errorMsg = `API endpoint not found: ${error.config.url}`;
      
      // Check if it's the groups endpoint error we're fixing
      if (error.config.url?.includes('/groups/my-groups/')) {
        console.error('⚠️  This is the known groups endpoint issue. The correct endpoint is:');
        console.error('✅ /api/v1/groups/chama-groups/my_groups/');
        console.error('💡 Please update the frontend API call to use the correct endpoint.');
      }
      
      // Return a more descriptive error
      return Promise.reject({
        ...error,
        message: errorMsg,
        is404: true,
        originalUrl: error.config.url,
      });
    }
    
    // Handle 500 errors
    if (error.response?.status >= 500) {
      console.error('💥 Server error occurred');
      
      // Check if it's M-Pesa related
      if (error.config.url?.includes('mpesa') || error.config.url?.includes('transactions/initiate_stk_push')) {
        console.error('⚠️  M-Pesa error detected. This could be due to:');
        console.error('1. Invalid M-Pesa passkey in backend .env file');
        console.error('2. Incorrect business shortcode (should be 174379 for sandbox)');
        console.error('3. Network issues with Safaricom API');
        console.error('💡 Check the backend logs for more details.');
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - backend may be unreachable');
      console.log('📡 Attempting to connect to:', API_BASE_URL);
      console.log('💡 Check if the backend server is running and accessible');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health/');
    return {
      healthy: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Helper function to get API base URL (useful for debugging)
export const getApiBaseUrl = () => API_BASE_URL;

export default api;