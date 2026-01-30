import { useCallback } from 'react';
import { useCanvasStore } from '@/store/CanvasStore';
import { uploadToCloudinary, canvasToBlob } from '@/lib/cloudinary';
import { toast } from 'sonner';

export const useThumbnailGenerator = (whiteboardId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const strokes = useCanvasStore(state => state.strokes);

    /**
     * Generate thumbnail from current canvas state
     */
    const generateThumbnail = useCallback(async (): Promise<{
        url: string;
        publicId: string;
    } | null> => {
        try {
            if (strokes.length === 0) {
                console.log('No strokes to generate thumbnail');
                return null;
            }

            // Create off-screen canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1200;  // High resolution
            canvas.height = 900;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw all strokes
            strokes.forEach(stroke => {
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (stroke.tool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                }

                ctx.beginPath();

                for (let i = 0; i < stroke.points.length; i += 2) {
                    const x = stroke.points[i];
                    const y = stroke.points[i + 1];

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.stroke();
            });

            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';

            // Convert to Blob
            const blob = await canvasToBlob(canvas);

            // Upload to Cloudinary
            const result = await uploadToCloudinary(
                blob,
                `whiteboards/${whiteboardId}`
            );

            toast.dismiss();

            console.log('✅ Thumbnail uploaded:', result.secure_url);

            return {
                url: result.secure_url,
                publicId: result.public_id,
            };

        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }, [strokes, whiteboardId]);

    /**
     * Save thumbnail to backend
     */
    const saveThumbnail = useCallback(async () => {
        try {
            const thumbnail = await generateThumbnail();

            if (!thumbnail) {
                return false;
            }

            // Send to backend
            const response = await fetch(`${apiUrl}/boards/${whiteboardId}/thumbnail`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    thumbnailUrl: thumbnail.url,
                    thumbnailPublicId: thumbnail.publicId,
                }),
                keepalive: true,
            });

            if (!response.ok) {
                throw new Error('Failed to save thumbnail');
            }

            return true;

        } catch (error) {
            console.error('Error saving thumbnail:', error);
            return false;
        }
    }, [generateThumbnail, whiteboardId]);



    return {
        generateThumbnail,
        saveThumbnail,
    };
};