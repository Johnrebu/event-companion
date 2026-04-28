import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Download,
  FileText,
  Printer,
  Save,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import EventHeader from "@/components/EventHeader";
import ExpenseTable from "@/components/ExpenseTable";
import TotalSummary from "@/components/TotalSummary";
import Calculator from "@/components/Calculator";
import CalculatorButton from "@/components/CalculatorButton";
import { buildExpensePrintHtml } from "@/lib/expensePrint";
import {
  DEFAULT_EXPENSE_COMPANY_SLUG,
  EXPENSE_COMPANIES,
  EXPENSE_WORKFLOW_STEPS,
  getExpenseCompany,
  getExpenseCompanyPath,
  getExpenseDraftStorageKey,
  type ExpenseCompany,
} from "@/lib/expenseCompanies";
import { ExpenseItem, EventDetails } from "@/types/expense";

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

const createDefaultEventDetails = (): EventDetails => ({
  eventName: "",
  date: new Date().toISOString().split("T")[0],
  venue: "",
  phone: "",
});

const createInitialState = (storageKey: string): ExpenseDraftState => {
  try {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      const data = JSON.parse(saved);

      return {
        eventDetails: data.eventDetails || createDefaultEventDetails(),
        items:
          data.items?.length > 0
            ? data.items.map((item: ExpenseItem) => ({
                ...item,
                billAttached: null,
                billFileName: item.billFileName || "",
              }))
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

const ExpenseWorkspace = ({ company }: { company: ExpenseCompany }) => {
  const storageKey = getExpenseDraftStorageKey(company.slug);
  const [initialState] = useState<ExpenseDraftState>(() => createInitialState(storageKey));

  const [eventDetails, setEventDetails] = useState<EventDetails>(initialState.eventDetails);
  const [items, setItems] = useState<ExpenseItem[]>(initialState.items);
  const [gstPercentage, setGstPercentage] = useState(initialState.gstPercentage);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const report = {
      eventDetails,
      items: items.map((item) => ({
        ...item,
        billAttached: null,
      })),
      gstPercentage,
      savedAt: new Date().toISOString(),
      companySlug: company.slug,
    };

    localStorage.setItem(storageKey, JSON.stringify(report));
  }, [company.slug, eventDetails, gstPercentage, isInitialized, items, storageKey]);

  const handleSaveDraft = () => {
    const report = {
      eventDetails,
      items: items.map((item) => ({
        ...item,
        billAttached: null,
      })),
      gstPercentage,
      savedAt: new Date().toISOString(),
      companySlug: company.slug,
    };

    localStorage.setItem(storageKey, JSON.stringify(report));
    toast.success("Draft saved successfully!");
  };

  const handleExport = () => {
    const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
    const gstAmount = (totalExpenses * gstPercentage) / 100;
    const grandTotal = totalExpenses + gstAmount;

    const csvContent = [
      [`EXPENSE REPORT - ${company.displayName} - ${eventDetails.eventName || "Untitled"}`],
      ["Date:", eventDetails.date],
      ["Venue:", eventDetails.venue],
      ["Phone:", eventDetails.phone],
      [],
      ["S.No", "Particulars", "Income", "Expenses", "Remarks", "Bill Name", "Bill URL"],
      ...items.map((item) => [
        item.sNo,
        item.particulars,
        item.income,
        item.expenses,
        item.remarks,
        item.billFileName || "No",
        item.billUrl || "",
      ]),
      [],
      ["", "Total Income:", totalIncome],
      ["", "Total Expenses:", totalExpenses],
      ["", `GST @ ${gstPercentage}%:`, gstAmount],
      ["", "Grand Total:", grandTotal],
    ]
      .map((row) => row.map((cell) => escapeCsvCell(cell as string | number)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `expense-report-${company.slug}-${sanitizeFileNamePart(eventDetails.eventName || "event")}-${eventDetails.date}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }

    printWindow.document.write(
      buildExpensePrintHtml({
        company,
        eventDetails,
        items,
        gstPercentage,
      }),
    );
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);

    toast.success("Print dialog opened!");
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
              {EXPENSE_WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    <Workflow className="h-4 w-4" />
                    {step.label}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{step.value}</p>
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

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end md:gap-3">
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
              Export CSV
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
