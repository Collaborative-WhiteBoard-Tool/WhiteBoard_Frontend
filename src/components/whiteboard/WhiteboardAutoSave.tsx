// frontend/src/components/Whiteboard/WhiteboardAutoSave.tsx
import { useEffect, useRef } from 'react';
import { useThumbnailGenerator } from '@/hooks/useThumbnailGenerator';
import { useCanvasStore } from '@/store/CanvasStore';

interface WhiteboardAutoSaveProps {
    whiteboardId: string;
}

/**
 * Component này chỉ làm 1 việc: auto-save thumbnail khi unmount
 */
export const WhiteboardAutoSave = ({ whiteboardId }: WhiteboardAutoSaveProps) => {
    const { saveThumbnail } = useThumbnailGenerator(whiteboardId);
    const strokes = useCanvasStore(state => state.strokes);

    const isDirty = useRef(false);
    const saveRef = useRef(saveThumbnail);
    const initialCount = useRef(strokes.length);

    // Cập nhật ref mỗi khi hàm save thay đổi
    useEffect(() => {
        saveRef.current = saveThumbnail;
    }, [saveThumbnail]);

    useEffect(() => {
        if (strokes.length !== initialCount.current) {
            isDirty.current = true;
        }
    }, [strokes]);

    useEffect(() => {
        return () => {
            if (isDirty.current) {
                console.log("🚀 Triggering save...");
                saveRef.current(); // Gọi qua Ref
            }
        };
    }, []);

    return null;
};