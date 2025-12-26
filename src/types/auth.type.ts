export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
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

// Error response 
export interface ApiValidationError {
    status: "fail"
    code: number
    message: string
    errors: {
        path: string
        message: string
    }[]
}

export interface ApiServerError {
    status: "error"
    code: number
    message: string
}

export type ApiError = ApiValidationError | ApiServerError