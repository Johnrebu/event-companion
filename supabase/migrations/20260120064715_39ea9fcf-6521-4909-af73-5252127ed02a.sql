-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create expense_reports table with user ownership
CREATE TABLE IF NOT EXISTS public.expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.expense_reports ENABLE ROW LEVEL SECURITY;

-- Create ownership-based policies
CREATE POLICY "Anyone can view expense reports"
ON public.expense_reports
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own expense reports"
ON public.expense_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense reports"
ON public.expense_reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense reports"
ON public.expense_reports
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_expense_reports_updated_at
BEFORE UPDATE ON public.expense_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();