import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { User } from '@/types/auth.type';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return { user, isLoading, isAuthenticated: !!user, checkAuth };
};