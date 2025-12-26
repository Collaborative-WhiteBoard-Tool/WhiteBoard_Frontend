import z from "zod";
import { createNewBoardSchema } from '../schemas/board.schema'
import { ApiResponse } from "./auth.type";



export type CreateWhiteboardDTO = z.infer<typeof createNewBoardSchema>

export interface BoardListItem {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    ownerId: string
    type: string | null
    createdAt: Date
    updatedAt: Date
}

export interface ListBoardsResponse {
    boards: BoardListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export type BoardResponse = ApiResponse<BoardListItem>