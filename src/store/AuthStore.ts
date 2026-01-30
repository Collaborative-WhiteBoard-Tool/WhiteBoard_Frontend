// frontend/src/store/AuthStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth.api';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth.type';
import { toast } from 'sonner';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            // Khởi tạo: isLoading mặc định là true để AppInitializer chạy refreshUser trước
            user: null,
            isLoading: true,
            isAuthenticated: false,

            // Login
            login: async (credentials) => {
                try {
                    set({ isLoading: true });
                    const response = await authApi.login(credentials);

                    // Giả sử API trả về user trong response.result.user hoặc response.user
                    const userData = response.result?.user || response.result.user;

                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                    const message = error.response?.data?.message || 'Login failed';
                    toast.error(message);
                    throw error; // Quăng lỗi để LoginPage nhận được và dừng xử lý
                }
            },

            // Register
            register: async (credentials) => {
                try {
                    set({ isLoading: true });
                    const response = await authApi.register(credentials);
                    const userData = response.result?.user || response.result.user;

                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Account created successfully!');
                } catch (error: any) {
                    set({ isLoading: false });
                    const message = error.response?.data?.message || 'Registration failed';
                    toast.error(message);
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Server logout failed, clearing local state anyway', error);
                } finally {
                    // Luôn xóa state ở client dù API logout có lỗi hay không
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                    window.location.href = '/homepage';
                    toast.success('Logged out successfully');
                }
            },

            // Refresh User: Quan trọng nhất khi dùng Cookie
            refreshUser: async () => {
                try {
                    set({ isLoading: true });
                    const userData = await authApi.getMe();

                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.log('Error: ', error)
                    // Nếu lỗi (401, 500...), coi như chưa đăng nhập
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            // Reset
            reset: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },
        }),
        { name: 'AuthStore' }
    )
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);