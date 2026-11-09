import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Download,
  FileText,
  History,
  Printer,
  Receipt,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EventHeader from "@/components/EventHeader";
import ExpenseTable from "@/components/ExpenseTable";
import TotalSummary from "@/components/TotalSummary";
import Calculator from "@/components/Calculator";
import CalculatorButton from "@/components/CalculatorButton";
import BillScanner, { type ScannedBill } from "@/components/BillScanner";
import { buildExpensePrintHtml } from "@/lib/expensePrint";
import {
  saveExpenseDraftToStorage,
  loadExpenseDraftFromStorage,
  findOtherSavedDrafts,
  hasMeaningfulContent,
  type AvailableDraftInfo,
} from "@/lib/expenseDraftStorage";
import {
  DEFAULT_EXPENSE_COMPANY_SLUG,
  EXPENSE_COMPANIES,
  getExpenseCompany,
  getExpenseCompanyPath,
  getExpenseDraftStorageKey,
  type ExpenseCompany,
} from "@/lib/expenseCompanies";
import { ExpenseItem, ExpenseBill, EventDetails } from "@/types/expense";

type ExpenseDraftState = {
  eventDetails: EventDetails;
  items: ExpenseItem[];
  gstPercentage: number;
};

const escapeCsvCell = (value: string | number) => {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const sanitizeFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const sanitizeItemBills = (item: ExpenseItem): ExpenseBill[] => {
  const itemBills: ExpenseBill[] =
    item.bills && item.bills.length > 0
      ? item.bills
      : item.billFileName || item.billUrl
        ? [
            {
              file: (item.billAttached as File) || (undefined as any),
              fileName: item.billFileName || "Attached Bill",
              url: item.billUrl,
              size: 0,
            },
          ]
        : [];

  if (itemBills.length <= 1) {
    return itemBills;
  }

  // Multi-bill validation: detect if subsequent bills were erroneously poisoned
  // with the first bill's URL by the previous bug
  const firstBillUrl = itemBills[0]?.url;
  const firstBillName = itemBills[0]?.fileName;

  return itemBills.map((bill, bIdx) => {
    if (
      bIdx > 0 &&
      bill.url &&
      firstBillUrl &&
      bill.url === firstBillUrl &&
      bill.fileName &&
      bill.fileName !== firstBillName
    ) {
      // Clear poisoned duplicate URL
      return { ...bill, url: undefined };
    }
    return bill;
  });
};

const createEmptyItem = (sNo: number): ExpenseItem => ({
  id: crypto.randomUUID(),
  sNo,
  particulars: "",
  income: 0,
  expenses: 0,
  remarks: "",
  billAttached: null,
  billFileName: "",
  billUrl: undefined,
  billStoragePath: undefined,
});

const dataUrlToFile = (dataUrl: string, name: string) => {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
};

const createDefaultEventDetails = (): EventDetails => ({
  eventName: "",
  date: new Date().toISOString().split("T")[0],
  venue: "",
  phone: "",
  preparedBy: "",
  reportingManager: "",
});

const normalizeEventDetails = (details?: Partial<EventDetails>): EventDetails => ({
  ...createDefaultEventDetails(),
  ...details,
});

const ensureBillsHaveUrls = async (items: ExpenseItem[]): Promise<ExpenseItem[]> => {
  return Promise.all(
    items.map(async (item) => {
      const itemBills = sanitizeItemBills(item);

      if (itemBills.length === 0) {
        return item;
      }

      const firstBillName = itemBills[0]?.fileName;
      const firstBillUrl = itemBills[0]?.url;

      const updatedBills = await Promise.all(
        itemBills.map(async (bill, bIdx) => {
          let currentUrl = bill.url;

          // Detect poisoned duplicate
          if (
            bIdx > 0 &&
            currentUrl &&
            firstBillUrl &&
            currentUrl === firstBillUrl &&
            bill.fileName &&
            bill.fileName !== firstBillName
          ) {
            currentUrl = undefined;
          }

          // 1. If bill.file is available, ALWAYS convert file to data URL
          if ((bill.file as unknown) instanceof File || (bill.file as unknown) instanceof Blob) {
            try {
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(bill.file as unknown as File);
              });
              return { ...bill, url: dataUrl };
            } catch (err) {
              console.error("Failed to read bill file as data URL:", err);
            }
          }

          // 2. If bill already has valid distinct data URL or http URL, it's ready
          if (currentUrl && (currentUrl.startsWith("data:") || currentUrl.startsWith("http"))) {
            return { ...bill, url: currentUrl };
          }

          // 3. If bill.url is a blob: URL, fetch and convert to base64 data URL
          if (currentUrl && currentUrl.startsWith("blob:")) {
            try {
              const res = await fetch(currentUrl);
              const blob = await res.blob();
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              return { ...bill, url: dataUrl };
            } catch (err) {
              console.warn("Failed to convert blob URL to data URL:", err);
            }
          }

          // 4. Fallback to item.billUrl ONLY if there is exactly 1 bill in this item (legacy single-bill item)
          if (itemBills.length === 1 && item.billUrl && !currentUrl) {
            return { ...bill, url: item.billUrl };
          }

          // In multi-bill items, NEVER copy item.billUrl (Bill #1) onto other bills!
          return { ...bill, url: currentUrl };
        }),
      );

      return {
        ...item,
        bills: updatedBills,
        billUrl: updatedBills[0]?.url || undefined,
      };
    }),
  );
};

