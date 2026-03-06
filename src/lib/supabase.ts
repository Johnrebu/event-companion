import { createClient } from '@supabase/supabase-js';

const normalizeSupabaseUrl = (rawUrl?: string, projectId?: string) => {
    const cleaned = (rawUrl || '').trim().replace(/^['"]|['"]$/g, '');
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return cleaned;
    }
    if (cleaned) {
        return `https://${cleaned.replace(/^https?:\/\//, '')}`;
    }
    if (projectId) {
        return `https://${projectId}.supabase.co`;
    }
    return 'https://placeholder.supabase.co';
};

const supabaseUrl = normalizeSupabaseUrl(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PROJECT_ID
);
// Lovable Cloud uses PUBLISHABLE_KEY, fallback to ANON_KEY for manual setup
const supabaseAnonKey =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim().replace(/^['"]|['"]$/g, '') ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^['"]|['"]$/g, '') ||
    'placeholder';

if (supabaseUrl.includes('placeholder.supabase.co') || supabaseAnonKey === 'placeholder') {
    console.warn(
        'Supabase credentials not found. Make sure Lovable Cloud is configured or create a .env.local file.'
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

export const STORAGE_BUCKET = 'documents';

