import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthResponse } from '@/types/game';
import { authApi } from '@/services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    signup: (username: string, email: string, password: string) => Promise<AuthResponse>;
    updateProfile: (skin: string) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

    const updateProfile = useCallback(async (skin: string) => {
        setLoading(true);
        setError(null);
        const response = await authApi.updateProfile(skin);
        if (response.success && response.user) {
            setUser(response.user);
        } else {
            setError(response.error || 'Update failed');
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

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            signup,
            updateProfile,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
