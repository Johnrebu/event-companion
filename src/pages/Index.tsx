import { useState } from "react";
import { ExpenseItem, EventDetails } from "@/types/expense";
import EventHeader from "@/components/EventHeader";
import ExpenseTable from "@/components/ExpenseTable";
import TotalSummary from "@/components/TotalSummary";
import Calculator from "@/components/Calculator";
import CalculatorButton from "@/components/CalculatorButton";
import { Button } from "@/components/ui/button";
import { Download, Save, FileText } from "lucide-react";
import { toast } from "sonner";

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

const Index = () => {
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    eventName: "",
    date: new Date().toISOString().split("T")[0],
    venue: "",
    phone: "",
  });

  const [items, setItems] = useState<ExpenseItem[]>([
    createEmptyItem(1),
    createEmptyItem(2),
    createEmptyItem(3),
  ]);

  const [gstPercentage, setGstPercentage] = useState(18);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

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
            <Button variant="default" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
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
            Powered by Aionion Event Management
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
    </div>
  );
};

export default Index;
