import { useState, useCallback } from 'react';
import { supabase, SUPABASE_RUNTIME_INFO } from '@/integrations/supabase/client';
import { ExpenseItem, EventDetails } from '@/types/expense';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const STORAGE_BUCKET = 'documents';

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const createStoragePath = (reportId: string, itemId: string, fileName: string) =>
    `expense-reports/${reportId}/${itemId}-${Date.now()}-${sanitizeFileName(fileName)}`;

type StoredExpenseItem = Omit<ExpenseItem, 'billAttached'> & {
    billAttached: null;
};

const formatSupabaseError = (err: unknown, fallback: string) => {
    const baseMessage = err instanceof Error ? err.message : fallback;
    const normalized = baseMessage.toLowerCase();
    const isConnectivityIssue =
        normalized.includes('failed to fetch') ||
        normalized.includes('err_name_not_resolved') ||
        normalized.includes('networkerror') ||
        normalized.includes('network request failed');

    if (!isConnectivityIssue) {
        return baseMessage;
    }

    return `${fallback}. Cannot reach Supabase at ${SUPABASE_RUNTIME_INFO.url}. Check VITE_SUPABASE_URL / VITE_SUPABASE_PROJECT_ID in deployment env vars.`;
};

export interface SavedExpenseReport {
    id: string;
    event_name: string;
    event_date: string;
    venue: string | null;
    phone: string | null;
    items: ExpenseItem[];
    gst_percentage: number;
    total_income: number;
    total_expenses: number;
    created_at: string;
    updated_at: string;
}

export function useExpenseReports() {
    const [reports, setReports] = useState<SavedExpenseReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('expense_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Parse items from JSONB
            const parsedReports = (data || []).map(report => ({
                ...report,
                items: report.items as unknown as ExpenseItem[]
            }));

            setReports(parsedReports);
            return parsedReports;
        } catch (err) {
            const message = formatSupabaseError(err, 'Failed to fetch reports');
            setError(message);
            toast.error(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Save a new report
    const saveReport = useCallback(async (
        eventDetails: EventDetails,
        items: ExpenseItem[],
        gstPercentage: number
    ) => {
        setLoading(true);
        setError(null);
        try {
            const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
            const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);

            // Insert report first to get a stable ID for storage paths.
            const baseItems: StoredExpenseItem[] = items.map(item => ({
                ...item,
                billAttached: null
            }));

            const { data, error: insertError } = await supabase
                .from('expense_reports')
                .insert({
                    event_name: eventDetails.eventName || 'Untitled Event',
                    event_date: eventDetails.date,
                    venue: eventDetails.venue || null,
                    phone: eventDetails.phone || null,
                    items: baseItems as unknown as Json,
                    gst_percentage: gstPercentage,
                    total_income: totalIncome,
                    total_expenses: totalExpenses
                })
                .select()
                .single();

            if (insertError) throw insertError;

            const reportId = data.id;
            const uploadedDocs: Array<{
                event_id: string;
                event_name: string;
                file_name: string;
                file_size: number;
                file_type: string;
                file_url: string;
                storage_path: string;
            }> = [];

            const updatedItems: StoredExpenseItem[] = [];

            for (const item of items) {
                let nextItem: StoredExpenseItem = {
                    ...item,
                    billAttached: null,
                };

                if (item.billAttached) {
                    const storagePath = createStoragePath(reportId, item.id, item.billAttached.name);
                    const { error: uploadError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .upload(storagePath, item.billAttached, {
                            contentType: item.billAttached.type || undefined,
                        });

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(storagePath);

                    nextItem = {
                        ...nextItem,
                        billFileName: item.billAttached.name,
                        billStoragePath: storagePath,
                        billUrl: publicUrlData.publicUrl,
                    };

                    uploadedDocs.push({
                        event_id: reportId,
                        event_name: eventDetails.eventName || 'Untitled Event',
                        file_name: item.billAttached.name,
                        file_size: item.billAttached.size,
                        file_type: item.billAttached.type,
                        file_url: publicUrlData.publicUrl,
                        storage_path: storagePath,
                    });
                }

                updatedItems.push(nextItem);
            }

            if (uploadedDocs.length > 0) {
                const { error: docsInsertError } = await supabase
                    .from('documents')
                    .insert(uploadedDocs);

                if (docsInsertError) {
                    // Keep report save successful even if document metadata insert fails.
                    console.error('Document metadata insert failed:', docsInsertError);
                }
            }

            const { error: updateItemsError } = await supabase
                .from('expense_reports')
                .update({ items: updatedItems as unknown as Json })
                .eq('id', reportId);

            if (updateItemsError) throw updateItemsError;

            toast.success('Report saved to database!');
            await fetchReports(); // Refresh list
            return data;
        } catch (err) {
            const message = formatSupabaseError(err, 'Failed to save report');
            setError(message);
            toast.error(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchReports]);

    // Get report by ID
    const getReportById = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('expense_reports')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            return {
                ...data,
                items: data.items as unknown as ExpenseItem[]
            } as SavedExpenseReport;
        } catch (err) {
            const message = formatSupabaseError(err, 'Failed to fetch report');
            toast.error(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a report
    const deleteReport = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const { data: reportData } = await supabase
                .from('expense_reports')
                .select('items')
                .eq('id', id)
                .single();

            const { data: documentRows } = await supabase
                .from('documents')
                .select('storage_path')
                .eq('event_id', id);

            const pathsFromItems = ((reportData?.items as unknown as ExpenseItem[] | undefined) || [])
                .map(item => item.billStoragePath)
                .filter((path): path is string => Boolean(path));

            const pathsFromDocuments = (documentRows || [])
                .map(doc => doc.storage_path)
                .filter((path): path is string => Boolean(path));

            const uniquePaths = [...new Set([...pathsFromItems, ...pathsFromDocuments])];

            if (uniquePaths.length > 0) {
                const { error: removeStorageError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove(uniquePaths);

                if (removeStorageError) {
                    console.error('Storage cleanup failed:', removeStorageError);
                }
            }

            const { error: docsDeleteError } = await supabase
                .from('documents')
                .delete()
                .eq('event_id', id);

            if (docsDeleteError) {
                console.error('Document metadata cleanup failed:', docsDeleteError);
            }

            const { error: deleteError } = await supabase
                .from('expense_reports')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            toast.success('Report deleted');
            await fetchReports(); // Refresh list
            return true;
        } catch (err) {
            const message = formatSupabaseError(err, 'Failed to delete report');
            toast.error(message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchReports]);

    return {
        reports,
        loading,
        error,
        fetchReports,
        saveReport,
        getReportById,
        deleteReport
    };
}