const createInitialState = (storageKey: string): ExpenseDraftState => {
  try {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      const data = JSON.parse(saved);

      return {
        eventDetails: normalizeEventDetails(data.eventDetails),
        items:
          data.items?.length > 0
            ? data.items.map((item: ExpenseItem) => {
                const itemBills = sanitizeItemBills(item);

                return {
                  ...item,
                  billAttached: null,
                  billFileName: item.billFileName || itemBills[0]?.fileName || "",
                  billUrl: itemBills[0]?.url || undefined,
                  bills: itemBills,
                };
              })
            : [createEmptyItem(1), createEmptyItem(2), createEmptyItem(3)],
        gstPercentage: data.gstPercentage ?? 18,
      };
    }
  } catch (error) {
    console.error("Failed to load saved expense data:", error);
  }

  return {
    eventDetails: createDefaultEventDetails(),
    items: [createEmptyItem(1), createEmptyItem(2), createEmptyItem(3)],
    gstPercentage: 18,
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const ExpenseWorkspace = ({ company }: { company: ExpenseCompany }) => {
  const storageKey = getExpenseDraftStorageKey(company.slug);
  const [initialState] = useState<ExpenseDraftState>(() => createInitialState(storageKey));

  const [eventDetails, setEventDetails] = useState<EventDetails>(initialState.eventDetails);
  const [items, setItems] = useState<ExpenseItem[]>(initialState.items);
  const [gstPercentage, setGstPercentage] = useState(initialState.gstPercentage);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [otherDrafts, setOtherDrafts] = useState<AvailableDraftInfo[]>([]);
  const [isDismissedDraftAlert, setIsDismissedDraftAlert] = useState(false);
  const [isDraftRecoveryOpen, setIsDraftRecoveryOpen] = useState(false);

  // Asynchronously load rich draft from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    const loadRichDraft = async () => {
      try {
        const saved = await loadExpenseDraftFromStorage(storageKey);
        if (saved && isMounted) {
          if (saved.eventDetails) {
            setEventDetails(normalizeEventDetails(saved.eventDetails));
          }
          if (saved.items && saved.items.length > 0) {
            const loadedItems = saved.items.map((item: ExpenseItem) => {
              const itemBills = sanitizeItemBills(item);

              return {
                ...item,
                billAttached: null,
                billFileName: item.billFileName || itemBills[0]?.fileName || "",
                billUrl: itemBills[0]?.url || undefined,
                bills: itemBills,
              };
            });
            setItems(loadedItems);
          }
          if (saved.gstPercentage !== undefined) {
            setGstPercentage(saved.gstPercentage);
          }
        }
      } catch (err) {
        console.warn("Failed to load IndexedDB draft:", err);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          // Look for saved drafts across other company entities or automatic backups
          findOtherSavedDrafts(storageKey).then((drafts) => {
            if (isMounted) {
              setOtherDrafts(drafts);
            }
          });
        }
      }
    };

    loadRichDraft();

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  // Auto-save using IndexedDB with fallback to localStorage
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const report = {
      eventDetails,
      items: items.map((item) => ({
        ...item,
        billAttached: null,
        billFileName: item.billFileName || item.bills?.[0]?.fileName || "",
        billUrl: item.billUrl || item.bills?.[0]?.url || undefined,
        bills: item.bills || [],
      })),
      gstPercentage,
      savedAt: new Date().toISOString(),
      companySlug: company.slug,
    };

    saveExpenseDraftToStorage(storageKey, report);
  }, [company.slug, eventDetails, gstPercentage, isInitialized, items, storageKey]);

  const handleSaveDraft = async () => {
    const report = {
      eventDetails,
      items: items.map((item) => ({
        ...item,
        billAttached: null,
        billFileName: item.billFileName || item.bills?.[0]?.fileName || "",
        billUrl: item.billUrl || item.bills?.[0]?.url || undefined,
        bills: item.bills || [],
      })),
      gstPercentage,
      savedAt: new Date().toISOString(),
      companySlug: company.slug,
    };

    await saveExpenseDraftToStorage(storageKey, report, { isExplicitSave: true });
    findOtherSavedDrafts(storageKey).then((drafts) => setOtherDrafts(drafts));
    toast.success("Draft saved successfully with attached bills and backup copy!");
  };

  const handleRestoreDraft = (draft: AvailableDraftInfo) => {
    if (!draft?.data) return;
    const restoredEventDetails = normalizeEventDetails(draft.data.eventDetails);
    const restoredItems = (draft.data.items || []).map((item: ExpenseItem) => {
      const itemBills = sanitizeItemBills(item);
      return {
        ...item,
        billAttached: null,
        billFileName: item.billFileName || itemBills[0]?.fileName || "",
        billUrl: itemBills[0]?.url || undefined,
        bills: itemBills,
      };
    });

    setEventDetails(restoredEventDetails);
    setItems(
      restoredItems.length > 0
        ? restoredItems
        : [createEmptyItem(1), createEmptyItem(2), createEmptyItem(3)],
    );
    if (draft.data.gstPercentage !== undefined) {
      setGstPercentage(draft.data.gstPercentage);
    }

    // Save immediately under current entity key so it's permanently stored here
    saveExpenseDraftToStorage(
      storageKey,
      {
        eventDetails: restoredEventDetails,
        items: restoredItems,
        gstPercentage: draft.data.gstPercentage ?? 18,
        companySlug: company.slug,
        savedAt: new Date().toISOString(),
      },
      { isExplicitSave: true },
    );

    setIsDraftRecoveryOpen(false);
    setIsDismissedDraftAlert(true);
    toast.success(
      `Restored draft from ${draft.sourceLabel} with ${draft.itemCount} items and ${draft.billCount} bills into ${company.displayName}!`,
    );
  };

  const handleExport = () => {
    const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
    const gstAmount = (totalExpenses * gstPercentage) / 100;
    const grandTotal = totalExpenses + gstAmount;

    const csvContent = [
      [`EXPENSE REPORT - ${company.displayName} - ${eventDetails.eventName || "Untitled"}`],
      ["Generated On:", new Date().toLocaleString("en-IN")],
      ["Event Name:", eventDetails.eventName || "N/A"],
      ["Date:", eventDetails.date || "N/A"],
      ["Venue:", eventDetails.venue || "N/A"],
      ["Phone:", eventDetails.phone || "N/A"],
      ["Prepared By:", eventDetails.preparedBy || "N/A"],
      ["Reporting Manager:", eventDetails.reportingManager || "N/A"],
      [],
      [
        "S.No",
        "Particulars",
        "Income (INR)",
        "Expenses (INR)",
        "Bill Attached",
        "Bill File Name",
        "Bill Link / Data",
        "Remarks",
      ],
      ...items.map((item) => {
        const itemBills =
          item.bills && item.bills.length > 0
            ? item.bills
            : item.billFileName
              ? [{ fileName: item.billFileName, url: item.billUrl, size: 0 }]
              : [];
        const hasBill = itemBills.length > 0;
        const fileNames = itemBills.map((b) => b.fileName).join("; ");
        const links = itemBills
          .map((b) => (b.url?.startsWith("data:") ? "Local Attachment (See PDF)" : b.url || b.fileName))
          .join("; ");

        return [
          item.sNo,
          item.particulars || "-",
          item.income,
          item.expenses,
          hasBill ? `Yes (${itemBills.length})` : "No",
          fileNames || "-",
          links || "-",
          item.remarks || "-",
        ];
      }),
      [],
      ["", "", "Total Income:", totalIncome],
      ["", "", "Total Expenses:", totalExpenses],
      ["", "", `GST @ ${gstPercentage}%:`, gstAmount],
      ["", "", "Grand Total:", grandTotal],
    ]
      .map((row) => row.map((cell) => escapeCsvCell(cell as string | number)).join(","))
      .join("\r\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `expense-report-${company.slug}-${sanitizeFileNamePart(eventDetails.eventName || "event")}-${eventDetails.date}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Excel / CSV report exported successfully!");
  };

  const handlePrint = async () => {
    toast.info("Preparing bills and print preview...");

    // Make sure all bills have fully resolved data URLs
    const preparedItems = await ensureBillsHaveUrls(items);
    setItems(preparedItems);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }

    printWindow.document.write(
      buildExpensePrintHtml({
        company,
        eventDetails,
        items: preparedItems,
        gstPercentage,
      }),
    );
    printWindow.document.close();

    toast.success("Print preview opened!");
  };

  const handleItemChange = (updatedItem: ExpenseItem) => {
    setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleItemDelete = (id: string) => {
    if (items.length <= 1) {
      toast.error("At least one item is required");
      return;
    }

    const nextItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        sNo: index + 1,
      }));

    setItems(nextItems);
    toast.success("Item deleted");
  };

  const handleAddItem = () => {
    setItems((current) => [...current, createEmptyItem(current.length + 1)]);
  };

  const handleScannedBills = (bills: ScannedBill[]) => {
    setItems((current) => {
      const kept = current.filter((i) => i.particulars.trim() || i.income || i.expenses || i.billFileName);
      const added = bills.map((b, idx) => ({
        ...createEmptyItem(kept.length + idx + 1),
        particulars: [b.description, b.vendor].filter(Boolean).join(" – ") || b.fileName,
        expenses: b.total,
        remarks: b.date ? `Bill date ${b.date}` : "",
        billFileName: b.fileName,
        billUrl: b.dataUrl,
        bills: [{ file: dataUrlToFile(b.dataUrl, b.fileName), fileName: b.fileName, url: b.dataUrl, size: 0 }],
      }));
      return [...kept, ...added].map((item, i) => ({ ...item, sNo: i + 1 }));
    });
    if (!eventDetails.date && bills[0]?.date) {
      setEventDetails((d) => ({ ...d, date: bills[0].date }));
    }
  };

  const handleEventDetailChange = (field: keyof EventDetails, value: string) => {
    setEventDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const workflowSteps = [
    {
      label: "Prepared by",
      field: "preparedBy" as const,
      placeholder: "Prepared by name",
    },
    {
      label: "Reporting manager",
      field: "reportingManager" as const,
      placeholder: "Manager name",
    },
    {
      label: "Accounting copy",
      value: "Auto CC",
    },
  ];

  const entityCards = EXPENSE_COMPANIES.map((entity) => {
    const isActive = entity.slug === company.slug;

    return (
      <Link
        key={entity.slug}
        to={getExpenseCompanyPath(entity.slug)}
        className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-200 ${
          isActive
            ? "border-white/40 bg-white/20 shadow-lg"
            : "border-white/15 bg-white/10 hover:bg-white/15"
        }`}
      >
        <div className="rounded-xl bg-white/15 p-2 ring-1 ring-white/20">
          <img
            src={entity.logoSrc}
            alt={entity.logoAlt}
            className="h-8 w-8 object-contain no-auto-move"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white">{entity.displayName}</span>
            {isActive && <ShieldCheck className="h-4 w-4 shrink-0 text-white" />}
          </div>
          <p className="truncate text-xs text-white/70">{entity.routeHint}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-4 md:py-6">
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                Expense
              </span>{" "}
              <span className={`bg-gradient-to-r ${company.screenGradientClass} bg-clip-text text-transparent`}>
                Command Center
              </span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
              Multi-entity claims workflow · unique access links · mobile friendly
            </p>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {company.metaDescription}
            </p>
          </div>

          <div
            className={`overflow-hidden rounded-3xl border border-border bg-gradient-to-r ${company.screenGradientClass} p-4 text-white shadow-xl sm:p-6`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                  <img
                    src={company.logoSrc}
                    alt={company.logoAlt}
                    className="h-10 w-auto object-contain no-auto-move sm:h-12"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                    Multi-entity access
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                    {company.displayName}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                    Open the entity-specific link, enter the claim, and export a branded PDF or CSV with manager approval routed to accounting.
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                {company.slug === DEFAULT_EXPENSE_COMPANY_SLUG ? "Default company" : "Entity link"}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{entityCards}</div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    <Workflow className="h-4 w-4" />
                    {step.label}
                  </div>
                  {"field" in step ? (
                    <Input
                      value={eventDetails[step.field]}
                      onChange={(event) => handleEventDetailChange(step.field, event.target.value)}
                      placeholder={step.placeholder}
                      className="mt-2 h-9 border-white/20 bg-white/15 text-sm font-semibold text-white placeholder:text-white/45 focus:border-white"
                    />
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-white">{step.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                Mobile-first submission
              </div>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Use the entity link from any phone or desktop, fill the claim once, and print or save the PDF without moving between tools.
              </p>
            </div>
          </div>

          <EventHeader eventDetails={eventDetails} onChange={setEventDetails} company={company} />

          {/* Smart Draft Recovery Alert */}
          {otherDrafts.length > 0 && !hasMeaningfulContent({ eventDetails, items }) && !isDismissedDraftAlert && (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/40 p-4 shadow-md backdrop-blur-sm transition-all">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:text-blue-400 shrink-0">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">
                        Saved Draft Found in {otherDrafts[0].sourceLabel}
                      </h4>
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                        {otherDrafts[0].itemCount} items · {otherDrafts[0].billCount} bills attached
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {otherDrafts[0].eventName && otherDrafts[0].eventName !== "Untitled Event"
                        ? `Event: "${otherDrafts[0].eventName}" · `
                        : ""}
                      Total: {formatCurrency(otherDrafts[0].totalExpenses)}
                      {otherDrafts[0].updatedAt
                        ? ` · Saved ${new Date(otherDrafts[0].updatedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                      . Would you like to copy these attached bills and line items into {company.displayName}?
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleRestoreDraft(otherDrafts[0])}
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-3"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Copy into {company.displayName}
                  </Button>
                  {otherDrafts[0].companySlug && (
                    <Link to={getExpenseCompanyPath(otherDrafts[0].companySlug as any)}>
                      <Button size="sm" variant="outline" className="text-xs h-9 px-3">
                        Switch to {otherDrafts[0].sourceLabel}
                      </Button>
                    </Link>
                  )}
                  {otherDrafts.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsDraftRecoveryOpen(true)}
                      className="text-xs h-9 px-3"
                    >
                      View All ({otherDrafts.length})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsDismissedDraftAlert(true)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Dismiss alert"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end md:gap-3">
            {otherDrafts.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsDraftRecoveryOpen(true)}
                className="h-10 w-full justify-center gap-2 px-3 text-xs md:text-sm sm:w-auto md:px-4 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                <History className="h-4 w-4" />
                Saved Drafts & Backups ({otherDrafts.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="h-10 w-full justify-center gap-2 px-3 text-xs md:text-sm sm:w-auto md:px-4"
            >
              <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="h-10 w-full justify-center gap-2 px-3 text-xs md:text-sm sm:w-auto md:px-4"
            >
              <Download className="h-4 w-4" />
              Export Excel / CSV
            </Button>
            <Button
              variant="default"
              onClick={handlePrint}
              className="h-10 w-full justify-center gap-2 px-3 text-xs md:text-sm sm:w-auto md:px-4"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
          </div>

          <BillScanner onAdd={handleScannedBills} />

          <ExpenseTable
            items={items}
            onItemChange={handleItemChange}
            onItemDelete={handleItemDelete}
            onAddItem={handleAddItem}
          />

          <TotalSummary items={items} gstPercentage={gstPercentage} onGstChange={setGstPercentage} company={company} />

          <div className="py-4 text-center text-sm text-muted-foreground">
            <FileText className="mr-2 inline h-4 w-4" />
            Powered by {company.footerLine}
          </div>
        </div>
      </div>

      {/* Draft Recovery & Backups Modal */}
      <Dialog open={isDraftRecoveryOpen} onOpenChange={setIsDraftRecoveryOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Saved Drafts & Automatic Backups
            </DialogTitle>
            <DialogDescription>
              Your attached bills and line items are automatically safeguarded. You can view or restore any draft from another entity or previous session into {company.displayName}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {otherDrafts.map((d, index) => (
              <div
                key={d.key || index}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card/80 p-4 shadow-sm transition-colors hover:bg-card sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{d.sourceLabel}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {d.itemCount} items
                    </span>
                    {d.billCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Receipt className="h-3 w-3" />
                        {d.billCount} bills attached
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {d.eventName && d.eventName !== "Untitled Event" ? `Event: "${d.eventName}" · ` : ""}
                    Expenses: {formatCurrency(d.totalExpenses)}
                    {d.updatedAt
                      ? ` · Saved ${new Date(d.updatedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRestoreDraft(d)}
                    className="h-9 gap-1.5 px-3 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Load into {company.displayName}
                  </Button>
                  {d.companySlug && (
                    <Link to={getExpenseCompanyPath(d.companySlug as any)}>
                      <Button size="sm" variant="outline" className="h-9 px-3 text-xs">
                        Open {d.sourceLabel}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {!isCalculatorOpen && <CalculatorButton onClick={() => setIsCalculatorOpen(true)} />}

      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
};

const Index = () => {
  const { companySlug } = useParams<{ companySlug?: string }>();
  const company = getExpenseCompany(companySlug);

  return <ExpenseWorkspace key={company.slug} company={company} />;
};

export default Index;
