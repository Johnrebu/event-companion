import { ExpenseItem } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Trash2 } from "lucide-react";
import { useRef } from "react";

interface ExpenseRowProps {
  item: ExpenseItem;
  onChange: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

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
      });
    }
  };

  const handleRemoveFile = () => {
    onChange({
      ...item,
      billAttached: null,
      billFileName: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="p-3 text-center font-medium text-muted-foreground">
        {item.sNo}
      </td>
      <td className="p-3">
        <Input
          value={item.particulars}
          onChange={(e) => handleChange("particulars", e.target.value)}
          placeholder="Enter particulars"
          className="min-w-[200px]"
        />
      </td>
      <td className="p-3">
        <Input
          type="number"
          value={item.income || ""}
          onChange={(e) => handleChange("income", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="text-right text-income font-medium"
          min="0"
          step="0.01"
        />
      </td>
      <td className="p-3">
        <Input
          type="number"
          value={item.expenses || ""}
          onChange={(e) => handleChange("expenses", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="text-right text-expense font-medium"
          min="0"
          step="0.01"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          {item.billFileName ? (
            <div className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-md text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="max-w-[100px] truncate text-accent-foreground">
                {item.billFileName}
              </span>
              <button
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-destructive transition-colors"
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
              className="gap-2"
            >
              <Paperclip className="h-4 w-4" />
              Attach Bill
            </Button>
          )}
        </div>
      </td>
      <td className="p-3">
        <Input
          value={item.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          placeholder="Add remarks"
          className="min-w-[150px]"
        />
      </td>
      <td className="p-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default ExpenseRow;
