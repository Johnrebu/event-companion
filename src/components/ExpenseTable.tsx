import { ExpenseItem } from "@/types/expense";
import ExpenseRow, { ExpenseCard } from "./ExpenseRow";
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <div className="space-y-4 p-4 md:hidden">
        {items.map((item) => (
          <ExpenseCard
            key={item.id}
            item={item}
            onChange={onItemChange}
            onDelete={onItemDelete}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-secondary">
              <th className="w-16 p-3 text-left text-sm font-semibold text-secondary-foreground">
                S.No
              </th>
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground">
                Particulars
              </th>
              <th className="w-36 p-3 text-right text-sm font-semibold text-income">
                Income (INR)
              </th>
              <th className="w-36 p-3 text-right text-sm font-semibold text-expense">
                Expenses (INR)
              </th>
              <th className="w-56 p-3 text-left text-sm font-semibold text-secondary-foreground">
                Bills
              </th>
              <th className="p-3 text-left text-sm font-semibold text-secondary-foreground">
                Remarks
              </th>
              <th className="w-12 p-3"></th>
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

      <div className="border-t border-border bg-muted/30 p-4">
        <Button
          type="button"
          onClick={onAddItem}
          variant="outline"
          className="w-full gap-2 border-dashed border-primary text-primary hover:bg-primary hover:text-primary-foreground sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>
    </div>
  );
};

export default ExpenseTable;
