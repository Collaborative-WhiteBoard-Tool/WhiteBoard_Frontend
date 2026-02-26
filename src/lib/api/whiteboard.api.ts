import apiClient from "@/lib/api/client";
import { BasicResponse, BoardResponse, ListBoardsResponse, RenameBoardDTO, ShareBoardDTO, ToggleFavoriteDTO } from "@/types/board.type";


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
    },

     rename: async (boardId: string, data: RenameBoardDTO) => {
        const response = await apiClient.put<BasicResponse>(
            `/boards/${boardId}/rename`, 
            data
        );
        return response.data;
    },

    /**
     * ✅ 2. TOGGLE FAVORITE
     */
    toggleFavorite: async (boardId: string, data: ToggleFavoriteDTO) => {
        const response = await apiClient.patch<BasicResponse>(
            `/boards/${boardId}/favorite`, 
            data
        );
        return response.data;
    },

    /**
     * ✅ 3. SOFT DELETE (Move to Trash)
     */
    softDelete: async (boardId: string) => {
        console.log('🌐 API: Calling soft delete for:', boardId)
        const response = await apiClient.delete<BasicResponse>(
            `/boards/${boardId}`
        );
        console.log('🌐 API: Delete response:', response.data);
        return response.data;
    },

    /**
     * ✅ 4. RESTORE from Trash
     */
    restore: async (boardId: string) => {
        const response = await apiClient.post<BasicResponse>(
            `/boards/${boardId}/restore`
        );
        return response.data;
    },

    /**
     * ✅ 5. PERMANENTLY DELETE
     */
    permanentDelete: async (boardId: string) => {
        const response = await apiClient.delete<BasicResponse>(
            `/boards/${boardId}/permanent`
        );
        return response.data;
    },

    /**
     * ✅ 6. SHARE BOARD
     */
    share: async (boardId: string, data: ShareBoardDTO) => {
        const response = await apiClient.post<BasicResponse>(
            `/boards/${boardId}/share`, 
            data
        );
        return response.data;
    },

    /**
     * ✅ 7. GET DELETED BOARDS (Trash)
     */
    getDeleted: async (page: number = 1, limit: number = 8) => {
        const response = await apiClient.get<ListBoardsResponse>(
            `/boards/trash?page=${page}&limit=${limit}`
        );
        return response.data.result;
    },

    /**
     * ✅ 8. DOWNLOAD BOARD
     */
   download: async (boardId: string) => {
    const response = await apiClient.get<Blob>(`/boards/${boardId}/download`, {
        responseType: 'blob'
    });
    
    // Create download link
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `board-${boardId}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
},
 /**
     * ✅ 9. GET OWNED BOARDS
     */
    getOwned: async (page: number = 1, limit: number = 8) => {
        const response = await apiClient.get<ListBoardsResponse>(
            `/boards/owned?page=${page}&limit=${limit}`
        );
        return response.data.result;
    },

    /**
     * ✅ 10. GET SHARED BOARDS
     */
    getShared: async (page: number = 1, limit: number = 8) => {
        const response = await apiClient.get<ListBoardsResponse>(
            `/boards/shared?page=${page}&limit=${limit}`
        );
        return response.data.result;
    },
}