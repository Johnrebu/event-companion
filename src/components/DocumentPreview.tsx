import { Download, X, ExternalLink } from "lucide-react";
import { Document, getFileType } from "@/types/document";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewProps {
    document: Document | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DocumentPreview({
    document,
    open,
    onOpenChange,
}: DocumentPreviewProps) {
    if (!document) return null;

    const fileType = getFileType(document.file_type);

    const handleDownload = () => {
        const link = window.document.createElement("a");
        link.href = document.file_url;
        link.download = document.file_name;
        link.target = "_blank";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        window.open(document.file_url, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="truncate pr-4">{document.file_name}</DialogTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {fileType === "image" && (
                        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
                            <img
                                src={document.file_url}
                                alt={document.file_name}
                                className="max-w-full max-h-[60vh] object-contain rounded"
                            />
                        </div>
                    )}

                    {fileType === "pdf" && (
                        <div className="w-full h-[60vh] rounded-lg overflow-hidden">
                            <iframe
                                src={document.file_url}
                                className="w-full h-full border-0"
                                title={document.file_name}
                            />
                        </div>
                    )}

                    {(fileType === "word" || fileType === "other") && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p className="mb-4">Preview not available for this file type.</p>
                            <div className="flex gap-2">
                                <Button onClick={handleOpenInNewTab}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in New Tab
                                </Button>
                                <Button variant="outline" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
