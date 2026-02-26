import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const Header = () => {
    return (
        <header >
            <div className="flex justify-between  items-center border-2 border-t-0 border-x-0 border-b-gray-200 py-4 px-20">
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

                <div className="flex justify-around gap-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem >
                                <NavigationMenuTrigger >Features</NavigationMenuTrigger>
                            </NavigationMenuItem>
                            <NavigationMenuItem >
                                <NavigationMenuTrigger >Pricing</NavigationMenuTrigger>
                            </NavigationMenuItem>
                            <NavigationMenuItem >
                                <NavigationMenuTrigger >About</NavigationMenuTrigger>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <button className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-violet-300 transition-all duration-300 shadow-sm hover:shadow">
                                Log In
                            </button>
                        </Link>
                        <Link to="/register">
                            <button className="group relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative z-10">Sign Up</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

        </header>
    )
}


export default Header