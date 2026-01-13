import { useState } from "react";
import { format } from "date-fns";
import { Download, Trash2, Search, Filter } from "lucide-react";
import { RSVP, RSVP_STATUSES, RSVPStatus } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface RSVPListProps {
    rsvps: RSVP[];
    eventName: string;
    onDelete: (id: string) => void;
}

const statusBadgeColors: Record<RSVPStatus, string> = {
    attending: "bg-green-500/10 text-green-600 border-green-500/30",
    maybe: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    not_attending: "bg-red-500/10 text-red-600 border-red-500/30",
};

export function RSVPList({ rsvps, eventName, onDelete }: RSVPListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<RSVPStatus | "all">("all");

    const filteredRSVPs = rsvps.filter((rsvp) => {
        const matchesSearch =
            rsvp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rsvp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || rsvp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleExportCSV = () => {
        const csvContent = [
            ["Name", "Email", "Phone", "Status", "Submitted On"],
            ...filteredRSVPs.map((rsvp) => [
                rsvp.name,
                rsvp.email,
                rsvp.phone || "",
                RSVP_STATUSES.find((s) => s.value === rsvp.status)?.label || rsvp.status,
                format(new Date(rsvp.createdAt), "yyyy-MM-dd HH:mm"),
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rsvps-${eventName.replace(/\s+/g, "-").toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const attendingCount = rsvps.filter((r) => r.status === "attending").length;
    const maybeCount = rsvps.filter((r) => r.status === "maybe").length;
    const notAttendingCount = rsvps.filter(
        (r) => r.status === "not_attending"
    ).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg">RSVPs ({rsvps.length})</CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={statusBadgeColors.attending}>
                            {attendingCount} Attending
                        </Badge>
                        <Badge variant="outline" className={statusBadgeColors.maybe}>
                            {maybeCount} Maybe
                        </Badge>
                        <Badge variant="outline" className={statusBadgeColors.not_attending}>
                            {notAttendingCount} Not Attending
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as RSVPStatus | "all")}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Responses</SelectItem>
                            {RSVP_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Table */}
                {filteredRSVPs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {rsvps.length === 0
                            ? "No RSVPs yet."
                            : "No RSVPs match your search."}
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRSVPs.map((rsvp) => {
                                    const statusLabel =
                                        RSVP_STATUSES.find((s) => s.value === rsvp.status)?.label ||
                                        rsvp.status;
                                    return (
                                        <TableRow key={rsvp.id}>
                                            <TableCell className="font-medium">{rsvp.name}</TableCell>
                                            <TableCell>{rsvp.email}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {rsvp.phone || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        statusBadgeColors[rsvp.status]
                                                    )}
                                                >
                                                    {statusLabel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {format(new Date(rsvp.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete RSVP?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove {rsvp.name}'s RSVP from the
                                                                event. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => onDelete(rsvp.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
