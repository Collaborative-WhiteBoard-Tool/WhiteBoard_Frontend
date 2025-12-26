import z from "zod";


export const registerSchema = z.object({
    username: z
        .string()
        .min(2, "Username must be at least 2 characters long!")
        .max(30, "Username must be at most 30 characters long!")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores!"),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email!"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long!")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter!")
        .regex(/[a-z]/, "Password must contain at least one lowecase letter!")
        .regex(/[0-9]/, "Password must contain at least one number!")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character!"),
    confirmPassword: z.string().min(1, "Confirm password can not empty!"),
})
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match!",
                path: ["confirmPassword"]
            })
        }
    })
    .strict()



export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required")
}).strict()


export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>