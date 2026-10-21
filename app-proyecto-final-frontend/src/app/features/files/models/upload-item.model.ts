// Interface for each upload item in the queue
export interface UploadItem {
    id: string;
    file: File;
    fileName: string;
    fileSize: number;
    folderId: string | null;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}
