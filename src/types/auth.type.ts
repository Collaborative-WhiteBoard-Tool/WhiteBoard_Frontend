
export interface User {
    id: string;
    username: string;
    email: string;
    displayname: string;
    avatar?: string;
    avatarID?: string;
    provider: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    code: number
    message: string
    result: T
}

export interface AuthResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}
export type AuthResponse = ApiResponse<AuthResult>


// Oauth Google
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}

export type AuthProvider = 'local' | 'google';
