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
            <div className="flex justify-between  items-center border-2 border-t-0 border-x-0 border-b-gray-200 py-6 px-20">
                <div className="flex gap-1 justify-items-center items-center ">
                    <Avatar>
                        <AvatarImage src="\src\assets\logoMozin.svg" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: 'cursive' }}>Mozin</h1>
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

                    <div className="box-btn content-center">
                        <Link to="/register">
                            <button className="bg-blue-600 text-white text-sm font-bold mx-3 px-5 py-2 hover:cursor-pointer rounded-xl hover:bg-blue-700 transform active:scale-95 transition duration-150 ">
                                Sign Up
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="bg-neutral-300 text-black text-sm font-bold  px-5 py-2 hover:cursor-pointer rounded-xl hover:bg-neutral-400 transform active:scale-95 transition duration-150 ">
                                Log In
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

        </header>
    )
}


export default Header