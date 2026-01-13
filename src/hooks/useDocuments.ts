import { useState, useEffect, useCallback } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { Document } from '@/types/document';

export function useDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async (eventId?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('documents')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (eventId) {
                query = query.eq('event_id', eventId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setDocuments(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch documents');
            console.error('Error fetching documents:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadDocument = useCallback(
        async (
            file: File,
            eventId: string,
            eventName: string
        ): Promise<Document | null> => {
            try {
                // Generate unique file path
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const storagePath = `${eventId}/${timestamp}_${safeName}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(storagePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(storagePath);

                // Save metadata to database
                const newDoc = {
                    event_id: eventId,
                    event_name: eventName,
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    file_url: urlData.publicUrl,
                    storage_path: storagePath,
                };

                const { data, error: insertError } = await supabase
                    .from('documents')
                    .insert(newDoc)
                    .select()
                    .single();

                if (insertError) throw insertError;

                setDocuments((prev) => [data, ...prev]);
                return data;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to upload document');
                console.error('Error uploading document:', err);
                return null;
            }
        },
        []
    );

    const deleteDocument = useCallback(async (doc: Document): Promise<boolean> => {
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([doc.storage_path]);

            if (storageError) throw storageError;

            // Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (dbError) throw dbError;

            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete document');
            console.error('Error deleting document:', err);
            return false;
        }
    }, []);

    const getEventNames = useCallback(() => {
        const eventMap = new Map<string, string>();
        documents.forEach((doc) => {
            if (!eventMap.has(doc.event_id)) {
                eventMap.set(doc.event_id, doc.event_name);
            }
        });
        return Array.from(eventMap.entries()).map(([id, name]) => ({ id, name }));
    }, [documents]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return {
        documents,
        isLoading,
        error,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        getEventNames,
    };
}
