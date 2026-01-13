import { useState, useMemo } from "react";
import { Upload, Search, FolderOpen, Loader2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { useDocuments } from "@/hooks/useDocuments";
import { useEvents } from "@/hooks/useEvents";
import { Document } from "@/types/document";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDialog } from "@/components/UploadDialog";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ViewMode = "grid" | "list";

export default function GalleryPage() {
    const {
        documents,
        isLoading,
        error,
        uploadDocument,
        deleteDocument,
        getEventNames,
    } = useDocuments();
    const { events } = useEvents();

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [eventFilter, setEventFilter] = useState<string>("all");
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Combine events from documents and from useEvents
    const allEvents = useMemo(() => {
        const docEvents = getEventNames();
        const eventList = [...docEvents];

        // Add events from useEvents that don't exist in documents
        events.forEach((event) => {
            if (!eventList.find((e) => e.id === event.id)) {
                eventList.push({ id: event.id, name: event.name });
            }
        });

        return eventList;
    }, [getEventNames, events]);

    // Filter documents
    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            const matchesSearch = doc.file_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesEvent =
                eventFilter === "all" || doc.event_id === eventFilter;
            return matchesSearch && matchesEvent;
        });
    }, [documents, searchQuery, eventFilter]);

    const handleUpload = async (
        files: File[],
        eventId: string,
        eventName: string
    ) => {
        let successCount = 0;
        for (const file of files) {
            const result = await uploadDocument(file, eventId, eventName);
            if (result) successCount++;
        }

        if (successCount === files.length) {
            toast.success(`Uploaded ${successCount} file(s) successfully!`);
        } else {
            toast.warning(
                `Uploaded ${successCount} of ${files.length} files. Some failed.`
            );
        }
    };

    const handleDelete = async (doc: Document) => {
        const success = await deleteDocument(doc);
        if (success) {
            toast.success("Document deleted successfully!");
        } else {
            toast.error("Failed to delete document");
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="text-center py-12">
                        <p className="text-destructive mb-4">{error}</p>
                        <p className="text-muted-foreground text-sm">
                            Please check your Supabase configuration in .env.local
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Gallery</h1>
                            <p className="text-muted-foreground">
                                Store and manage your event documents
                            </p>
                        </div>
                        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Documents
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={eventFilter} onValueChange={setEventFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <FolderOpen className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by event" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                {allEvents.map((event) => (
                                    <SelectItem key={event.id} value={event.id}>
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex border rounded-lg p-1">
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            {documents.length === 0 ? (
                                <>
                                    <p>No documents yet</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setIsUploadOpen(true)}
                                    >
                                        Upload your first document
                                    </Button>
                                </>
                            ) : (
                                <p>No documents match your search</p>
                            )}
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                    : "space-y-3"
                            }
                        >
                            {filteredDocuments.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    document={doc}
                                    onPreview={setPreviewDoc}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {documents.length > 0 && (
                        <div className="text-center text-sm text-muted-foreground">
                            {filteredDocuments.length} of {documents.length} documents
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Dialog */}
            <UploadDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                events={allEvents}
                onUpload={handleUpload}
            />

            {/* Document Preview */}
            <DocumentPreview
                document={previewDoc}
                open={!!previewDoc}
                onOpenChange={(open) => !open && setPreviewDoc(null)}
            />
        </div>
    );
}
