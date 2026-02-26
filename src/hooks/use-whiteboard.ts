import { toast } from "sonner"
import { useCallback, useState } from "react"
import { ShareBoardDTO, WhiteBoardItem, WhiteboardResponse } from "@/types/board.type"
import { whiteboardApi } from "@/lib/api/whiteboard.api"



export const useWhiteboard = () => {
    const [whiteboards, setBoards] = useState<WhiteBoardItem[]>([]);
    const [deletedBoards, setDeletedBoards] = useState<WhiteBoardItem[]>([]);
    const [ownedBoards, setOwnedBoards] = useState<WhiteBoardItem[]>([]); // ✅ NEW
    const [sharedBoards, setSharedBoards] = useState<WhiteBoardItem[]>([]); // ✅ NEW
    const [ownedTotal, setOwnedTotal] = useState(0); // ✅ NEW
    const [sharedTotal, setSharedTotal] = useState(0); // ✅ NEW
    const [deletedTotal, setDeletedTotal] = useState(0);
    const [currentWhiteboard, setCurrentWhiteboard] = useState<WhiteboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingBoard, setIsDeletingBoard] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchWhiteboards = useCallback(
        async (page: number = 1, limit: number = 8) => {
            setIsLoading(true);
            try {
                const response = await whiteboardApi.getAll(page, limit);
                setBoards(response.whiteboards);
                setTotal(response.total);
            } catch (error: any) {
                console.log('e: ', error)
                toast.error('Error!', {
                    description: error.response?.data?.message || 'Failed to fetch whiteboards',
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
                console.log('finally called')
            }
        },
        [toast]
    );


    const fetchWhiteboardById = useCallback(
        async (id: string) => {
            setIsLoading(true)
            try {
                const response = await whiteboardApi.getById(id)
                console.log("📡 API Response Received:", response);
                setCurrentWhiteboard(response)
                return response
            } catch (error) {
                console.log('error: ', error)
                return null
            }
            finally {
                setIsLoading(false)
            }
        },
        []
    )



    const createWhiteboard = useCallback(
        async () => {
            setIsLoading(true);
            try {
                const response = await whiteboardApi.create();
                toast.success('Success!', {
                    description: 'Whiteboard created successfully',
                    duration: 3000,
                });
                return response;
            } catch (error: any) {

                toast.error('Error!', {
                    description: error.response?.data?.message || 'Failed to create whiteboard',
                    duration: 3000,
                });
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );


    const updateBoardInAllLists = useCallback((boardId: string, updater: (board: WhiteBoardItem) => WhiteBoardItem) => {
        setBoards(prev => prev.map(b => b.id === boardId ? updater(b) : b));
        setOwnedBoards(prev => prev.map(b => b.id === boardId ? updater(b) : b));
        setSharedBoards(prev => prev.map(b => b.id === boardId ? updater(b) : b));
    }, []);

    const removeBoardFromAllLists = useCallback((boardId: string) => {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        setOwnedBoards(prev => prev.filter(b => b.id !== boardId));
        setSharedBoards(prev => prev.filter(b => b.id !== boardId));
    }, []);

    const renameBoard = useCallback(
        async (boardId: string, newTitle: string) => {
            setIsLoading(true);
            try {
                await whiteboardApi.rename(boardId, { title: newTitle });

                // ✅ Update tất cả lists
                updateBoardInAllLists(boardId, b => ({ ...b, title: newTitle }));

                toast.success('Success!', { description: 'Board renamed successfully', duration: 2000 });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', { description: err.response?.data?.message || 'Failed to rename board', duration: 3000 });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [updateBoardInAllLists]
    );

    /**
     * ✅ 2. TOGGLE FAVORITE
     */
    const toggleFavorite = useCallback(
        async (boardId: string, isFavorite: boolean) => {
            try {
                await whiteboardApi.toggleFavorite(boardId, { isFavorite });

                // ✅ Update tất cả lists
                updateBoardInAllLists(boardId, b => ({ ...b, isFavorite }));

                toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites', { duration: 2000 });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', { description: err.response?.data?.message || 'Failed to update favorite', duration: 3000 });
                return false;
            }
        },
        [updateBoardInAllLists]
    );

    /**
     * ✅ 3. SOFT DELETE (Move to Trash)
     */




    const moveToTrash = useCallback(
        async (boardId: string) => {
            setIsDeletingBoard(true);
            try {
                await whiteboardApi.softDelete(boardId);

                // ✅ Remove khỏi tất cả lists
                removeBoardFromAllLists(boardId);
                setTotal(prev => Math.max(0, prev - 1));
                setOwnedTotal(prev => Math.max(0, prev - 1));

                toast.success('Board moved to trash', { description: 'You can restore it from the trash', duration: 2000 });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', { description: err.response?.data?.message || 'Failed to delete board', duration: 3000 });
                return false;
            } finally {
                setIsDeletingBoard(false);
            }
        },
        [removeBoardFromAllLists]
    );

    /**
     * ✅ 4. RESTORE from Trash
     */
    const restoreBoard = useCallback(
        async (boardId: string) => {
            setIsLoading(true);
            try {
                await whiteboardApi.restore(boardId);

                // Remove from deleted list
                setDeletedBoards(prev => prev.filter(board => board.id !== boardId));
                setDeletedTotal(prev => prev - 1);

                toast.success('Board restored successfully', {
                    duration: 2000,
                });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to restore board',
                    duration: 3000,
                });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * ✅ 5. PERMANENTLY DELETE
     */
    const permanentlyDelete = useCallback(
        async (boardId: string) => {
            setIsLoading(true);
            try {
                await whiteboardApi.permanentDelete(boardId);

                // Remove from deleted list
                setDeletedBoards(prev => prev.filter(board => board.id !== boardId));
                setDeletedTotal(prev => prev - 1);

                toast.success('Board permanently deleted', {
                    duration: 2000,
                });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to delete board',
                    duration: 3000,
                });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * ✅ 6. SHARE BOARD
     */
    const shareBoard = useCallback(
        async (boardId: string, userEmail: string, role: 'EDITOR' | 'VIEWER') => {
            setIsLoading(true);
            try {
                const data: ShareBoardDTO = { userEmail, role };
                await whiteboardApi.share(boardId, data);

                toast.success('Board shared successfully', {
                    description: `Shared with ${userEmail}`,
                    duration: 3000,
                });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to share board',
                    duration: 3000,
                });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * ✅ 7. FETCH DELETED BOARDS (Trash)
     */
    const fetchDeletedBoards = useCallback(
        async (page: number = 1, limit: number = 8) => {
            setIsLoading(true);
            try {
                const response = await whiteboardApi.getDeleted(page, limit);
                setDeletedBoards(response.whiteboards);
                setDeletedTotal(response.total);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to fetch deleted boards',
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * ✅ 8. DOWNLOAD BOARD
     */
    const downloadBoard = useCallback(
        async (boardId: string) => {
            setIsLoading(true);
            try {
                await whiteboardApi.download(boardId);

                toast.success('Board downloaded successfully', {
                    duration: 2000,
                });
                return true;
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to download board',
                    duration: 3000,
                });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
    * ✅ 9. FETCH OWNED BOARDS
    */
    const fetchOwnedBoards = useCallback(
        async (page: number = 1, limit: number = 8) => {
            setIsLoading(true);
            try {
                const response = await whiteboardApi.getOwned(page, limit);
                setOwnedBoards(response.whiteboards);
                setOwnedTotal(response.total);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to fetch owned boards',
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * ✅ 10. FETCH SHARED BOARDS
     */
    const fetchSharedBoards = useCallback(
        async (page: number = 1, limit: number = 8) => {
            setIsLoading(true);
            try {
                const response = await whiteboardApi.getShared(page, limit);
                setSharedBoards(response.whiteboards);
                setSharedTotal(response.total);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error('Error!', {
                    description: err.response?.data?.message || 'Failed to fetch shared boards',
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        },
        []
    );



    return {
        whiteboards,
        deletedBoards,
        currentWhiteboard,
        ownedBoards,  // ✅ NEW
        sharedBoards,  // ✅ NEW 
        ownedTotal,  // ✅ NEW
        sharedTotal,  // ✅ NEW
        isLoading,
        isDeletingBoard,
        total,
        deletedTotal,

        // Existing functions
        createWhiteboard,
        fetchWhiteboards,
        fetchWhiteboardById,

        // New functions
        renameBoard,
        toggleFavorite,
        moveToTrash,
        restoreBoard,
        permanentlyDelete,
        shareBoard,
        fetchDeletedBoards,
        downloadBoard,
        fetchOwnedBoards,  // ✅ NEW
        fetchSharedBoards,  // ✅ NEW
    }
}