export interface ExpenseBill {
  file: File;
  fileName: string;
  url?: string; // data URL for image preview or object URL for PDFs
  size: number;
}

export interface ExpenseItem {
  id: string;
  sNo: number;
  particulars: string;
  income: number;
  expenses: number;
  remarks: string;
  // Legacy single‑bill fields (keep for backward compatibility)
  billAttached: File | null;
  billFileName: string;
  billUrl?: string;
  billStoragePath?: string;
  // New multi‑bill support
  bills?: ExpenseBill[];
}

export interface EventDetails {
  eventName: string;
  date: string;
  venue: string;
  phone: string;
  preparedBy: string;
  reportingManager: string;
}

export interface ExpenseReport {
  eventDetails: EventDetails;
  items: ExpenseItem[];
  gstPercentage: number;
  companySlug?: string;
}
