import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Tránh lặp vô hạn nếu chính api refresh-token cũng lỗi 401
        if (originalRequest.url?.includes('/auth/refresh-token')) {
            return Promise.reject(error);
        }

        // 2. Xử lý khi lỗi 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Backend sẽ nhận Refresh Token từ Cookie và set lại Access Token mới vào Cookie
                await apiClient.post('/auth/refresh-token');

                // Gọi lại request ban đầu (lúc này trình duyệt đã có Cookie mới)
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Xử lý khi Refresh Token hết hạn hoặc không hợp lệ
                console.error('Session expired. Redirecting...');
                // // Tùy chọn: Xóa user state trong store của bạn (Zustand/Redux) ở đây
                // // Nếu đang ở trang công khai (Home) thì không được redirect
                // const isPublicPage = window.location.pathname === '/homepage' || window.location.pathname === '/';
                // if (!isPublicPage && window.location.pathname !== '/login') {
                //     window.location.href = '/login';
                // }
                // // Chỉ redirect nếu không phải đang ở trang login để tránh lặp
                // if (window.location.pathname !== '/login') {
                //     window.location.href = '/login';
                // }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;