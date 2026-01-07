import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../lib/api';

interface AuthContextType {
    user: api.User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<api.User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data, error } = await api.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                } else if (error) {
                    // Try to refresh the session
                    const refreshResult = await api.refreshSession();
                    if (refreshResult.data?.user) {
                        setUser(refreshResult.data.user);
                    } else {
                        // Clear tokens if refresh fails
                        api.setAuthToken(null);
                        api.setRefreshToken(null);
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await api.login(email, password);

            if (error) {
                return { success: false, error: error.error || 'Login failed' };
            }

            if (data?.user) {
                setUser(data.user);
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, username?: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await api.signup(email, password, username);

            if (error) {
                return { success: false, error: error.error || 'Signup failed' };
            }

            if (data?.user) {
                setUser(data.user);
                return { success: true };
            }

            return { success: true }; // User created but may need email verification
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await api.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const { data } = await api.getCurrentUser();
        if (data?.user) {
            setUser(data.user);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function AuthenticatedComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            // Redirect to login or show login prompt
            window.location.href = '/auth';
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}
