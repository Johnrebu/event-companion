import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  Building2,
  FileText,
  Landmark,
  MapPin,
  Plus,
  Printer,
  RefreshCcw,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import aionionLogo from "@/assets/aionion-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import "./FeedbackFormPage.css";

type ReimbursementForm = {
  claimTitle: string;
  claimSubtitle: string;
  claimLocation: string;
  employeeName: string;
  employeeId: string;
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  declaration: string;
};

type ReimbursementItem = {
  id: string;
  expenseDate: string;
  description: string;
  invoiceAmount: string;
  remarks: string;
  companyName: string;
};

type SavedDraft = {
  form: ReimbursementForm;
  items: ReimbursementItem[];
};

const STORAGE_KEY = "aionion-reimbursement-draft";
const REMOVED_CLAIM_TITLE = "Petty Cash Expenses";
const DEFAULT_COMPANY_NAME = "Corona creative solution";
const DEFAULT_PRINT_LABEL = "Reimbursement Form";

const IMPORTANT_NOTES = [
  "Attach the respective invoices and CC the reporting head.",
  "Payments are only made to the employee's own bank account.",
  "Claims are rejected when the invoice does not match the expense description or date.",
  "Invoices must be clear, legible, and complete.",
  "Submit reimbursement claims within the weekly cycle for timely processing.",
  "Crosscheck the account number before sending the claim.",
];

const INITIAL_FORM: ReimbursementForm = {
  claimTitle: "",
  claimSubtitle: "",
  claimLocation: "",
  employeeName: "",
  employeeId: "",
  bankAccountName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  declaration: "",
};

const LEGACY_SAMPLE_FORM: ReimbursementForm = {
  claimTitle: REMOVED_CLAIM_TITLE,
  claimSubtitle: "",
  claimLocation: "Trichy",
  employeeName: "T Johnson",
  employeeId: "ACM0309",
  bankAccountName: "T Johnson",
  bankName: "IDFC",
  accountNumber: "10242735037",
  ifscCode: "IDFB0081833",
  declaration:
    "I confirm that the above expenses were incurred for business purposes and the supporting invoices will be attached for reimbursement review.",
};

const createExpenseItem = (overrides: Partial<ReimbursementItem> = {}): ReimbursementItem => ({
  id: crypto.randomUUID(),
  expenseDate: "",
  description: "",
  invoiceAmount: "",
  remarks: "",
  companyName: DEFAULT_COMPANY_NAME,
  ...overrides,
});

const INITIAL_ITEMS: ReimbursementItem[] = [createExpenseItem()];

