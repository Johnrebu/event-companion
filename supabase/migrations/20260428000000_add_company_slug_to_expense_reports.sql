-- Add company scoping to expense reports so each entity keeps its own records
ALTER TABLE expense_reports
ADD COLUMN IF NOT EXISTS company_slug TEXT;

UPDATE expense_reports
SET company_slug = 'corona-creative'
WHERE company_slug IS NULL OR company_slug = '';

ALTER TABLE expense_reports
ALTER COLUMN company_slug SET DEFAULT 'corona-creative';

ALTER TABLE expense_reports
ALTER COLUMN company_slug SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expense_reports_company_slug
ON expense_reports(company_slug);
