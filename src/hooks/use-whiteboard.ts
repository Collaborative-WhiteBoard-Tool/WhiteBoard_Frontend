import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { CreateWhiteboardDTO } from "@/types/board.type"
import { whiteboardApi } from "@/lib/api/whiteboard.api"



export const useWhiteboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);


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


    return { createWhiteboard }
}