const LEGACY_SAMPLE_ITEMS = [
  {
    expenseDate: "2026-03-20",
    description: "Chennai to Trichy Train ticket",
    invoiceAmount: "175",
    remarks: "Johnson",
    companyName: DEFAULT_COMPANY_NAME,
  },
  {
    expenseDate: "2026-03-23",
    description: "Water case for Anand sir",
    invoiceAmount: "100",
    remarks: "Johnson",
    companyName: DEFAULT_COMPANY_NAME,
  },
  {
    expenseDate: "2026-03-23",
    description: "PER DAY EXPENSES",
    invoiceAmount: "500",
    remarks: "Johnson",
    companyName: DEFAULT_COMPANY_NAME,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatDisplayDate = (value: string) => {
  if (!value) return "-";

  try {
    return format(new Date(`${value}T00:00:00`), "dd MMM yyyy");
  } catch {
    return value;
  }
};

const amountFromString = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeForm = (form?: Partial<ReimbursementForm>): ReimbursementForm => ({
  claimTitle: form?.claimTitle ?? "",
  claimSubtitle: form?.claimSubtitle ?? "",
  claimLocation: form?.claimLocation ?? "",
  employeeName: form?.employeeName ?? "",
  employeeId: form?.employeeId ?? "",
  bankAccountName: form?.bankAccountName ?? "",
  bankName: form?.bankName ?? "",
  accountNumber: form?.accountNumber ?? "",
  ifscCode: form?.ifscCode ?? "",
  declaration: form?.declaration ?? "",
});

const normalizeItem = (item?: Partial<ReimbursementItem>) => ({
  expenseDate: item?.expenseDate ?? "",
  description: item?.description ?? "",
  invoiceAmount: item?.invoiceAmount ?? "",
  remarks: item?.remarks ?? "",
  companyName: item?.companyName ?? DEFAULT_COMPANY_NAME,
});

const getEmptyDraft = (): SavedDraft => ({
  form: INITIAL_FORM,
  items: INITIAL_ITEMS,
});

const isLegacySeedDraft = (draft: Partial<SavedDraft>) =>
  JSON.stringify({
    form: normalizeForm(draft.form),
    items: Array.isArray(draft.items) ? draft.items.map((item) => normalizeItem(item)) : [],
  }) ===
  JSON.stringify({
    form: LEGACY_SAMPLE_FORM,
    items: LEGACY_SAMPLE_ITEMS,
  });

const hasDraftContent = (form: ReimbursementForm, items: ReimbursementItem[]) =>
  Object.values(form).some((value) => value.trim()) ||
  items.some(
    (item) =>
      item.expenseDate ||
      item.description.trim() ||
      item.invoiceAmount.trim() ||
      item.remarks.trim() ||
      item.companyName.trim() !== DEFAULT_COMPANY_NAME,
  );

const getInitialDraft = (): SavedDraft => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return getEmptyDraft();
    }

    const parsed = JSON.parse(saved) as Partial<SavedDraft>;
    if (isLegacySeedDraft(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return getEmptyDraft();
    }

    const savedForm: Partial<ReimbursementForm> = parsed.form ?? {};

    return {
      form: {
        ...INITIAL_FORM,
        ...savedForm,
        claimTitle:
          savedForm.claimTitle === REMOVED_CLAIM_TITLE
            ? INITIAL_FORM.claimTitle
            : savedForm.claimTitle ?? INITIAL_FORM.claimTitle,
      },
      items:
        parsed.items && parsed.items.length > 0
          ? parsed.items.map((item) => createExpenseItem(item))
          : INITIAL_ITEMS,
    };
  } catch {
    return getEmptyDraft();
  }
};

