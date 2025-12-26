import apiClient from "@/lib/api/client";
import { BoardListItem, BoardResponse, CreateWhiteboardDTO } from "@/types/board.type";

export const whiteboardApi = {

    // Create whiteboard
    create: async () => {
        const response = await apiClient.post<BoardResponse>('/boards');
        return response.data.result;
    },
}