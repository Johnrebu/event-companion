-- Create expense_reports table
CREATE TABLE IF NOT EXISTS expense_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    venue TEXT,
    phone TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    gst_percentage NUMERIC DEFAULT 18,
    total_income NUMERIC DEFAULT 0,
    total_expenses NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_expense_reports_event_date ON expense_reports(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_reports_created_at ON expense_reports(created_at DESC);
-- Enable Row Level Security (RLS)
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
-- Create policy to allow all operations (adjust as needed for auth)
CREATE POLICY "Allow all access to expense_reports" ON expense_reports FOR ALL USING (true) WITH CHECK (true);