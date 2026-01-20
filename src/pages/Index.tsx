import { useState, useRef, useEffect } from "react";
import { ExpenseItem, EventDetails } from "@/types/expense";
import EventHeader from "@/components/EventHeader";
import ExpenseTable from "@/components/ExpenseTable";
import TotalSummary from "@/components/TotalSummary";
import Calculator from "@/components/Calculator";
import CalculatorButton from "@/components/CalculatorButton";
import PrintReport from "@/components/PrintReport";
import { Button } from "@/components/ui/button";
import { Download, Save, FileText, Printer, Database, FolderOpen, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExpenseReports, SavedExpenseReport } from "@/hooks/useExpenseReports";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const STORAGE_KEY = "expense-report";

const createEmptyItem = (sNo: number): ExpenseItem => ({
  id: crypto.randomUUID(),
  sNo,
  particulars: "",
  income: 0,
  expenses: 0,
  remarks: "",
  billAttached: null,
  billFileName: "",
});

const loadSavedData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        eventDetails: data.eventDetails || {
          eventName: "",
          date: new Date().toISOString().split("T")[0],
          venue: "",
          phone: "",
        },
        items: data.items?.length > 0 ? data.items.map((item: ExpenseItem) => ({
          ...item,
          billAttached: null, // File objects can't be stored in localStorage
        })) : [createEmptyItem(1), createEmptyItem(2), createEmptyItem(3)],
        gstPercentage: data.gstPercentage ?? 18,
      };
    }
  } catch (e) {
    console.error("Failed to load saved expense data:", e);
  }
  return null;
};

