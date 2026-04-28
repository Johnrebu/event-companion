import { ExpenseItem } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Calculator } from "lucide-react";
import type { ExpenseCompany } from "@/lib/expenseCompanies";

interface TotalSummaryProps {
  items: ExpenseItem[];
  gstPercentage: number;
  onGstChange: (value: number) => void;
  company: ExpenseCompany;
}

const TotalSummary = ({ items, gstPercentage, onGstChange, company }: TotalSummaryProps) => {
  const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
  const netAmount = totalIncome - totalExpenses;
  const gstAmount = (totalExpenses * gstPercentage) / 100;
  const grandTotal = totalExpenses + gstAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
      <div className={`bg-gradient-to-r ${company.screenGradientClass} px-4 py-3 sm:px-6 sm:py-4`}>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-foreground">
          <Calculator className="h-5 w-5" />
          Summary
        </h3>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-income/10 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-income" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Income
              </span>
            </div>
            <p className="text-xl font-extrabold tracking-tight text-income sm:text-2xl md:text-3xl">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="bg-expense/10 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-expense" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </span>
            </div>
            <p className="text-xl font-extrabold tracking-tight text-expense sm:text-2xl md:text-3xl">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className={`rounded-lg p-3 sm:p-4 ${netAmount >= 0 ? "bg-income/10" : "bg-expense/10"}`}>
            <div className="flex items-center gap-2 mb-2">
              {netAmount >= 0 ? (
                <TrendingUp className="h-5 w-5 text-income" />
              ) : (
                <TrendingDown className="h-5 w-5 text-expense" />
              )}
              <span className="text-sm font-medium text-muted-foreground">
                Net Balance
              </span>
            </div>
            <p className={`text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl ${netAmount >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(netAmount)}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 mt-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-sm font-medium">
                GST Percentage (%)
              </Label>
              <Input
                id="gst"
                type="number"
                value={gstPercentage}
                onChange={(e) => onGstChange(parseFloat(e.target.value) || 0)}
                className="w-full sm:w-32"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>

              <div className="bg-muted rounded-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  GST @ {gstPercentage}%
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(gstAmount)}
                </p>
              </div>

              <div className={`rounded-lg bg-gradient-to-r ${company.screenGradientClass} px-4 py-3`}>
                <span className="text-sm text-primary-foreground/80">Grand Total</span>
                <p className="text-xl md:text-2xl font-extrabold text-primary-foreground tracking-tight">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSummary;
