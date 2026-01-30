import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useCanvasStore } from '@/store/CanvasStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';




export const UserList: React.FC = () => {
    const { users } = useCanvasStore();
    return (

        <Card className="shadow-lg inline-flex items-center ">
            <DropdownMenu>
                {/* Trigger là phần hiển thị chính có mũi tên */}
                <DropdownMenuTrigger className="flex items-center gap-1 outline-none hover:bg-black/5 p-1 transition">

                    <div className="flex -space-x-2 ">
                        {users.length === 0 ? (
                            <p className="text-xs text-gray-500 px-2">No users</p>
                        ) : (
                            users.map((user) => (
                                <Avatar key={user.userId} className="h-7 w-7 ring-background">
                                    <AvatarFallback
                                        style={{ backgroundColor: user.color }}
                                        className="text-white text-[10px] font-semibold"
                                    >
                                        {(user.displayName ?? user.userName)?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))
                        )}
                    </div>

                    <ChevronDown className="h-4 w-4 text-gray-600" />
                </DropdownMenuTrigger>

                {/* Nội dung menu đổ xuống */}
                <DropdownMenuContent align="end" className="w-56 px-3 bg-gray-50 border-0">
                    <DropdownMenuSeparator />

                    {users.map((user) => (
                        <div className='flex items-center' key={user.userId}>
                            <Avatar className="h-7 w-7 ring-background">
                                <AvatarFallback
                                    style={{ backgroundColor: user.color }}
                                    className="text-white text-[10px] font-semibold"
                                >
                                    {(user.displayName ?? user.userName)?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <DropdownMenuItem key={user.userId}>
                                {user.displayName || user.userName}
                            </DropdownMenuItem>
                        </div>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Profile settings
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    );
};
