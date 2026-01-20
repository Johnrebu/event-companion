import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseItem, EventDetails } from '@/types/expense';
import { toast } from 'sonner';

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
            const message = err instanceof Error ? err.message : 'Failed to fetch reports';
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

            // Clean items for storage (remove File objects)
            const cleanItems = items.map(item => ({
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
                    items: cleanItems,
                    gst_percentage: gstPercentage,
                    total_income: totalIncome,
                    total_expenses: totalExpenses
                })
                .select()
                .single();

            if (insertError) throw insertError;

            toast.success('Report saved to database!');
            await fetchReports(); // Refresh list
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save report';
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
            const message = err instanceof Error ? err.message : 'Failed to fetch report';
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
            const { error: deleteError } = await supabase
                .from('expense_reports')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            toast.success('Report deleted');
            await fetchReports(); // Refresh list
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete report';
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
