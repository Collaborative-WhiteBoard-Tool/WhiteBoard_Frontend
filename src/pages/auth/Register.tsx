import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { useForm } from "react-hook-form"
import { RegisterFormValues, registerSchema } from "@/schemas/auth.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { CircleUser, LockKeyhole, Mail, RotateCcwKey } from "lucide-react"
import work_poster from "../../assets/Work_Poster.png";
import { toast } from "sonner"
import { useState } from "react"
import { ROUTES } from "@/lib/contants/routes"
import { useAuthStore } from "@/store/AuthStore"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"

const RegisterPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const register = useAuthStore((state) => state.register)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })


    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        const { confirmPassword, ...payload } = values
        try {
            const response = await register(payload);
            console.log('res: ', response)
            //  ✅ Success toast with Sonner
            toast.success('Account created successfully!', {
                description: 'Welcome to Mozin. Redirecting to dashboard...',
                duration: 3000,
            });

            // Redirect to dashboardy
            navigate(ROUTES.DASHBOARD);
        } catch (error: any) {
            console.log('Error: ', error)
            if (error.response?.data?.errors) {
                console.log("OK: ", error.response?.data?.errors)
                error.response.data.errors.forEach(
                    (err: { field: string; message: string }) => {
                        form.setError(err.field as keyof RegisterFormValues, {
                            message: err.message,
                        })
                    }
                )
            } else {
                // ✅ Error toast with Sonner
                toast.error('Registration failed', {
                    description: error?.response?.data?.message,
                    duration: 4000,
                })
            }
        }
        finally {
            setIsLoading(false);
        }
    }


    return (

        <section className="min-h-screen flex flex-col ">
            <header className="flex justify-between  items-center border border-t-0 border-x-0 border-b-gray-200 py-2 px-20">
                <div className="flex gap-1 justify-items-center items-center ">
                    <Link to="/homepage" className="flex items-center gap-2 group">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-400 group-hover:ring-violet-500/40 transition-all">
                            <AvatarImage src="\src\assets\logoMozin.svg" />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold">
                                M
                            </AvatarFallback>
                        </Avatar>
                       <h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: 'cursive' }}>Mozin</h1>
                    </Link>
                </div>
                <div className="box_login flex justify-between items-center gap-3">
                    <p className="text-gray-500 font-medium text-sm">Already a member?</p>
                    <Link to="/login">
                        <button className="hover:cursor-pointer px-7 py-2 bg-purple-200 text-purple-700 rounded-3xl text-sm font-bold hover:bg-purple-400 hover:text-white transition">Login</button>
                    </Link>
                </div>
            </header>

            <div className="box_section flex flex-1">
                <section className=" w-1/2 flex items-center">
                    <div className="box_group w-lg mx-auto">
                        <div className="box_title mb-3">
                            <h1 className=" font-bold text-[41px] bg-linear-to-bl from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                Start Brainstorming Today
                            </h1>
                            <p className="text-sm text-gray-500 ">Create your free account to unlock unlimited canvas space and collaborate with your team.</p>
                        </div>
                        <div className="box_form">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    {/***************  Username Field  ***************** */}
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field, fieldState }) => (
                                            <FormItem >
                                                <FormLabel>Username</FormLabel>

                                                <FormControl>
                                                    <div className="relative">
                                                        <CircleUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input

                                                            aria-invalid={fieldState.invalid} {...field}
                                                            id="username" placeholder="Username"
                                                            className={`pl-10 rounded-2xl border-gray-400 mb-2 ${fieldState.error ? 'aria-invalid:border-red-500  aria-invalid:ring-red-500' : ''}`} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-600 text-[10px]" />
                                            </FormItem>

                                        )}
                                    />


                                    {/***************  Email Field  ***************** */}
                                    <FormField control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem >
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input id="email" placeholder="example123@gmail.com"
                                                            className={`pl-10 rounded-2xl border-gray-400 mb-2 ${fieldState.error ? 'aria-invalid:border-red-500  aria-invalid:ring-red-500' : ''}`}
                                                            aria-invalid={fieldState.invalid} {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-600 text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    {/***************  Password Field  ***************** */}
                                    <FormField control={form.control}
                                        name="password"
                                        render={({ field, fieldState }) => (
                                            <FormItem >
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input id="password" type="password" className={`pl-10 rounded-2xl border-gray-400 mb-2 ${fieldState.error ? 'aria-invalid:border-red-500  aria-invalid:ring-red-500' : ''}`}
                                                            placeholder="Minimum 8 characters"
                                                            aria-invalid={fieldState.invalid} {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-600 text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    {/***************  Confirmpassword Field  ***************** */}
                                    <FormField control={form.control}
                                        name="confirmPassword"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>Confirm password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <RotateCcwKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input id="confirmPassword" type="password" className={`pl-10 rounded-2xl border-gray-400 mb-2 ${fieldState.error ? 'aria-invalid:border-red-500  aria-invalid:ring-red-500' : ''}`}
                                                            placeholder="Re-enter password"
                                                            aria-invalid={fieldState.invalid} {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-600 text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-4 bg-purple-600 text-white rounded-3xl hover:cursor-pointer hover:shadow-purple-400 hover:scale-102 transition">
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 border-t border-gray-300" />
                            <span className="text-sm text-gray-400 whitespace-nowrap">
                                Or continue with
                            </span>

                            <div className="flex-1 border-t border-gray-300" />

                        </div>


                        <GoogleLoginButton text="Sign up with Google" disabled={isLoading} />
                        <div className="box-term_check flex justify-center mt-5 gap-1">
                            <input type="checkbox" title="terms" />
                            <p className="text-[12px]  text-gray-500">
                                By clicking "Create account", you agree to our Terms of Service and Privacy Policy.</p>
                        </div>
                    </div>
                </section>

                <div className="box_section flex flex-1 overflow-hidden bg-gray-100">
                    <section className="w-1/2 flex items-center justify-center overflow-hidden mx-auto">
                        <img
                            src={work_poster}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-2xl"
                        />
                    </section>
                </div>

            </div >
        </section >

    )


}

export default RegisterPage