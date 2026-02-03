-- Create kanban_columns table
CREATE TABLE IF NOT EXISTS public.kanban_columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create kanban_tasks table
CREATE TABLE IF NOT EXISTS public.kanban_tasks (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    column_id TEXT REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
    assignee_id TEXT,
    -- 'naveen', 'johnson', 'kavya'
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
-- Permissive policies for anonymous access (following the project's current pattern)
CREATE POLICY "Enable all for kanban_columns" ON public.kanban_columns FOR ALL TO anon,
authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for kanban_tasks" ON public.kanban_tasks FOR ALL TO anon,
authenticated USING (true) WITH CHECK (true);
-- Enable Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE kanban_columns;
ALTER PUBLICATION supabase_realtime
ADD TABLE kanban_tasks;
-- Insert default columns if they don't exist
INSERT INTO public.kanban_columns (id, title, "order")
VALUES ('todo', 'To Do', 1),
    ('in-progress', 'In Progress', 2),
    ('done', 'Done', 3) ON CONFLICT (id) DO NOTHING;