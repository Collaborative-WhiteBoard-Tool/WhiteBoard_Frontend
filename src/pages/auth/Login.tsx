import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import logo_google from "../../assets/logo_google.svg"
import { useForm } from "react-hook-form"
import { LoginFormValues, loginSchema } from "@/schemas/auth.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { CircleUser, LockKeyhole, Mail } from "lucide-react"
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
import { error } from "console"
import { Label } from "../../components/ui/label"
import { useState } from "react"
import apiClient from "@/lib/api/client"
import { authApi } from "@/lib/api/auth.api"
import { toast } from "sonner"
import { ROUTES } from "@/lib/contants/routes"

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()


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
            await authApi.login(values)

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
                // ✅ Error toast with Sonner
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
        <div className="wrapper  ">
            <section className="min-h-screen flex flex-col">
                <header className="flex justify-between items-center border border-t-0 border-x-0 border-b-gray-200 py-2 px-20">
                    <div className="flex gap-1 justify-items-center items-center ">
                        <Avatar>
                            <AvatarImage src="\src\assets\logoMozin.svg" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: 'cursive' }}>Mozin</h1>
                    </div>
                    <div className="box_login flex justify-between items-center gap-3">
                        <div className="box_menu">
                            <ul className="flex gap-2 mr-3">
                                <li className="mx-2 font-medium text-sm text-gray-700 hover:underline hover:decoration-1 transition">
                                    <Link to="/homepage">
                                        Home
                                    </Link>
                                </li>
                                <li className="mx-2 font-medium text-sm text-gray-700">
                                    <Link to="#">About</Link>
                                </li>
                            </ul>
                        </div>
                        <Link to="/register">
                            <button className="hover:cursor-pointer px-7 py-2 bg-gray-300 rounded-3xl text-sm font-bold hover:bg-gray-700 hover:text-white transition">Sign up</button>
                        </Link>
                    </div>
                </header>


                <div className="bg-gray-100 flex flex-1 justify-center ">
                    <div className="box_login flex items-center justify-center  ">
                        <div className="box_form bg-white rounded-2xl w-md flex justify-center ">

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>

                                    <Card className="w-full shadow-none max-w-sm ">
                                        <CardHeader className="text-center">
                                            <CardTitle className="text-4xl font-bold">Welcome back</CardTitle>
                                            <CardDescription className="text-gray-500">
                                                Enter your email below to login to your account
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>

                                            <div className="flex flex-col">
                                                <div className="grid gap-2 mb-3">
                                                    {/***************  Email Field  ***************** */}
                                                    <FormField control={form.control}
                                                        name="email"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem >
                                                                <FormLabel htmlFor="email">Email address</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                        <Input id="email" placeholder="example123@gmail.com" className="pl-10 mt-1.5 rounded-xl border-gray-400 mb-2 aria-invalid:border-red-500  aria-invalid:ring-red-500"
                                                                            aria-invalid={fieldState.invalid} {...field} />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <div className="flex items-center">
                                                        <Label htmlFor="password">Password</Label>
                                                        <a href="#"
                                                            className="ml-auto inline-block text-[13px] text-blue-800 font-medium underline-offset-4 hover:underline">
                                                            Forgot password?
                                                        </a>
                                                    </div>
                                                    {/***************  Password Field  ***************** */}
                                                    <FormField control={form.control}
                                                        name="password"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem >
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                        <Input id="password" type="password" className="pl-10 rounded-xl border-gray-400  aria-invalid:border-red-500  aria-invalid:ring-red-500"
                                                                            placeholder="••••••"
                                                                            aria-invalid={fieldState.invalid} {...field} />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>


                                        </CardContent>
                                        <CardFooter className="flex-col gap-2">
                                            <Button type="submit" className="w-full bg-indigo-500 text-white hover:bg-indigo-700 hover:cursor-pointer" disabled={isLoading}>
                                                {isLoading ? 'Loging...' : 'Login'}
                                            </Button>
                                        </CardFooter>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 border-t border-gray-300" />
                                            <span className="text-sm text-gray-400 whitespace-nowrap">
                                                Or continue with
                                            </span>

                                            <div className="flex-1 border-t border-gray-300" />

                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full mt-5 shadow-none outline-gray-400 outline-1 rounded-xl flex items-center justify-center gap-2 hover:cursor-pointer">
                                            <img src={logo_google} alt="Google" className="h-4 w-4" />
                                            Google
                                        </Button>

                                        <p className="text-center text-sm my-7">Don't have an account? <a href="/register" className="text-blue-500">Sign up</a></p>
                                    </Card>
                                </form>

                            </Form>
                        </div>
                    </div>
                </div>
            </section >

        </div >
    )


}

export default LoginPage