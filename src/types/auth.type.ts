
export interface User {
    id: string;
    username: string;
    email: string;
    displayname: string;
    avatar?: string;
    avatarID?: string;
    createdAt: string;
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