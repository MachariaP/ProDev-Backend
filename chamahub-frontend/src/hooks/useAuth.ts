import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback((token: string, userData?: any) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    updateUser,
    checkAuth
  };
}