const Index = () => {
  const savedData = loadSavedData();

  const [eventDetails, setEventDetails] = useState<EventDetails>(
    savedData?.eventDetails || {
      eventName: "",
      date: new Date().toISOString().split("T")[0],
      venue: "",
      phone: "",
    }
  );

  const [items, setItems] = useState<ExpenseItem[]>(
    savedData?.items || [
      createEmptyItem(1),
      createEmptyItem(2),
      createEmptyItem(3),
    ]
  );

  const [gstPercentage, setGstPercentage] = useState(savedData?.gstPercentage ?? 18);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSavedReportsOpen, setIsSavedReportsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Database operations
  const { reports, loading, fetchReports, saveReport, deleteReport } = useExpenseReports();

  // Fetch reports when dialog opens
  useEffect(() => {
    if (isSavedReportsOpen) {
      fetchReports();
    }
  }, [isSavedReportsOpen, fetchReports]);

  const handleSaveToDatabase = async () => {
    if (!eventDetails.eventName) {
      toast.error("Please enter an event name before saving");
      return;
    }
    await saveReport(eventDetails, items, gstPercentage);
  };

  const handleLoadReport = (report: SavedExpenseReport) => {
    setEventDetails({
      eventName: report.event_name,
      date: report.event_date,
      venue: report.venue || "",
      phone: report.phone || "",
    });
    setItems(report.items.map((item, index) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      sNo: index + 1,
      billAttached: null,
    })));
    setGstPercentage(report.gst_percentage);
    setIsSavedReportsOpen(false);
    toast.success(`Loaded report: ${report.event_name}`);
  };

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteReport(id);
    }
  };

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    // Skip the first render to avoid overwriting with empty/initial state
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const report = {
      eventDetails,
      items: items.map(item => ({
        ...item,
        billAttached: null, // Can't store File objects
      })),
      gstPercentage,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  }, [eventDetails, items, gstPercentage, isInitialized]);

  const handleItemChange = (updatedItem: ExpenseItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleItemDelete = (id: string) => {
    if (items.length <= 1) {
      toast.error("At least one item is required");
      return;
    }
    const newItems = items.filter((item) => item.id !== id);
    // Renumber items
    const renumberedItems = newItems.map((item, index) => ({
      ...item,
      sNo: index + 1,
    }));
    setItems(renumberedItems);
    toast.success("Item deleted");
  };

  const handleAddItem = () => {
    setItems([...items, createEmptyItem(items.length + 1)]);
  };

  const handleSave = () => {
    const report = {
      eventDetails,
      items,
      gstPercentage,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("expense-report", JSON.stringify(report));
    toast.success("Report saved successfully!");
  };

  const handleExport = () => {
    const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
    const gstAmount = (totalExpenses * gstPercentage) / 100;
    const grandTotal = totalExpenses + gstAmount;

    const csvContent = [
      ["EXPENSE REPORT - " + eventDetails.eventName],
      ["Date:", eventDetails.date],
      ["Venue:", eventDetails.venue],
      ["Phone:", eventDetails.phone],
      [],
      ["S.No", "Particulars", "Income", "Expenses", "Remarks", "Bill Attached"],
      ...items.map((item) => [
        item.sNo,
        item.particulars,
        item.income,
        item.expenses,
        item.remarks,
        item.billFileName || "No",
      ]),
      [],
      ["", "Total Income:", totalIncome],
      ["", "Total Expenses:", totalExpenses],
      ["", `GST @ ${gstPercentage}%:`, gstAmount],
      ["", "Grand Total:", grandTotal],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${eventDetails.eventName || "event"}-${eventDetails.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }

    // Get computed logo URL or use a data URI
    const logoImg = printContent.querySelector('img');
    const logoSrc = logoImg?.src || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report - ${eventDetails.eventName || "Event"}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 24px;
              background: white;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-report { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px; }
            .header-left { display: flex; align-items: center; gap: 16px; }
            .header-left img { height: 64px; width: auto; }
            .header-left h1 { font-size: 24px; font-weight: bold; color: #111827; }
            .header-left p { font-size: 14px; color: #4b5563; }
            .header-right { text-align: right; font-size: 14px; color: #4b5563; }
            .header-right .bold { font-weight: 600; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937; }
            .details-box { background: #f9fafb; padding: 16px; border-radius: 8px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px; }
            .details-grid .label { color: #6b7280; }
            .details-grid .value { margin-left: 8px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th { background: #1f2937; color: white; padding: 8px 12px; text-align: left; border: 1px solid #d1d5db; }
            th.right { text-align: right; }
            th.center { text-align: center; }
            td { padding: 8px 12px; border: 1px solid #d1d5db; }
            td.right { text-align: right; }
            td.center { text-align: center; }
            tr:nth-child(even) { background: #f9fafb; }
            .income { color: #15803d; font-weight: 500; }
            .expense { color: #b91c1c; font-weight: 500; }
            .summary-box { background: #f9fafb; padding: 16px; border-radius: 8px; width: 320px; margin-left: auto; }
            .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
            .summary-row .label { color: #6b7280; }
            .summary-row.total { border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 8px; font-weight: bold; color: #111827; }
            .footer { border-top: 2px solid #d1d5db; padding-top: 16px; margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
            .signature { text-align: center; }
            .signature-line { border-top: 1px solid #9ca3af; padding-top: 8px; margin: 0 32px; font-size: 14px; color: #4b5563; }
            @media print {
              @page { size: A4; margin: 10mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-report">
            <div class="header">
              <div class="header-left">
                <img src="${logoSrc}" alt="Logo" />
                <div>
                  <h1>Corona Creative Solutions</h1>
                  <p>Event Expense Report</p>
                </div>
              </div>
              <div class="header-right">
                <p>Report Generated:</p>
                <p class="bold">${new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Event Details</h2>
              <div class="details-box">
                <div class="details-grid">
                  <div><span class="label">Event Name:</span><span class="value">${eventDetails.eventName || "N/A"}</span></div>
                  <div><span class="label">Date:</span><span class="value">${eventDetails.date ? new Date(eventDetails.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}</span></div>
                  <div><span class="label">Venue:</span><span class="value">${eventDetails.venue || "N/A"}</span></div>
                  <div><span class="label">Phone:</span><span class="value">${eventDetails.phone || "N/A"}</span></div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Expense Details</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 48px;">S.No</th>
                    <th>Particulars</th>
                    <th class="right" style="width: 112px;">Income</th>
                    <th class="right" style="width: 112px;">Expenses</th>
                    <th class="center" style="width: 80px;">Bills</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item, index) => `
                    <tr${index % 2 === 1 ? ' style="background: #f9fafb;"' : ''}>
                      <td class="center">${item.sNo}</td>
                      <td>${item.particulars || "-"}</td>
                      <td class="right income">${item.income > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.income) : "-"}</td>
                      <td class="right expense">${item.expenses > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.expenses) : "-"}</td>
                      <td class="center">${item.billFileName ? "✓" : "-"}</td>
                      <td>${item.remarks || "-"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="summary-box">
                <h2 class="section-title" style="border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Summary</h2>
                <div class="summary-row">
                  <span class="label">Total Income:</span>
                  <span class="income">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(items.reduce((sum, item) => sum + item.income, 0))}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Total Expenses:</span>
                  <span class="expense">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(items.reduce((sum, item) => sum + item.expenses, 0))}</span>
                </div>
                <div class="summary-row" style="border-top: 1px solid #d1d5db; padding-top: 8px;">
                  <span class="label">Net Balance:</span>
                  <span style="font-weight: 600; color: ${items.reduce((sum, item) => sum + item.income, 0) - items.reduce((sum, item) => sum + item.expenses, 0) >= 0 ? '#15803d' : '#b91c1c'};">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(items.reduce((sum, item) => sum + item.income, 0) - items.reduce((sum, item) => sum + item.expenses, 0))}</span>
                </div>
                <div class="summary-row">
                  <span class="label">GST @ ${gstPercentage}%:</span>
                  <span>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((items.reduce((sum, item) => sum + item.expenses, 0) * gstPercentage) / 100)}</span>
                </div>
                <div class="summary-row total">
                  <span>Grand Total:</span>
                  <span>${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(items.reduce((sum, item) => sum + item.expenses, 0) + (items.reduce((sum, item) => sum + item.expenses, 0) * gstPercentage) / 100)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div>
                <p>This is a computer-generated report.</p>
                <p>For any queries, please contact the event management team.</p>
              </div>
              <div style="text-align: right;">
                <p>Corona Creative Solutions</p>
                <p>Event Management Division</p>
              </div>
            </div>

            <div class="signatures">
              <div class="signature">
                <div class="signature-line">Prepared By</div>
              </div>
              <div class="signature">
                <div class="signature-line">Approved By</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for logo to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);

    toast.success("Print dialog opened!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <EventHeader eventDetails={eventDetails} onChange={setEventDetails} />

          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              variant="default"
              onClick={handleSaveToDatabase}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Save to Database
            </Button>
            <Dialog open={isSavedReportsOpen} onOpenChange={setIsSavedReportsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Saved Reports
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Saved Expense Reports</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No saved reports yet. Save a report to see it here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          onClick={() => handleLoadReport(report)}
                          className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{report.event_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(report.event_date), "PPP")}
                                {report.venue && ` • ${report.venue}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm">
                                <div className="text-emerald-600 font-medium">
                                  Income: ₹{report.total_income.toLocaleString("en-IN")}
                                </div>
                                <div className="text-red-600">
                                  Expenses: ₹{report.total_expenses.toLocaleString("en-IN")}
                                </div>
                                <div className={`font-bold mt-1 ${(report.total_income - report.total_expenses) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                  Net: ₹{(report.total_income - report.total_expenses).toLocaleString("en-IN")}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteReport(report.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Saved: {format(new Date(report.created_at), "PPp")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="default" onClick={handlePrint} className="gap-2">
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

          <TotalSummary
            items={items}
            gstPercentage={gstPercentage}
            onGstChange={setGstPercentage}
          />

          <div className="text-center text-sm text-muted-foreground py-4">
            <FileText className="h-4 w-4 inline mr-2" />
            Powered by Corona Creative Solutions
          </div>
        </div>
      </div>

      {!isCalculatorOpen && (
        <CalculatorButton onClick={() => setIsCalculatorOpen(true)} />
      )}

      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Hidden Print Report */}
      <div className="hidden">
        <PrintReport
          ref={printRef}
          eventDetails={eventDetails}
          items={items}
          gstPercentage={gstPercentage}
        />
      </div>
    </div>
  );
};

export default Index;