const buildReimbursementPrintHtml = (form: ReimbursementForm, items: ReimbursementItem[]) => {
  const total = items.reduce((sum, item) => sum + amountFromString(item.invoiceAmount), 0);
  const tableRows = items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatDisplayDate(item.expenseDate))}</td>
          <td>${escapeHtml(item.description || "-")}</td>
          <td class="amount">${escapeHtml(formatCurrency(amountFromString(item.invoiceAmount)))}</td>
          <td>${escapeHtml(item.remarks || "-")}</td>
          <td>${escapeHtml(item.companyName || "-")}</td>
        </tr>`,
    )
    .join("");

  const notesList = IMPORTANT_NOTES.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
  const generatedOn = escapeHtml(new Date().toLocaleString("en-IN"));
  const claimTitle = form.claimTitle.trim();
  const documentTitle = escapeHtml(claimTitle || DEFAULT_PRINT_LABEL);
  const documentHeading = claimTitle ? `<h1 class="title">${escapeHtml(claimTitle)}</h1>` : "";
  const summaryClaimTitle = escapeHtml(claimTitle || "-");
  const documentSubtitle = escapeHtml(form.claimSubtitle);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${documentTitle}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            background: #eef2f7;
            color: #0f172a;
            font-family: "Segoe UI", Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .sheet {
            max-width: 840px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #dbe3ef;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: center;
            padding: 24px 28px;
            border-bottom: 3px solid #0b5695;
            background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .brand img {
            height: 56px;
            width: auto;
          }
          .eyebrow {
            margin: 0 0 6px;
            color: #0b5695;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .title {
            margin: 0;
            font-size: 30px;
            line-height: 1.05;
            font-weight: 800;
          }
          .subtitle {
            margin: 8px 0 0;
            color: #475569;
            font-size: 13px;
          }
          .header-meta {
            min-width: 220px;
            text-align: right;
            font-size: 13px;
            color: #475569;
            line-height: 1.7;
          }
          .header-meta strong {
            color: #0f172a;
          }
          .section {
            padding: 22px 28px;
          }
          .section + .section {
            border-top: 1px solid #e2e8f0;
          }
          .section-title {
            margin: 0 0 14px;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 14px;
          }
          .detail-card {
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #f8fafc;
          }
          .detail-card span {
            display: block;
            margin-bottom: 6px;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .detail-card strong {
            font-size: 14px;
            color: #0f172a;
            word-break: break-word;
          }
          .table-shell {
            overflow: hidden;
            border: 1px solid #dbe3ef;
            border-radius: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          thead th {
            padding: 12px 10px;
            background: #0f172a;
            color: #ffffff;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          tbody td {
            padding: 12px 10px;
            border-top: 1px solid #e2e8f0;
            vertical-align: top;
            line-height: 1.5;
          }
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .amount {
            text-align: right;
            white-space: nowrap;
            font-weight: 700;
            color: #991b1b;
          }
          .summary-row-wrap {
            display: flex;
            justify-content: flex-end;
          }
          .summary-card {
            width: 320px;
            padding: 18px 20px;
            border: 1px solid #dbe3ef;
            border-radius: 16px;
            background: #f8fafc;
          }
          .summary-card h3 {
            margin: 0 0 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dbe3ef;
            font-size: 18px;
          }
          .summary-line {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .summary-line span:first-child {
            color: #64748b;
          }
          .summary-line strong {
            color: #0f172a;
          }
          .summary-line.total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #0f172a;
            font-size: 16px;
            font-weight: 800;
          }
          .notes {
            margin: 0;
            padding-left: 20px;
            color: #475569;
            line-height: 1.75;
            font-size: 13px;
          }
          .declaration {
            padding: 14px 16px;
            border: 1px solid #dbe3ef;
            border-radius: 14px;
            background: #f8fafc;
            color: #334155;
            line-height: 1.75;
            font-size: 14px;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 28px;
            margin-top: 38px;
          }
          .signature {
            padding-top: 34px;
            border-top: 1px solid #94a3b8;
            text-align: center;
            color: #475569;
            font-size: 13px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding: 18px 28px 24px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
            line-height: 1.7;
          }
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              padding: 0;
              background: #ffffff;
            }
            .sheet {
              border: none;
              box-shadow: none;
            }
            thead {
              display: table-header-group;
            }
            tr, .detail-card, .summary-card, .declaration {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <section class="header">
            <div class="brand">
              <img src="${aionionLogo}" alt="Aionion" />
              <div>
                <p class="eyebrow">${DEFAULT_PRINT_LABEL}</p>
                ${documentHeading}
                ${documentSubtitle ? `<p class="subtitle">${documentSubtitle}</p>` : ""}
              </div>
            </div>
            <div class="header-meta">
              <div><strong>Generated On</strong></div>
              <div>${generatedOn}</div>
              <div style="margin-top: 10px;"><strong>Location</strong></div>
              <div>${escapeHtml(form.claimLocation || "-")}</div>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Employee and Bank Details</h2>
            <div class="details-grid">
              <div class="detail-card"><span>Employee Name</span><strong>${escapeHtml(form.employeeName || "-")}</strong></div>
              <div class="detail-card"><span>Employee ID</span><strong>${escapeHtml(form.employeeId || "-")}</strong></div>
              <div class="detail-card"><span>Name as per Bank</span><strong>${escapeHtml(form.bankAccountName || "-")}</strong></div>
              <div class="detail-card"><span>Bank Name</span><strong>${escapeHtml(form.bankName || "-")}</strong></div>
              <div class="detail-card"><span>Account Number</span><strong>${escapeHtml(form.accountNumber || "-")}</strong></div>
              <div class="detail-card"><span>IFSC Code</span><strong>${escapeHtml(form.ifscCode || "-")}</strong></div>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Expense Details</h2>
            <div class="table-shell">
              <table>
                <thead>
                  <tr>
                    <th style="width: 56px;">S.No</th>
                    <th style="width: 110px;">Expense Date</th>
                    <th>Expense Description</th>
                    <th style="width: 132px; text-align: right;">Invoice Amount</th>
                    <th style="width: 120px;">Remarks</th>
                    <th style="width: 165px;">Company Name</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
          </section>

          <section class="section">
            <div class="summary-row-wrap">
              <div class="summary-card">
                <h3>Summary</h3>
                <div class="summary-line">
                  <span>Claim Title</span>
                  <strong>${summaryClaimTitle}</strong>
                </div>
                <div class="summary-line">
                  <span>Expense Rows</span>
                  <strong>${items.length}</strong>
                </div>
                <div class="summary-line">
                  <span>Employee</span>
                  <strong>${escapeHtml(form.employeeName || "-")}</strong>
                </div>
                <div class="summary-line total">
                  <span>Total Claim Amount</span>
                  <strong>${escapeHtml(formatCurrency(total))}</strong>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Important Notes</h2>
            <ul class="notes">${notesList}</ul>
          </section>

          <section class="section">
            <h2 class="section-title">Declaration</h2>
            <div class="declaration">${escapeHtml(form.declaration || "-")}</div>

            <div class="signatures">
              <div class="signature">Employee Signature</div>
              <div class="signature">Reporting Head</div>
              <div class="signature">Finance Approval</div>
            </div>
          </section>

          <footer class="footer">
            <div>
              <div>This is a system-generated reimbursement bill.</div>
              <div>Attach invoices and supporting documents before submission.</div>
            </div>
            <div style="text-align: right;">
              <div>Aionion Capital</div>
              <div>Event Finance and Operations</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  `;
};

