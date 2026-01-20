-- Drop existing policies on expense_reports
DROP POLICY IF EXISTS "Allow all access to expense_reports" ON expense_reports;
DROP POLICY IF EXISTS "Anyone can view expense reports" ON expense_reports;
DROP POLICY IF EXISTS "Users can insert their own expense reports" ON expense_reports;
DROP POLICY IF EXISTS "Users can update their own expense reports" ON expense_reports;
DROP POLICY IF EXISTS "Users can delete their own expense reports" ON expense_reports;

-- Create a permissive policy for anonymous access
CREATE POLICY "Enable all operations for all users" ON expense_reports
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);