import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // tự động gửi cookie
});

// Request interceptor - không cần thêm gì, cookie tự động gửi
apiClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes('/auth/refresh-token')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Backend đọc refreshToken từ cookie, set lại accessToken vào cookie
                await apiClient.post('/auth/refresh-token');
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Session expired. Redirecting...');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;