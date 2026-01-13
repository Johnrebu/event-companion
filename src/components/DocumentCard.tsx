import { format } from "date-fns";
import { Download, Trash2, FileText, Image, File } from "lucide-react";
import { Document, getFileType, formatFileSize } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentCardProps {
    document: Document;
    onPreview: (doc: Document) => void;
    onDelete: (doc: Document) => void;
}

export function DocumentCard({ document, onPreview, onDelete }: DocumentCardProps) {
    const fileType = getFileType(document.file_type);

    const getFileIcon = () => {
        switch (fileType) {
            case "image":
                return <Image className="h-8 w-8 text-blue-500" />;
            case "pdf":
                return <FileText className="h-8 w-8 text-red-500" />;
            case "word":
                return <FileText className="h-8 w-8 text-blue-700" />;
            default:
                return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    const handleDownload = () => {
        const link = window.document.createElement("a");
        link.href = document.file_url;
        link.download = document.file_name;
        link.target = "_blank";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div
                    className="cursor-pointer"
                    onClick={() => onPreview(document)}
                >
                    {/* Thumbnail or Icon */}
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {fileType === "image" ? (
                            <img
                                src={document.file_url}
                                alt={document.file_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getFileIcon()
                        )}
                    </div>

                    {/* File Info */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm truncate" title={document.file_name}>
                            {document.file_name}
                        </h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {document.event_name}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(document.file_size)}</span>
                            <span>{format(new Date(document.uploaded_at), "MMM d, yyyy")}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={handleDownload}
                    >
                        <Download className="h-3 w-3" />
                        Download
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{document.file_name}". This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(document)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
