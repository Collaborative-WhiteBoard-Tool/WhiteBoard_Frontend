interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File or Blob to upload
 * @param folder - Optional folder path
 * @returns Cloudinary response with secure_url and public_id
 */
export const uploadToCloudinary = async (
    file: File | Blob,
    folder?: string
): Promise<CloudinaryUploadResponse> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    if (folder) {
        formData.append('folder', folder);
    }

    // Optional: Add tags for better organization
    formData.append('tags', 'whiteboard,thumbnail');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
    }

    return response.json();
};

/**
 * Convert canvas to Blob
 */
export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            'image/jpeg',
            0.8 // Quality: 0.8 = good balance between quality and size
        );
    });
};