export interface Document {
    id: string;
    event_id: string;
    event_name: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    storage_path: string;
    uploaded_at: string;
}

export type DocumentFileType = 'image' | 'pdf' | 'word' | 'other';

export function getFileType(mimeType: string): DocumentFileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        return 'word';
    }
    return 'other';
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
