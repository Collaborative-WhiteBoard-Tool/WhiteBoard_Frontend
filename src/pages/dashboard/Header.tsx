import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWhiteboard } from "@/hooks/use-whiteboard"
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, UserPen } from "lucide-react";
import { useAuthStore, useUser } from "@/store/AuthStore";

const HeaderDashboard = () => {
    const user = useUser(); // ✅ Optimized selector
    const logout = useAuthStore((state) => state.logout);

    const navigate = useNavigate()
    const { createWhiteboard } = useWhiteboard()
    const handleCreateBoard = async () => {
        const board = await createWhiteboard()
        if (board) {
            navigate(`/whiteboard/${board.id}`)
        }
        console.log('board: ', board)
    }

    return (
        <header className="flex justify-between items-center border-2 border-t-0 border-x-0 border-b-gray-300 px-20 py-4" >
            <Link to="/homepage">
                <div className="flex gap-1 justify-items-center items-center">
                    <Avatar >
                        <AvatarImage src="\src\assets\logoMozin.svg" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: 'cursive' }}>Mozin</h1>
                </div>
            </Link>
            <div className="bg-gray-200 flex rounded-md font-sans " style={{ paddingTop: '5px', paddingBottom: '5px', paddingLeft: '16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ paddingRight: '6px' }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input placeholder="Search board..." className="w-120 " type="text" />
            </div>
            <div className="flex justify-around gap-4">
                <button type="submit"
                    onClick={handleCreateBoard}
                    className="bg-blue-600 text-white text-sm font-bold px-2 rounded-xl hover:bg-blue-700 hover:cursor-pointer hover:shadow-md hover:shadow-cyan-500/50 transform active:scale-95 transition duration-150">New Board</button>
                <DropdownMenu modal={false}>
                    {/* 1. modal={false} ngăn Radix thêm 'pointer-events: none' và 'margin-right' vào body */}

                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer">
                            {user?.avatar ? (
                                <AvatarImage src={user.avatar} />
                            ) : (
                                <>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </>
                            )}
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-30 bg-gray-300 border-0 "
                        side="bottom"
                        align="end"
                        sideOffset={8}
                        // 2. Ngăn việc tự động lấy lại focus vào trigger gây giật trang trên một số trình duyệt
                        onCloseAutoFocus={(e) => {
                            e.preventDefault();
                        }}
                    >


                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-200">
                                <UserPen />My profile
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-gray-200"
                                onSelect={async () => {
                                    try {
                                        await logout();
                                    } finally {
                                        // Dù API logout có lỗi hay không, ta vẫn đá user về login
                                        window.location.href = '/login';
                                    }
                                }}
                            >
                                <LogOut /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    )

}

export default HeaderDashboard