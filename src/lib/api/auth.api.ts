import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth.type";
import apiClient from "./client";

export const authApi = {
    register: async (data: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data)
        return response.data
    },

    logout: async () => {
        return await apiClient.post('/auth/logout')
    },

    getMe: async (): Promise<User> => {
        const response = await apiClient.get<{
            success: boolean;
            result: User;
        }>('/auth/me');
        return response.data.result;
    },

    /**
     * Refresh tokens
     */
    refreshToken: async (): Promise<{ userId: string }> => {
        const response = await apiClient.post<{
            success: boolean;
            result: { userId: string };
        }>('/auth/refresh-token');
        return response.data.result;
    },
}
