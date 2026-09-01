import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    UploadCloud,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    AlertCircle,
    FileCheck,
    RefreshCw,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ExcelImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportRows: (rows: Array<Record<string, any>>, mode: 'append' | 'replace') => { importedCount: number; errors: string[] };
    onDownloadTemplate: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
    open,
    onOpenChange,
    onImportRows,
    onDownloadTemplate,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');
    const [parsedRows, setParsedRows] = useState<Array<Record<string, any>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
    const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (file: File) => {
        if (!file) return;

        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExtensions.includes(ext)) {
            toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.");
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

                if (json.length === 0) {
                    toast.error("The uploaded file does not contain any data rows.");
                    setIsProcessing(false);
                    return;
                }

                setParsedRows(json);
                setColumnHeaders(Object.keys(json[0] || {}));
                toast.success(`Successfully parsed ${json.length} records from ${file.name}`);
            } catch (err) {
                console.error("Excel parse error:", err);
                toast.error("Failed to parse Excel file. Please ensure the file format is valid.");
            } finally {
                setIsProcessing(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleConfirmImport = () => {
        if (parsedRows.length === 0) {
            toast.error("No records to import.");
            return;
        }

        const result = onImportRows(parsedRows, importMode);
        toast.success(`Successfully imported ${result.importedCount} guest records!`);
        if (result.errors.length > 0) {
            toast.warning(`${result.errors.length} rows had warnings or were skipped.`);
        }

        // Reset and close
        setParsedRows([]);
        setFileName('');
        setColumnHeaders([]);
        onOpenChange(false);
    };

    const handleReset = () => {
        setParsedRows([]);
        setFileName('');
        setColumnHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#0B0F19] border-slate-800 text-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl">
                <DialogHeader className="border-b border-slate-800 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                            Bulk Import Guests from Excel / CSV
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownloadTemplate}
                            className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs gap-1.5 h-8"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download Sample Template (.xlsx)
                        </Button>
                    </div>
                    <DialogDescription className="text-xs text-slate-400 pt-1">
                        Automatically maps: <code className="text-amber-300">Client Name</code>, <code className="text-amber-300">Client Code</code>, <code className="text-amber-300">Contact Number</code>, <code className="text-amber-300">Email</code>, <code className="text-amber-300">Accompanying Guest</code>, and <code className="text-amber-300">RM Attribution</code>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Dropzone / Upload Area */}
                    {parsedRows.length === 0 ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                                dragActive
                                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                            <div className="h-14 w-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <UploadCloud className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-white">
                                    Click to browse or drag & drop Excel / CSV file
                                </p>
                                <p className="text-xs text-slate-500">
                                    Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* File parsed summary banner */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-amber-500/30">
                                <div className="flex items-center gap-3">
                                    <FileCheck className="h-6 w-6 text-amber-400" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{fileName}</p>
                                        <p className="text-xs text-slate-400">
                                            {parsedRows.length} guest records ready for import
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                    Choose Another File
                                </Button>
                            </div>

                            {/* Column mapping preview */}
                            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    Detected File Columns ({columnHeaders.length}):
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {columnHeaders.map((col) => (
                                        <span
                                            key={col}
                                            className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700"
                                        >
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Table First 3 Rows */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold text-slate-400">Preview (First 3 Records):</span>
                                <div className="max-h-36 overflow-x-auto overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0">
                                            <tr>
                                                <th className="p-2">Name</th>
                                                <th className="p-2">Code</th>
                                                <th className="p-2">Phone</th>
                                                <th className="p-2">Guest</th>
                                                <th className="p-2">RM / Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-sans">
                                            {parsedRows.slice(0, 3).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-900/40 text-slate-300">
                                                    <td className="p-2 font-medium text-white">
                                                        {row['Client Name'] || row['Name'] || Object.values(row)[0]}
                                                    </td>
                                                    <td className="p-2 font-mono text-amber-300">
                                                        {row['Client Code'] || row['Code'] || '-'}
                                                    </td>
                                                    <td className="p-2 font-mono">
                                                        {row['Client Phone Number / Mobile'] || row['Contact Number'] || row['Phone'] || '-'}
                                                    </td>
                                                    <td className="p-2">
                                                        {row['Accompanying Guest Name'] || row['Guest Name'] || '-'}
                                                    </td>
                                                    <td className="p-2 text-slate-400 text-[11px]">
                                                        {row['RM Name'] || row['RM Team'] || row['Remarks'] || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Import Mode Options */}
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                                <Label className="text-xs font-semibold text-slate-300">Import Mode</Label>
                                <RadioGroup
                                    value={importMode}
                                    onValueChange={(val) => setImportMode(val as 'append' | 'replace')}
                                    className="flex flex-col sm:flex-row gap-3 pt-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="append" id="append-mode" />
                                        <Label htmlFor="append-mode" className="text-xs text-slate-300 cursor-pointer">
                                            Append to existing register (Recommended)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="replace" id="replace-mode" />
                                        <Label htmlFor="replace-mode" className="text-xs text-slate-300 cursor-pointer">
                                            Replace current register
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-slate-800 pt-4 flex items-center justify-between sm:justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-400 hover:text-white text-xs"
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={parsedRows.length === 0 || isProcessing}
                        onClick={handleConfirmImport}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                    >
                        {isProcessing ? "Processing..." : `Import ${parsedRows.length} Guest Records →`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
