import { ExpenseItem } from "@/types/expense";
import ExpenseRow from "./ExpenseRow";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExpenseTableProps {
  items: ExpenseItem[];
  onItemChange: (item: ExpenseItem) => void;
  onItemDelete: (id: string) => void;
  onAddItem: () => void;
}

const ExpenseTable = ({ items, onItemChange, onItemDelete, onAddItem }: ExpenseTableProps) => {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary">
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground w-16">
                S.No
              </th>
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground">
                Particulars
              </th>
              <th className="p-3 text-right text-sm font-semibold text-income w-32">
                Income (₹)
              </th>
              <th className="p-3 text-right text-sm font-semibold text-expense w-32">
                Expenses (₹)
              </th>
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground w-48">
                Bills
              </th>
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground">
                Remarks
              </th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ExpenseRow
                key={item.id}
                item={item}
                onChange={onItemChange}
                onDelete={onItemDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          type="button"
          onClick={onAddItem}
          variant="outline"
          className="gap-2 border-dashed border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>
    </div>
  );
};

export default ExpenseTable;
