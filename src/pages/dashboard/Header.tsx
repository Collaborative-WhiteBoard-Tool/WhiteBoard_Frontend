import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { CreateWhiteboardDTO } from "@/types/board.type"
import { whiteboardApi } from "@/lib/api/whiteboard.api"
import { useWhiteboard } from "@/hooks/use-whiteboard"
import { useNavigate } from "react-router-dom";



const HeaderDashboard = () => {
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
                    className="bg-blue-600 text-white text-sm font-bold px-2 rounded-xl hover:bg-blue-700 transform active:scale-95 transition duration-150">New Board</button>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )

}

export default HeaderDashboard