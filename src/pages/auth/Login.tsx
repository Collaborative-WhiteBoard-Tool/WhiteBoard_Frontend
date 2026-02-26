import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { useForm } from "react-hook-form"
import { LoginFormValues, loginSchema } from "@/schemas/auth.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { LockKeyhole, Mail } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "../../components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { ROUTES } from "@/lib/contants/routes"
import { useAuthStore } from "@/store/AuthStore"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (values: LoginFormValues) => {
        console.log("Login data: ", values)

        setIsLoading(true)
        try {
            await login(values)

            toast.success('Account created successfully!', {
                description: 'Welcome to Mozin. Redirecting to dashboard...',
                duration: 3000,
            });
            navigate(ROUTES.DASHBOARD)
        } catch (error: any) {
            console.log("error: ", error)
            if (error.response?.data?.errors) {
                console.log("OK: ", error.response?.data?.errors)
                error.response.data.errors.forEach(
                    (err: { field: string; message: string }) => {
                        form.setError(err.field as keyof LoginFormValues, {
                            message: err.message,
                        })
                    }
                )
            } else {
                toast.error('Login failed', {
                    description: error?.response?.data?.message,
                    duration: 4000,
                })
            }
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="wrapper min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>

            <section className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-center border-b border-white/40 backdrop-blur-md bg-white/60 py-4 px-20">
                    <Link to="/homepage" className="flex items-center gap-2 group">
                        <Avatar className="h-10 w-10 ring-2 ring-violet-500/20 group-hover:ring-violet-500/40 transition-all">
                            <AvatarImage src="\src\assets\logoMozin.svg" />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold">
                                M
                            </AvatarFallback>
                        </Avatar>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                            Mozin
                        </h1>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block">
                            <ul className="flex gap-6">
                                <li>
                                    <Link to="/homepage" className="text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors">
                                        About
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <Link to="/register">
                            <button className="px-6 py-2.5 text-sm font-semibold text-violet-600 bg-white border border-violet-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 shadow-sm hover:shadow">
                                Sign up
                            </button>
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <Card className="border-0 shadow-2xl shadow-violet-500/10 bg-white/80 backdrop-blur-xl px-5">
                                    <CardHeader className="text-center space-y-4 pb-5">
                                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                            Welcome back
                                        </CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Enter your credentials to access your account
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-5">
                                        {/* Email Field */}
                                        <FormField 
                                            control={form.control}
                                            name="email"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700">
                                                        Email address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                                                            <Input 
                                                                id="email" 
                                                                placeholder="example@gmail.com" 
                                                                className="pl-10 h-10 rounded-xl border-slate-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 transition-all"
                                                                aria-invalid={fieldState.invalid} 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] text-red-600" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Password Field */}
                                        <FormField 
                                            control={form.control}
                                            name="password"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-sm font-semibold text-slate-700">
                                                            Password
                                                        </Label>
                                                        <a href="#" className="text-xs text-violet-600 font-medium hover:text-violet-700 hover:underline transition-colors">
                                                            Forgot password?
                                                        </a>
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                                                            <Input 
                                                                id="password" 
                                                                type="password" 
                                                                placeholder="••••••••"
                                                                className="pl-10 h-10 rounded-xl border-slate-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 transition-all"
                                                                aria-invalid={fieldState.invalid} 
                                                                {...field} 
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] text-red-600" />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>

                                    <CardFooter className="flex-col gap-4 pt-2">
                                        <Button 
                                            type="submit" 
                                            className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Logging in...
                                                </span>
                                            ) : (
                                                'Login'
                                            )}
                                        </Button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                                            <span className="text-xs text-slate-400 font-medium">
                                                Or continue with
                                            </span>
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                                        </div>

                                        <GoogleLoginButton disabled={isLoading} />

                                        <p className="text-center text-sm text-slate-600 mt-2">
                                            Don't have an account?{' '}
                                            <a href="/register" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline transition-colors">
                                                Sign up
                                            </a>
                                        </p>
                                    </CardFooter>
                                </Card>
                            </form>
                        </Form>

                        {/* Footer text */}
                        <p className="text-center text-xs text-slate-500 mt-8">
                            By continuing, you agree to Mozin's{' '}
                            <a href="#" className="underline hover:text-violet-600 transition-colors">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="underline hover:text-violet-600 transition-colors">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LoginPage