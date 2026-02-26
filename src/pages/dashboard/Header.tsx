import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWhiteboard } from "@/hooks/use-whiteboard"
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, UserPen, Plus, Search } from "lucide-react";
import { useAuthStore, useUser } from "@/store/AuthStore";
import { useState } from "react";

const HeaderDashboard = () => {
    const user = useUser();
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const { createWhiteboard } = useWhiteboard();
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreateBoard = async () => {
        const board = await createWhiteboard()
        if (board) {
            navigate(`/whiteboard/${board.id}`)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <Link to="/homepage" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="relative">
                        <Avatar className="h-9 w-9 ring-2 ring-violet-500/20">
                            <AvatarImage src="\src\assets\logoMozin.svg" />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold">
                                M
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-white"></div>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Mozin
                    </h1>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search boards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateBoard}
                        className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Plus className="h-4 w-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="relative z-10">New Board</span>
                    </button>

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button className="relative group">
                                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-slate-200 group-hover:ring-violet-500 transition-all">
                                    {user?.avatar ? (
                                        <AvatarImage src={user.avatar} />
                                    ) : (
                                        <>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold">
                                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-64 bg-white border border-slate-200 shadow-xl rounded-xl"
                            side="bottom"
                            align="end"
                            sideOffset={8}
                            onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                            <div className="px-3 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-t-xl">
                                <p className="text-sm font-semibold text-slate-900">{user?.username || 'User'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'user@example.com'}</p>
                            </div>

                            <DropdownMenuGroup className="py-1.5">
                                <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 flex items-center gap-2 px-3 py-2 mx-1 rounded-lg">
                                    <UserPen className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm text-slate-700">My Profile</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="bg-slate-100" />

                            <DropdownMenuGroup className="py-1.5">
                                <DropdownMenuItem
                                    className="cursor-pointer hover:bg-red-50 focus:bg-red-50 flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-red-600 focus:text-red-600"
                                    onSelect={async () => {
                                        try {
                                            await logout();
                                        } finally {
                                            window.location.href = '/login';
                                        }
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="text-sm font-medium">Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

export default HeaderDashboard