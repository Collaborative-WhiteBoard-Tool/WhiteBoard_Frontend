import { toast } from "sonner"
import { useCallback, useState } from "react"
import { WhiteBoardItem, WhiteboardResponse } from "@/types/board.type"
import { whiteboardApi } from "@/lib/api/whiteboard.api"



export const useWhiteboard = () => {
    const [whiteboards, setBoards] = useState<WhiteBoardItem[]>([]);
    const [currentWhiteboard, setCurrentWhiteboard] = useState<WhiteboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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





    return { createWhiteboard, whiteboards, currentWhiteboard, isLoading, total, fetchWhiteboards, fetchWhiteboardById }
}