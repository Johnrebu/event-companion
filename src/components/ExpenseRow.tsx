import { ExpenseItem } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Paperclip, X, FileText, Trash2, ExternalLink } from "lucide-react";
import { useRef } from "react";

interface ExpenseRowProps {
  item: ExpenseItem;
  onChange: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

interface ExpenseBillFieldProps {
  item: ExpenseItem;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  buttonClassName?: string;
}

const ExpenseBillField = ({
  item,
  fileInputRef,
  onFileChange,
  onRemoveFile,
  buttonClassName,
}: ExpenseBillFieldProps) => (
  <div className="flex items-center gap-2">
    <input
      ref={fileInputRef}
      type="file"
      onChange={onFileChange}
      className="hidden"
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
    />
    {item.billFileName ? (
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-accent-foreground">
          {item.billFileName}
        </span>
        {item.billUrl && (
          <a
            href={item.billUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-primary transition-colors hover:text-primary/80"
            title="Open uploaded file"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <button
          type="button"
          onClick={onRemoveFile}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Remove attached bill"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className={cn("gap-2", buttonClassName)}
      >
        <Paperclip className="h-4 w-4" />
        Attach Bill
      </Button>
    )}
  </div>
);

const ExpenseRow = ({ item, onChange, onDelete }: ExpenseRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ExpenseItem, value: string | number | File | null) => {
    onChange({ ...item, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...item,
        billAttached: file,
        billFileName: file.name,
        billUrl: undefined,
        billStoragePath: undefined,
      });
    }
  };

  const handleRemoveFile = () => {
    onChange({
      ...item,
      billAttached: null,
      billFileName: "",
      billUrl: undefined,
      billStoragePath: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="p-3 text-center align-top font-medium text-muted-foreground">
        {item.sNo}
      </td>
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
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
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

export const ExpenseCard = ({ item, onChange, onDelete }: ExpenseRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ExpenseItem, value: string | number | File | null) => {
    onChange({ ...item, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...item,
        billAttached: file,
        billFileName: file.name,
        billUrl: undefined,
        billStoragePath: undefined,
      });
    }
  };

  const handleRemoveFile = () => {
    onChange({
      ...item,
      billAttached: null,
      billFileName: "",
      billUrl: undefined,
      billStoragePath: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Expense Item
          </p>
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
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Particulars
          </Label>
          <Input
            value={item.particulars}
            onChange={(e) => handleChange("particulars", e.target.value)}
            placeholder="Enter particulars"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Income
            </Label>
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
            <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Expenses
            </Label>
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
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Bills
          </Label>
          <ExpenseBillField
            item={item}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
            buttonClassName="w-full justify-center"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Remarks
          </Label>
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
