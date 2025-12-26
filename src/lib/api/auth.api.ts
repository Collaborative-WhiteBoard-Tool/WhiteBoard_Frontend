import { AuthResponse } from "@/types/auth.type";
import apiClient from "./client";

export const authApi = {
    register: async (data: {
        username: string;
        email: string;
        password: string;
    }): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: {
        email: string,
        password: string
    }): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data)
        return response.data
    }
}
