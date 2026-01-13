import { useState, useRef } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/types/document";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    events: { id: string; name: string }[];
    onUpload: (
        files: File[],
        eventId: string,
        eventName: string
    ) => Promise<void>;
}

export function UploadDialog({
    open,
    onOpenChange,
    events,
    onUpload,
}: UploadDialogProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [newEventName, setNewEventName] = useState("");
    const [isNewEvent, setIsNewEvent] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        const eventId = isNewEvent ? crypto.randomUUID() : selectedEventId;
        const eventName = isNewEvent
            ? newEventName
            : events.find((e) => e.id === selectedEventId)?.name || "";

        if (!eventId || !eventName || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            await onUpload(files, eventId, eventName);
            // Reset and close
            setFiles([]);
            setSelectedEventId("");
            setNewEventName("");
            setIsNewEvent(false);
            onOpenChange(false);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const isValid =
        files.length > 0 &&
        (isNewEvent ? newEventName.trim() !== "" : selectedEventId !== "");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Documents</DialogTitle>
                    <DialogDescription>
                        Upload images, PDFs, or Word documents to your gallery.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Event Selection */}
                    <div className="space-y-2">
                        <Label>Select Event</Label>
                        <div className="flex gap-2">
                            <Select
                                value={isNewEvent ? "new" : selectedEventId}
                                onValueChange={(value) => {
                                    if (value === "new") {
                                        setIsNewEvent(true);
                                        setSelectedEventId("");
                                    } else {
                                        setIsNewEvent(false);
                                        setSelectedEventId(value);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map((event) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="new">+ Create New Event</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {isNewEvent && (
                            <Input
                                placeholder="Enter event name"
                                value={newEventName}
                                onChange={(e) => setNewEventName(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            "hover:border-primary hover:bg-primary/5"
                        )}
                    >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Drag & drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Supports images, PDFs, and Word documents
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-accent rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <File className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm truncate">{file.name}</span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => removeFile(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Uploading...</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!isValid || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>Upload {files.length > 0 && `(${files.length})`}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
