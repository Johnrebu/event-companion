export interface ExpenseItem {
  id: string;
  sNo: number;
  particulars: string;
  income: number;
  expenses: number;
  remarks: string;
  billAttached: File | null;
  billFileName: string;
  billUrl?: string;
  billStoragePath?: string;
}

export interface EventDetails {
  eventName: string;
  date: string;
  venue: string;
  phone: string;
}

export interface ExpenseReport {
  eventDetails: EventDetails;
  items: ExpenseItem[];
  gstPercentage: number;
  companySlug?: string;
}
