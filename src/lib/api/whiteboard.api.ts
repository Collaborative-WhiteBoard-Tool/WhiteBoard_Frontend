import apiClient from "@/lib/api/client";
import { BoardResponse, ListBoardsResponse } from "@/types/board.type";

export const whiteboardApi = {

    // Create whiteboard
    create: async () => {
        const response = await apiClient.post<BoardResponse>('/boards');
        return response.data.result;
    },

    // Get all boards
    getAll: async (page: number = 1, limit: number = 8) => {
        const response = await apiClient.get<ListBoardsResponse>(`/boards?page=${page}&limit=${limit}`, {
            params: { page, limit }
        })
        return response.data.result
    },

    getById: async (boardId: string) => {
        const response = await apiClient.get<BoardResponse>(`/boards/${boardId}`)
        return response.data.result
    }
}