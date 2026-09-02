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
    Layers,
    Clock,
    UserCheck,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { parseAscendRow, findBestSheet } from '@/utils/ascendExcelParser';

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
    const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [parsedRows, setParsedRows] = useState<Array<Record<string, any>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
    const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
        const worksheet = wb.Sheets[sheetName];
        if (!worksheet) return;

        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        if (json.length === 0) {
            toast.warning(`Sheet "${sheetName}" does not contain any data rows.`);
            setParsedRows([]);
            setColumnHeaders([]);
            return;
        }

        setParsedRows(json);
        setColumnHeaders(Object.keys(json[0] || {}));
        setSelectedSheet(sheetName);
        toast.success(`Loaded ${json.length} records from sheet "${sheetName}"`);
    };

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
                setWorkbookRef(workbook);

                const sheets = workbook.SheetNames;
                setAvailableSheets(sheets);

                const bestSheet = findBestSheet(workbook);
                loadSheetData(workbook, bestSheet);
            } catch (err) {
                console.error("Excel parse error:", err);
                toast.error("Failed to parse Excel file. Please ensure the file format is valid.");
            } finally {
                setIsProcessing(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSheetChange = (sheetName: string) => {
        if (!workbookRef) return;
        loadSheetData(workbookRef, sheetName);
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
        handleReset();
        onOpenChange(false);
    };

    const handleReset = () => {
        setParsedRows([]);
        setFileName('');
        setWorkbookRef(null);
        setAvailableSheets([]);
        setSelectedSheet('');
        setColumnHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Calculate preview parsed attendees to show accurate summary
    const parsedAttendeesPreview = parsedRows.slice(0, 5).map((r, i) => parseAscendRow(r, i).attendee).filter(Boolean);
    const morningCount = parsedRows.filter((r, i) => parseAscendRow(r, i).attendee?.session === 'Morning Gathering').length;
    const eveningCount = parsedRows.filter((r, i) => parseAscendRow(r, i).attendee?.session === 'Evening Gathering').length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-[#0B0F19] border-slate-800 text-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl">
                <DialogHeader className="border-b border-slate-800 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                            Bulk Import Guests from Excel / Google Forms
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownloadTemplate}
                            className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs gap-1.5 h-8 self-start sm:self-auto"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download Sample Template (.xlsx)
                        </Button>
                    </div>
                    <DialogDescription className="text-xs text-slate-400 pt-1">
                        Fully auto-detects <code className="text-amber-300">Client Name</code>, <code className="text-amber-300">ClientPhoneNumer</code>, <code className="text-amber-300">ClientEmailId</code>, <code className="text-amber-300">ClientCode</code>, <code className="text-amber-300">Session Timing</code>, <code className="text-amber-300">RM Attribution</code>, and <code className="text-amber-300">AUM Range</code>.
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
                                    Supports Microsoft Excel (.xlsx, .xls) and Google Sheets Form Responses
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* File parsed summary banner & Sheet selector */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 gap-3">
                                <div className="flex items-center gap-3">
                                    <FileCheck className="h-6 w-6 text-amber-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{fileName}</p>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <span className="text-xs text-slate-300 font-medium">
                                                {parsedRows.length} guest records ready
                                            </span>
                                            <span className="text-[11px] text-slate-500">•</span>
                                            <span className="text-[11px] text-amber-400">
                                                ☀️ {morningCount} Morning
                                            </span>
                                            <span className="text-[11px] text-slate-500">•</span>
                                            <span className="text-[11px] text-violet-400">
                                                🌙 {eveningCount} Evening
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {availableSheets.length > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="h-3.5 w-3.5 text-slate-400" />
                                            <Select value={selectedSheet} onValueChange={handleSheetChange}>
                                                <SelectTrigger className="w-[170px] bg-slate-950 border-slate-700 text-xs h-8 rounded-lg text-amber-300">
                                                    <SelectValue placeholder="Select Sheet" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                                                    {availableSheets.map((sh) => (
                                                        <SelectItem key={sh} value={sh} className="text-xs">
                                                            Sheet: {sh}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleReset}
                                        className="text-xs text-slate-400 hover:text-white h-8"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Change File
                                    </Button>
                                </div>
                            </div>

                            {/* Column mapping preview */}
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                        Detected Columns in Sheet ({columnHeaders.length}):
                                    </span>
                                    <span className="text-[11px] text-slate-500">Auto-mapped to Ascend format</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
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

                            {/* Preview Table First 5 Rows */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-400">
                                        Parsed Preview (First {Math.min(parsedAttendeesPreview.length, 5)} Records):
                                    </span>
                                    <span className="text-[11px] text-emerald-400 font-medium">
                                        ✓ Contact numbers & session timings validated
                                    </span>
                                </div>
                                <div className="max-h-44 overflow-x-auto overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0">
                                            <tr>
                                                <th className="p-2">Name</th>
                                                <th className="p-2">Code</th>
                                                <th className="p-2">Contact Number</th>
                                                <th className="p-2">Session</th>
                                                <th className="p-2">Accompanying Guest</th>
                                                <th className="p-2">RM & AUM</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-sans">
                                            {parsedAttendeesPreview.map((att, idx) => {
                                                if (!att) return null;
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-900/40 text-slate-300">
                                                        <td className="p-2 font-medium text-white">
                                                            {att.clientName}
                                                        </td>
                                                        <td className="p-2 font-mono text-amber-300">
                                                            {att.clientCode}
                                                        </td>
                                                        <td className="p-2 font-mono text-emerald-400 font-semibold">
                                                            +91 {att.contactNumber}
                                                        </td>
                                                        <td className="p-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] font-medium py-0 px-2 ${
                                                                    att.session === 'Morning Gathering'
                                                                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                                        : 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                                                }`}
                                                            >
                                                                {att.session}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-2">
                                                            {att.hasAccompanyingGuest && att.accompanyingGuestName ? (
                                                                <div>
                                                                    <span className="font-semibold text-slate-200">
                                                                        {att.accompanyingGuestName}
                                                                    </span>
                                                                    {att.accompanyingGuestMobile && (
                                                                        <span className="text-[10px] text-slate-400 font-mono block">
                                                                            +91 {att.accompanyingGuestMobile}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-600 italic">None</span>
                                                            )}
                                                        </td>
                                                        <td className="p-2 text-slate-400 text-[11px]">
                                                            <div>
                                                                {att.rmName ? (
                                                                    <span className="text-slate-200">{att.rmName}</span>
                                                                ) : '-'}
                                                                {att.rmTeam && (
                                                                    <span className="text-slate-500"> ({att.rmTeam})</span>
                                                                )}
                                                            </div>
                                                            {att.aumRange && (
                                                                <span className="text-[10px] text-amber-400/90 font-mono">
                                                                    AUM: {att.aumRange}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
