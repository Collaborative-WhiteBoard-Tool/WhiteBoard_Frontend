// frontend/src/pages/auth/GoogleSuccessPage.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, useUser } from '@/store/AuthStore'; // ✅ Thay đổi
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const GoogleSuccessPage = () => {
    const navigate = useNavigate();
    const refreshUser = useAuthStore((state) => state.refreshUser); // ✅ Zustand
    const user = useUser(); // ✅ Zustand selector
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');

    useEffect(() => {
        const handleCallback = async () => {
            // Check for errors
            if (error) {
                toast.error(`Login failed: ${error}`);
                navigate('/login');
                return;
            }

            // Refresh user data
            try {
                await refreshUser();

                // Wait a bit to ensure user is set
                setTimeout(() => {
                    if (user) {
                        navigate('/dashboard');
                    } else {
                        toast.error('Failed to authenticate');
                        navigate('/login');
                    }
                }, 500);
            } catch (err) {
                console.error('Failed to refresh user:', err);
                toast.error('Authentication failed');
                navigate('/login');
            }
        };

        handleCallback();
    }, [error, navigate, refreshUser, user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                <h2 className="text-2xl font-semibold">Completing sign in...</h2>
                <p className="text-gray-600">Please wait a moment</p>
            </div>
        </div>
    );
};