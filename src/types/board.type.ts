import z from "zod";
import { createNewBoardSchema } from '../schemas/board.schema'
import { ApiResponse } from "./auth.type";



export type CreateWhiteboardDTO = z.infer<typeof createNewBoardSchema>



export interface WhiteboardResponse {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    type: string | null
    thumbnailUrl?: string;
    thumbnailUpdatedAt?: string;
    createdAt: Date
    updatedAt: Date
    owner: {
        username: string;
        displayName: string | null
    };
    collaborators: {
        id: string;
        role: 'OWNER' | 'EDITOR' | 'VIEWER';
        invitedAt: Date
        acceptedAt: Date | null
        user: {
            username: string;
            displayName: string | null
        };
    }[]
}
////////////



export interface ListBoardsResponseData {
    whiteboards: WhiteBoardItem[]
    collaborators?: CollaboratorResponse[]
    total: number
    page: number
    limit: number
}

export interface WhiteBoardItem {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    type: string | null
    thumbnailUrl?: string;
    thumbnailUpdatedAt?: string;
    owner: {
        id: string;
        username: string;
        displayName: string | null
    };
    createdAt: Date
    updatedAt: Date
}


export interface CollaboratorResponse {
    id: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    invitedAt: Date
    acceptedAt: Date | null
    user: {
        username: string;
        displayName: string | null
    };
}

export type ListBoardsResponse = ApiResponse<ListBoardsResponseData>
export type BoardResponse = ApiResponse<WhiteboardResponse>