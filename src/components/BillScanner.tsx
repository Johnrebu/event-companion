import { useRef, useState } from "react";
import { Loader2, ScanLine, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ScannedBill {
  id: string;
  fileName: string;
  dataUrl: string;
  status: "reading" | "done" | "error";
  error?: string;
  vendor: string;
  date: string;
  total: number;
  description: string;
}

interface Props {
  onAdd: (bills: ScannedBill[]) => void;
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const BillScanner = ({ onAdd }: Props) => {
  const [bills, setBills] = useState<ScannedBill[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (id: string, patch: Partial<ScannedBill>) =>
    setBills((cur) => cur.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const scan = async (bill: ScannedBill) => {
    update(bill.id, { status: "reading", error: undefined });
    const { data, error } = await supabase.functions.invoke("extract-bill", { body: { image: bill.dataUrl } });
    if (error || data?.error) {
      let message = data?.error as string | undefined;
      if (!message && error && "context" in error) {
        try {
          message = (await (error as { context: Response }).context.json())?.error;
        } catch { /* ignore */ }
      }
      update(bill.id, { status: "error", error: message || "Could not read this bill." });
      return;
    }
    update(bill.id, {
      status: "done",
      vendor: data.vendor ?? "",
      date: data.date ?? "",
      total: data.total ?? 0,
      description: data.description ?? "",
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5 MB`);
        continue;
      }
      const dataUrl = await readAsDataUrl(file);
      const bill: ScannedBill = {
        id: crypto.randomUUID(), fileName: file.name, dataUrl, status: "reading",
        vendor: "", date: "", total: 0, description: "",
      };
      setBills((cur) => [...cur, bill]);
      scan(bill);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const ready = bills.filter((b) => b.status === "done");

  const addAll = () => {
    onAdd(ready);
    setBills((cur) => cur.filter((b) => b.status !== "done"));
    toast.success(`${ready.length} bill${ready.length > 1 ? "s" : ""} added to the report`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" /> Scan bills with AI
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload bill photos — vendor, date and total are filled in for you to check before adding.
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" /> Upload bill images
        </Button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {bills.length > 0 && (
        <div className="mt-4 space-y-3">
          {bills.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row">
              <img src={b.dataUrl} alt={b.fileName} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              <div className="flex-1 space-y-2">
                {b.status === "reading" && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Reading {b.fileName}…
                  </p>
                )}
                {b.status === "error" && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-destructive">
                    {b.error}
                    <Button size="sm" variant="outline" onClick={() => scan(b)}>
                      <ScanLine className="mr-1 h-4 w-4" /> Try again
                    </Button>
                  </div>
                )}
                {b.status === "done" && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input value={b.vendor} placeholder="Vendor" onChange={(e) => update(b.id, { vendor: e.target.value })} />
                    <Input value={b.description} placeholder="What for" onChange={(e) => update(b.id, { description: e.target.value })} />
                    <Input type="date" value={b.date} onChange={(e) => update(b.id, { date: e.target.value })} />
                    <Input type="number" value={b.total || ""} placeholder="Total ₹" onChange={(e) => update(b.id, { total: Number(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
              <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => setBills((c) => c.filter((x) => x.id !== b.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-end">
            <Button disabled={!ready.length} onClick={addAll}>
              Add {ready.length || ""} to report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillScanner;
