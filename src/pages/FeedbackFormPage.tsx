import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Paperclip,
  Eye,
  Image as ImageIcon,
  AlertCircle,
  Building2,
  Download,
  FileText,
  Landmark,
  MapPin,
  Plus,
  Printer,
  RefreshCcw,
  Trash2,
  UserRound,
  Wallet,
  X,
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

export type ReimbursementBill = {
  fileName: string;
  url?: string;
  size: number;
};

type ReimbursementItem = {
  id: string;
  expenseDate: string;
  description: string;
  invoiceAmount: string;
  remarks: string;
  companyName: string;
  billAttached: boolean | null;
  billFileName: string;
  billUrl?: string;
  bills?: ReimbursementBill[];
};

type SavedDraft = {
  form: ReimbursementForm;
  items: ReimbursementItem[];
};

const STORAGE_KEY = "aionion-reimbursement-draft";
const REMOVED_CLAIM_TITLE = "Petty Cash Expenses";
const DEFAULT_COMPANY_NAME = "Corona creative solution";
const DEFAULT_PRINT_LABEL = "Reimbursement Form";
const WORD_DOCUMENT_MIME_TYPE = "application/msword;charset=utf-8";

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
  billAttached: null,
  billFileName: "",
  bills: [],
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

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const isImageFileName = (name: string, url?: string) =>
  Boolean(url?.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name));

const isPdfFileName = (name: string, url?: string) =>
  Boolean(url?.startsWith("data:application/pdf") || /\.pdf$/i.test(name));

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

const sanitizeFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const getExportFileName = (form: ReimbursementForm, extension: string) => {
  const employeeName = sanitizeFileNamePart(form.employeeName);
  const claimTitle = sanitizeFileNamePart(form.claimTitle);
  const baseName = [employeeName, claimTitle || "reimbursement-form"]
    .filter(Boolean)
    .join("-");

  return `${baseName || "reimbursement-form"}-${format(new Date(), "yyyy-MM-dd")}.${extension}`;
};

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
  billAttached: item?.billAttached ?? null,
  billFileName: item?.billFileName ?? "",
  billUrl: item?.billUrl,
  bills:
    item?.bills && item.bills.length > 0
      ? item.bills
      : item?.billFileName
        ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
        : [],
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
      item.companyName.trim() !== DEFAULT_COMPANY_NAME ||
      item.billFileName ||
      item.billUrl ||
      (item.bills && item.bills.length > 0),
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
          ? parsed.items.map((item) =>
              createExpenseItem({
                ...item,
                bills:
                  item.bills && item.bills.length > 0
                    ? item.bills
                    : item.billFileName
                      ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
                      : [],
              }),
            )
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
      (item, index) => {
        const itemBills =
          item.bills && item.bills.length > 0
            ? item.bills
            : item.billFileName
              ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
              : [];
        const billBadge =
          itemBills.length > 1
            ? ` 📎 (${itemBills.length})`
            : itemBills.length === 1
              ? ` 📎`
              : "";

        return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatDisplayDate(item.expenseDate))}</td>
          <td>${escapeHtml(item.description || "-")}</td>
          <td class="amount">${escapeHtml(formatCurrency(amountFromString(item.invoiceAmount)))}</td>
          <td>${escapeHtml(item.remarks || "-")}${billBadge}</td>
          <td>${escapeHtml(item.companyName || "-")}</td>
        </tr>`;
      },
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

          ${(() => {
            const allAttachedBills: {
              itemIndex: number;
              description: string;
              amount: number;
              bill: ReimbursementBill;
            }[] = [];

            items.forEach((item, index) => {
              const itemBills: ReimbursementBill[] =
                item.bills && item.bills.length > 0
                  ? item.bills
                  : item.billFileName || item.billUrl
                    ? [{ fileName: item.billFileName || "Attached Document", url: item.billUrl, size: 0 }]
                    : [];

              itemBills.forEach((bill) => {
                allAttachedBills.push({
                  itemIndex: index + 1,
                  description: item.description || "Expense Description",
                  amount: amountFromString(item.invoiceAmount),
                  bill,
                });
              });
            });

            if (allAttachedBills.length === 0) return "";

            return `
          <section class="section" style="page-break-before: always;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 class="section-title" style="margin: 0;">Attached Bills & Supporting Receipts</h2>
              <span style="font-size: 12px; font-weight: 700; color: #0b5695; background: #f0f9ff; padding: 4px 12px; border-radius: 20px; border: 1px solid #bae6fd;">
                ${allAttachedBills.length} Attached ${allAttachedBills.length === 1 ? "Document" : "Documents"}
              </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${allAttachedBills
                .map(({ itemIndex, description, amount, bill }) => {
                  const isImage = isImageFileName(bill.fileName, bill.url);
                  const isPdf = isPdfFileName(bill.fileName, bill.url);

                  return `
                    <div style="border: 1px solid #cbd5e1; border-radius: 16px; background: #ffffff; padding: 18px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); page-break-inside: avoid;">
                      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 14px;">
                        <div>
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0b5695;">
                            Item #${itemIndex} Attachment
                          </span>
                          <h3 style="margin: 2px 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                            ${escapeHtml(description)}
                          </h3>
                        </div>
                        <div style="text-align: right;">
                          <div style="font-size: 14px; font-weight: 700; color: #991b1b;">
                            ${amount > 0 ? escapeHtml(formatCurrency(amount)) : "-"}
                          </div>
                          <div style="font-size: 12px; color: #64748b;">
                            📎 ${escapeHtml(bill.fileName || "Attached Bill")} ${bill.size > 0 ? `(${formatFileSize(bill.size)})` : ""}
                          </div>
                        </div>
                      </div>

                      ${isImage && bill.url
                        ? `
                        <div style="text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 12px;">
                          <img src="${bill.url}" alt="${escapeHtml(bill.fileName)}" style="max-width: 100%; max-height: 540px; width: auto; height: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                        </div>
                      `
                        : isPdf && bill.url
                          ? `
                        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; text-align: center;">
                          <div style="font-size: 36px; margin-bottom: 6px;">📄</div>
                          <div style="font-size: 14px; font-weight: 700; color: #0369a1;">
                            ${escapeHtml(bill.fileName)}
                          </div>
                          <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">
                            PDF document attached to this claim item.
                          </div>
                          <div style="margin-top: 12px;">
                            <a href="${bill.url}" download="${escapeHtml(bill.fileName)}" style="display: inline-block; background: #0284c7; color: #ffffff; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
                              Download / View PDF Attachment
                            </a>
                          </div>
                        </div>
                      `
                          : `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 28px;">📎</div>
                            <div>
                              <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
                                ${escapeHtml(bill.fileName || "Attached Document")}
                              </div>
                              <div style="font-size: 12px; color: #64748b;">
                                Supporting document attached to expense item
                              </div>
                            </div>
                          </div>
                          ${bill.url
                            ? `
                            <a href="${bill.url}" download="${escapeHtml(bill.fileName || "attached-bill")}" style="background: #0f172a; color: #ffffff; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
                              View Document
                            </a>
                          `
                            : ""
                          }
                        </div>
                      `
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
          </section>
          `;
          })()}

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

