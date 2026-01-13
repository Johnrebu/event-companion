-- Drop the overly permissive "Allow all" policy
DROP POLICY IF EXISTS "Allow all" ON documents;

-- Create separate policies for each operation with appropriate restrictions
-- Allow anyone to read documents (SELECT) - this is intentional for public access
CREATE POLICY "Anyone can view documents" 
ON documents 
FOR SELECT 
USING (true);

-- For INSERT, UPDATE, DELETE - we need to restrict these operations
-- Since there's no authentication set up yet and no user_id column,
-- we'll create restrictive policies that only allow authenticated users
CREATE POLICY "Authenticated users can insert documents" 
ON documents 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents" 
ON documents 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete documents" 
ON documents 
FOR DELETE 
TO authenticated
USING (true);