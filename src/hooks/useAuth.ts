import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import { authApi } from '@/services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const response = await authApi.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    } else {
      setError(response.error || 'Login failed');
    }
    setLoading(false);
    return response;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    const response = await authApi.signup(username, email, password);
    if (response.success && response.user) {
      setUser(response.user);
    } else {
      setError(response.error || 'Signup failed');
    }
    setLoading(false);
    return response;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await authApi.logout();
    setUser(null);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};