const openPrintWindow = (form: ReimbursementForm, items: ReimbursementItem[]) => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Please allow popups to open the bill preview.");
    return false;
  }

  printWindow.document.write(buildReimbursementPrintHtml(form, items));
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);

  return true;
};

export default function FeedbackFormPage() {
  const [draft] = useState(getInitialDraft);
  const [form, setForm] = useState<ReimbursementForm>(draft.form);
  const [items, setItems] = useState<ReimbursementItem[]>(draft.items);

  useEffect(() => {
    if (hasDraftContent(form, items)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, items }));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [form, items]);

  const meaningfulItems = items.filter(
    (item) =>
      item.expenseDate ||
      item.description.trim() ||
      item.invoiceAmount.trim() ||
      item.remarks.trim() ||
      item.companyName.trim() !== DEFAULT_COMPANY_NAME,
  );
  const totalAmount = meaningfulItems.reduce(
    (sum, item) => sum + amountFromString(item.invoiceAmount),
    0,
  );
  const isClaimReady =
    form.employeeName.trim() &&
    form.accountNumber.trim() &&
    form.ifscCode.trim() &&
    meaningfulItems.length > 0;

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleItemChange = (
    itemId: string,
    field: keyof Omit<ReimbursementItem, "id">,
    value: string,
  ) => {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  };

  const addExpenseRow = () => {
    const lastItem = items[items.length - 1];
    setItems((current) => [
      ...current,
      createExpenseItem({
        remarks: form.employeeName || lastItem?.remarks || "",
        companyName: lastItem?.companyName || DEFAULT_COMPANY_NAME,
      }),
    ]);
  };

  const removeExpenseRow = (itemId: string) => {
    if (items.length <= 1) {
      toast.error("At least one expense row is required.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const validateClaim = () => {
    if (!form.employeeName.trim()) {
      toast.error("Employee name is required.");
      return null;
    }

    if (!form.accountNumber.trim() || !form.ifscCode.trim()) {
      toast.error("Complete the bank details before generating the claim.");
      return null;
    }

    const claimItems = meaningfulItems.filter(
      (item) => item.description.trim() && amountFromString(item.invoiceAmount) > 0,
    );

    if (claimItems.length === 0) {
      toast.error("Add at least one expense with description and amount.");
      return null;
    }

    return claimItems;
  };

  const handlePrintBill = () => {
    const claimItems = validateClaim();
    if (!claimItems) return;

    const opened = openPrintWindow(form, claimItems);
    if (opened) {
      toast.success("Bill preview opened. Use Print or Save as PDF.");
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Clear this reimbursement form and remove the saved browser draft?",
    );

    if (!confirmed) return;

    setForm(INITIAL_FORM);
    setItems(INITIAL_ITEMS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Reimbursement form cleared.");
  };

  return (
    <div className="reimbursement-page">
      <div className="reimbursement-shell">
        <section className="reimbursement-hero">
          <div className="reimbursement-brandmark">
            <img src={aionionLogo} alt="Aionion" className="no-auto-move" />
            <div className="reimbursement-hero__copy">
              <Badge className="reimbursement-badge">Aionion Finance Ops</Badge>
              <h1>{DEFAULT_PRINT_LABEL}</h1>
              {form.claimTitle.trim() ? (
                <p className="reimbursement-claim-title">{form.claimTitle.trim()}</p>
              ) : null}
              {form.claimSubtitle ? (
                <p className="reimbursement-subtitle">{form.claimSubtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="reimbursement-metrics">
            <div className="metric-card">
              <span>Claim Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="metric-card">
              <span>Expense Lines</span>
              <strong>{meaningfulItems.length}</strong>
            </div>
            <div className="metric-card">
              <span>Status</span>
              <strong>{isClaimReady ? "Ready to Export" : "Draft"}</strong>
            </div>
          </div>
        </section>

        <div className="reimbursement-grid">
          <Card className="reimbursement-card">
            <CardHeader>
              <div className="reimbursement-card__title">
                <div className="reimbursement-icon">
                  <UserRound className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Employee and Claim Details</CardTitle>
                  <CardDescription>
                    The first block reproduces the employee and bank details from the sheet.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="reimbursement-card__content">
              <div className="reimbursement-field-grid reimbursement-field-grid--two">
                <label>
                  Claim Title
                  <Input
                    name="claimTitle"
                    value={form.claimTitle}
                    onChange={handleFormChange}
                    placeholder="Enter claim title"
                  />
                </label>
                <label className="reimbursement-full-width" style={{ gridColumn: "1 / -1" }}>
                  Bill Subtitle
                  <Textarea
                    name="claimSubtitle"
                    value={form.claimSubtitle}
                    onChange={handleFormChange}
                    className="min-h-[88px]"
                    placeholder="Optional subtitle for the printable bill"
                  />
                </label>
                <label>
                  Location
                  <Input
                    name="claimLocation"
                    value={form.claimLocation}
                    onChange={handleFormChange}
                    placeholder="Enter city"
                  />
                </label>
                <label>
                  Employee Name
                  <Input
                    name="employeeName"
                    value={form.employeeName}
                    onChange={handleFormChange}
                    placeholder="Enter employee name"
                  />
                </label>
                <label>
                  Employee ID
                  <Input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleFormChange}
                    placeholder="Enter employee ID"
                  />
                </label>
                <label>
                  Name as per Bank
                  <Input
                    name="bankAccountName"
                    value={form.bankAccountName}
                    onChange={handleFormChange}
                    placeholder="Enter account holder name"
                  />
                </label>
                <label>
                  Bank Name
                  <Input
                    name="bankName"
                    value={form.bankName}
                    onChange={handleFormChange}
                    placeholder="Enter bank name"
                  />
                </label>
                <label>
                  Account Number
                  <Input
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleFormChange}
                    placeholder="Enter account number"
                  />
                </label>
                <label>
                  IFSC Code
                  <Input
                    name="ifscCode"
                    value={form.ifscCode}
                    onChange={handleFormChange}
                    placeholder="Enter IFSC code"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="reimbursement-card reimbursement-card--sidebar">
            <CardHeader>
              <div className="reimbursement-card__title">
                <div className="reimbursement-icon reimbursement-icon--accent">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Claim Snapshot</CardTitle>
                  <CardDescription>
                    Use this layout for reimbursement claims across cities, events, and teams.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="reimbursement-sidebar">
              <div className="snapshot-item">
                <div className="snapshot-item__label">
                  <MapPin className="h-4 w-4" />
                  Claim location
                </div>
                <strong>{form.claimLocation || "-"}</strong>
              </div>

              <div className="snapshot-item">
                <div className="snapshot-item__label">
                  <Landmark className="h-4 w-4" />
                  Bank verification
                </div>
                <strong>
                  {form.bankName && form.accountNumber && form.ifscCode ? "Complete" : "Pending"}
                </strong>
              </div>

              <div className="snapshot-item">
                <div className="snapshot-item__label">
                  <Building2 className="h-4 w-4" />
                  Default company
                </div>
                <strong>{meaningfulItems[0]?.companyName || DEFAULT_COMPANY_NAME}</strong>
              </div>

              <div className="reimbursement-status">
                <span className="reimbursement-status__label">Export status</span>
                <Badge
                  variant="outline"
                  className={
                    isClaimReady
                      ? "reimbursement-ready reimbursement-ready--ready"
                      : "reimbursement-ready reimbursement-ready--draft"
                  }
                >
                  {isClaimReady ? "Ready" : "Needs attention"}
                </Badge>
              </div>

              <div className="notes-card">
                <div className="notes-card__header">
                  <AlertCircle className="h-4 w-4" />
                  Important Notes
                </div>
                <ul className="notes-card__list">
                  {IMPORTANT_NOTES.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="reimbursement-card reimbursement-ledger">
          <CardHeader className="reimbursement-ledger__header">
            <div>
              <CardTitle>Expense Ledger</CardTitle>
              <CardDescription>
                Each row matches the original sheet: date, description, invoice amount,
                remarks, and company name.
              </CardDescription>
            </div>
            <Button type="button" onClick={addExpenseRow} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </CardHeader>
          <CardContent>
            <div className="reimbursement-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[64px]">S. No</TableHead>
                    <TableHead className="min-w-[150px]">Expense Date</TableHead>
                    <TableHead className="min-w-[300px]">Expense Description</TableHead>
                    <TableHead className="min-w-[160px]">Invoice Amount</TableHead>
                    <TableHead className="min-w-[180px]">Remarks If Any</TableHead>
                    <TableHead className="min-w-[220px]">Company Name</TableHead>
                    <TableHead className="w-[72px] text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-slate-700">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.expenseDate}
                          onChange={(event) =>
                            handleItemChange(item.id, "expenseDate", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(event) =>
                            handleItemChange(item.id, "description", event.target.value)
                          }
                          placeholder="Describe the expense"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.invoiceAmount}
                          onChange={(event) =>
                            handleItemChange(item.id, "invoiceAmount", event.target.value)
                          }
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.remarks}
                          onChange={(event) =>
                            handleItemChange(item.id, "remarks", event.target.value)
                          }
                          placeholder="Optional note"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.companyName}
                          onChange={(event) =>
                            handleItemChange(item.id, "companyName", event.target.value)
                          }
                          placeholder={DEFAULT_COMPANY_NAME}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExpenseRow(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                    <TableCell colSpan={3} className="text-right text-muted-foreground">
                      {meaningfulItems.length} claim line(s)
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="reimbursement-card">
          <CardHeader>
            <div className="reimbursement-card__title">
              <div className="reimbursement-icon">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Declaration and Export</CardTitle>
                <CardDescription>
                  Keep the declaration editable, then open a bill-style document for print or PDF save.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="reimbursement-card__content">
            <label className="reimbursement-full-width">
              Declaration
              <Textarea
                name="declaration"
                value={form.declaration}
                onChange={handleFormChange}
                className="min-h-[120px]"
                placeholder="Enter a short declaration for this claim"
              />
            </label>

            <div className="reimbursement-actionbar">
              <div className="reimbursement-actionbar__meta">
                <span>Auto-saved to this browser.</span>
                <span>Use the print flow to save the bill as PDF.</span>
                <span>
                  Latest visible total: <strong>{formatCurrency(totalAmount)}</strong>
                </span>
                <span>
                  Last expense date:{" "}
                  <strong>
                    {meaningfulItems.length > 0
                      ? formatDisplayDate(
                          meaningfulItems[meaningfulItems.length - 1]?.expenseDate || "",
                        )
                      : "-"}
                  </strong>
                </span>
              </div>

              <div className="reimbursement-actionbar__buttons">
                <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Clear Form
                </Button>
                <Button type="button" onClick={handlePrintBill} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
