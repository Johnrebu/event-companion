// Updated ExpenseRow component with multi‑bill support
import { ExpenseItem, ExpenseBill } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Paperclip, X, FileText, Trash2 } from "lucide-react";
import { useRef } from "react";

interface ExpenseRowProps {
  item: ExpenseItem;
  onChange: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

interface ExpenseBillFieldProps {
  item: ExpenseItem;
  bills: ExpenseBill[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAddFiles: (newBills: ExpenseBill[]) => void;
  onRemoveFile: (index: number) => void;
  buttonClassName?: string;
}

const ExpenseBillField = ({
  item,
  bills,
  fileInputRef,
  onAddFiles,
  onRemoveFile,
  buttonClassName,
}: ExpenseBillFieldProps) => {
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const isImageFile = (fileName: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          const newBills: ExpenseBill[] = [];
          const existingNames = new Set(bills.map((b) => b.fileName));
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) continue; // 10 MB limit
            if (existingNames.has(file.name)) continue; // duplicate
            const bill: ExpenseBill = { file, fileName: file.name, size: file.size };
            if (isImageFile(file.name)) {
              const reader = new FileReader();
              reader.onload = (event) => {
                bill.url = event.target?.result as string;
                onAddFiles([bill]);
              };
              reader.readAsDataURL(file);
            } else {
              bill.url = URL.createObjectURL(file);
              newBills.push(bill);
            }
          }
          if (newBills.length) onAddFiles(newBills);
        }}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className={cn("gap-2 border-dashed hover:border-primary hover:text-primary", buttonClassName)}
      >
        <Paperclip className="h-4 w-4" />
        Attach Bill
      </Button>

      {bills && bills.length > 0 && (
        <div className="rounded border border-border bg-accent/60 p-2">
          {bills.map((bill, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 text-sm"
            >
              {isImageFile(bill.fileName) && bill.url ? (
                <img src={bill.url} alt={bill.fileName} className="h-7 w-7 rounded object-cover" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="flex-1 truncate" title={bill.fileName}>
                {bill.fileName}
              </span>
              <span className="text-muted-foreground whitespace-nowrap">
                {formatSize(bill.size)}
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(idx)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove attached bill"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExpenseRow = ({ item, onChange, onDelete }: ExpenseRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ExpenseItem, value: string | number | File | null) => {
    onChange({ ...item, [field]: value });
  };

  const handleAddFiles = (newBills: ExpenseBill[]) => {
    const updated = [...(item.bills || []), ...newBills];
    onChange({ ...item, bills: updated });
  };

  const handleRemoveBill = (index: number) => {
    const updated = [...(item.bills || [])];
    updated.splice(index, 1);
    onChange({ ...item, bills: updated });
  };

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="p-3 text-center align-top font-medium text-muted-foreground">{item.sNo}</td>
      <td className="p-3 align-top">
        <Input
          value={item.particulars}
          onChange={(e) => handleChange("particulars", e.target.value)}
          placeholder="Enter particulars"
          className="min-w-[180px]"
        />
      </td>
      <td className="p-3 align-top">
        <Input
          type="number"
          value={item.income || ""}
          onChange={(e) => handleChange("income", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="min-w-[120px] text-right font-medium text-income"
          inputMode="decimal"
          min="0"
          step="0.01"
        />
      </td>
      <td className="p-3 align-top">
        <Input
          type="number"
          value={item.expenses || ""}
          onChange={(e) => handleChange("expenses", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="min-w-[120px] text-right font-medium text-expense"
          inputMode="decimal"
          min="0"
          step="0.01"
        />
      </td>
      <td className="min-w-[220px] p-3 align-top">
        <ExpenseBillField
          item={item}
          bills={item.bills || []}
          fileInputRef={fileInputRef}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveBill}
          buttonClassName={undefined}
        />
      </td>
      <td className="p-3 align-top">
        <Input
          value={item.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          placeholder="Add remarks"
          className="min-w-[160px]"
        />
      </td>
      <td className="p-3 align-top">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

// Updated ExpenseCard to mirror the table row behaviour with multi‑bill support
export const ExpenseCard = ({ item, onChange, onDelete }: ExpenseRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ExpenseItem, value: string | number | File | null) => {
    onChange({ ...item, [field]: value });
  };

  const handleAddFiles = (newBills: ExpenseBill[]) => {
    const updated = [...(item.bills || []), ...newBills];
    onChange({ ...item, bills: updated });
  };

  const handleRemoveBill = (index: number) => {
    const updated = [...(item.bills || [])];
    updated.splice(index, 1);
    onChange({ ...item, bills: updated });
  };

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Expense Item</p>
          <p className="text-lg font-bold text-foreground">#{item.sNo}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Particulars</Label>
          <Input
            value={item.particulars}
            onChange={(e) => handleChange("particulars", e.target.value)}
            placeholder="Enter particulars"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Income</Label>
            <Input
              type="number"
              value={item.income || ""}
              onChange={(e) => handleChange("income", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-right font-medium text-income"
              inputMode="decimal"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Expenses</Label>
            <Input
              type="number"
              value={item.expenses || ""}
              onChange={(e) => handleChange("expenses", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-right font-medium text-expense"
              inputMode="decimal"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bills</Label>
          <ExpenseBillField
            item={item}
            bills={item.bills || []}
            fileInputRef={fileInputRef}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveBill}
            buttonClassName="w-full justify-center"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Remarks</Label>
          <Input
            value={item.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            placeholder="Add remarks"
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseRow;