const downloadWordDocument = (form: ReimbursementForm, items: ReimbursementItem[]) => {
  const documentBlob = new Blob(["\ufeff", buildReimbursementPrintHtml(form, items)], {
    type: WORD_DOCUMENT_MIME_TYPE,
  });
  const documentUrl = URL.createObjectURL(documentBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = documentUrl;
  downloadLink.download = getExportFileName(form, "doc");
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => URL.revokeObjectURL(documentUrl), 0);
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

  const handleFileUpload = async (
    itemId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const targetItem = items.find((i) => i.id === itemId);
    const currentBills: ReimbursementBill[] =
      targetItem?.bills && targetItem.bills.length > 0
        ? [...targetItem.bills]
        : targetItem?.billFileName
          ? [{ fileName: targetItem.billFileName, url: targetItem.billUrl, size: 0 }]
          : [];

    const existingNames = new Set(currentBills.map((b) => b.fileName.toLowerCase()));
    let skippedCount = 0;
    let oversizedCount = 0;

    const filePromises: Promise<ReimbursementBill | null>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        oversizedCount++;
        continue;
      }
      if (existingNames.has(file.name.toLowerCase())) {
        skippedCount++;
        continue;
      }
      existingNames.add(file.name.toLowerCase());

      const p = new Promise<ReimbursementBill | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          resolve({
            fileName: file.name,
            url: dataUrl,
            size: file.size,
          });
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
      filePromises.push(p);
    }

    const loaded = await Promise.all(filePromises);
    const validLoaded = loaded.filter((b): b is ReimbursementBill => b !== null);

    if (validLoaded.length > 0) {
      const updatedBills = [...currentBills, ...validLoaded];
      setItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                billAttached: true,
                billFileName: updatedBills[0]?.fileName || "",
                billUrl: updatedBills[0]?.url,
                bills: updatedBills,
              }
            : item,
        ),
      );
      toast.success(
        validLoaded.length === 1
          ? `Attached "${validLoaded[0].fileName}"`
          : `${validLoaded.length} bills attached successfully`,
      );
    }

    if (oversizedCount > 0) {
      toast.error(`${oversizedCount} file(s) exceeded the 10MB limit and were skipped`);
    }
    if (skippedCount > 0) {
      toast.info(`${skippedCount} duplicate file(s) skipped`);
    }

    // Reset input value so same files can be re-selected if deleted
    event.target.value = "";
  };

  const removeSingleBill = (itemId: string, billIndex: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        const currentBills =
          item.bills && item.bills.length > 0
            ? [...item.bills]
            : item.billFileName
              ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
              : [];

        currentBills.splice(billIndex, 1);
        return {
          ...item,
          billAttached: currentBills.length > 0,
          billFileName: currentBills[0]?.fileName || "",
          billUrl: currentBills[0]?.url || undefined,
          bills: currentBills,
        };
      }),
    );
    toast.success("Bill removed");
  };

  const removeAttachment = (itemId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, billAttached: null, billFileName: "", billUrl: undefined, bills: [] }
          : item,
      ),
    );
    toast.success("All attachments removed");
  };

  const viewBill = (bill: ReimbursementBill) => {
    if (!bill.url) return;
    const win = window.open();
    if (win) {
      if (bill.url.startsWith("data:application/pdf")) {
        win.document.write(
          `<iframe src="${bill.url}" width="100%" height="100%" style="border:none;"></iframe>`,
        );
      } else {
        win.document.write(
          `<img src="${bill.url}" style="max-width:100%; max-height:100vh; object-fit:contain; margin:auto; display:block;" />`,
        );
      }
    }
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

  const handleDownloadWord = () => {
    const claimItems = validateClaim();
    if (!claimItems) return;

    downloadWordDocument(form, claimItems);
    toast.success("Word document downloaded.");
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
                    <TableHead className="min-w-[220px]">Attach Bill</TableHead>
                    <TableHead className="w-[72px] text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const itemBills: ReimbursementBill[] =
                      item.bills && item.bills.length > 0
                        ? item.bills
                        : item.billFileName
                          ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
                          : [];

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="align-top font-semibold text-slate-700">{index + 1}</TableCell>
                        <TableCell className="align-top">
                          <Input
                            type="date"
                            value={item.expenseDate}
                            onChange={(event) =>
                              handleItemChange(item.id, "expenseDate", event.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            value={item.description}
                            onChange={(event) =>
                              handleItemChange(item.id, "description", event.target.value)
                            }
                            placeholder="Describe the expense"
                          />
                        </TableCell>
                        <TableCell className="align-top">
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
                        <TableCell className="align-top">
                          <Input
                            value={item.remarks}
                            onChange={(event) =>
                              handleItemChange(item.id, "remarks", event.target.value)
                            }
                            placeholder="Optional note"
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            value={item.companyName}
                            onChange={(event) =>
                              handleItemChange(item.id, "companyName", event.target.value)
                            }
                            placeholder={DEFAULT_COMPANY_NAME}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          {itemBills.length > 0 ? (
                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                              <div className="flex flex-col gap-1">
                                {itemBills.map((bill, billIdx) => (
                                  <div
                                    key={`${bill.fileName}-${billIdx}`}
                                    className="flex items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-white p-1.5 text-xs shadow-sm transition-colors hover:border-slate-300"
                                  >
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                                      {isImageFileName(bill.fileName, bill.url) ? (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                                          {bill.url ? (
                                            <img
                                              src={bill.url}
                                              alt={bill.fileName}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                                          )}
                                        </div>
                                      ) : isPdfFileName(bill.fileName, bill.url) ? (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-50 text-red-500">
                                          <FileText className="h-3.5 w-3.5" />
                                        </div>
                                      ) : (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-500">
                                          <FileText className="h-3.5 w-3.5" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1 overflow-hidden">
                                        <p
                                          className="truncate font-medium text-slate-700 leading-tight"
                                          title={bill.fileName}
                                        >
                                          {bill.fileName}
                                        </p>
                                        {bill.size > 0 && (
                                          <span className="text-[10px] text-slate-400">
                                            {formatFileSize(bill.size)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                      {bill.url && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                          title="View bill"
                                          onClick={() => viewBill(bill)}
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                                        title="Remove bill"
                                        onClick={() => removeSingleBill(item.id, billIdx)}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900">
                                <Paperclip className="h-3 w-3" />
                                <span>+ Attach More</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                                  onChange={(e) => handleFileUpload(item.id, e)}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                              <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900">
                                <Paperclip className="h-3.5 w-3.5" />
                                <span>Attach</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
                                  onChange={(e) => handleFileUpload(item.id, e)}
                                />
                              </label>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-top">
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
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                    <TableCell colSpan={4} className="text-right text-muted-foreground">
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
                  Keep the declaration editable, then export the bill for print, PDF, or Word.
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
                <span>Use the export actions to save the bill as PDF or Word.</span>
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
                <Button type="button" onClick={handleDownloadWord} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Word
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
