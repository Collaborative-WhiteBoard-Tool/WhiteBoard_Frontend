import { FieldValues, UseFormSetError } from "react-hook-form"

type ApiError = {
    code: number
    errors?: {
        field: string
        message: string
    }[]
}

export function applyApiErrors<T extends FieldValues>(
    apiError: ApiError,
    setError: UseFormSetError<T>
) {
    apiError.errors?.forEach(err => {
        setError(err.field as any, {
            type: "server",
            message: err.message
        })
    })
}