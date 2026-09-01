import React, { useState, useMemo } from 'react';
import {
    Search,
    UserPlus,
    FileSpreadsheet,
    Download,
    QrCode,
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    Printer,
    Trash2,
    Filter,
    Building2,
    Calendar,
    Sparkles,
    ShieldCheck,
    ChevronDown,
    SlidersHorizontal,
    MoreVertical,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AscendAttendee, AscendSession, CheckInStatus, EVENT_DETAILS } from '@/types/ascend';
import { toast } from 'sonner';

interface AscendCheckInConsoleProps {
    attendees: AscendAttendee[];
    stats: {
        totalRegisteredClients: number;
        totalExpectedAttendees: number;
        checkedInClients: number;
        checkedInAttendees: number;
        pendingAttendees: number;
        morningAttendees: number;
        morningCheckedIn: number;
        eveningAttendees: number;
        eveningCheckedIn: number;
        checkInPercentage: number;
    };
    onToggleCheckIn: (id: string) => AscendAttendee | null;
    onDeleteAttendee: (id: string) => void;
    onOpenRegisterModal: () => void;
    onOpenImportModal: () => void;
    onOpenScannerModal: () => void;
    onViewPass: (attendee: AscendAttendee) => void;
    onExportExcel: () => void;
    onResetDemoData: () => void;
}

export const AscendCheckInConsole: React.FC<AscendCheckInConsoleProps> = ({
    attendees,
    stats,
    onToggleCheckIn,
    onDeleteAttendee,
    onOpenRegisterModal,
    onOpenImportModal,
    onOpenScannerModal,
    onViewPass,
    onExportExcel,
    onResetDemoData,
}) => {
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sessionFilter, setSessionFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Filtered list
    const filteredAttendees = useMemo(() => {
        return attendees.filter((item) => {
            // Search query match
            const query = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !query ||
                item.clientName.toLowerCase().includes(query) ||
                item.clientCode.toLowerCase().includes(query) ||
                item.contactNumber.includes(query) ||
                (item.accompanyingGuestName && item.accompanyingGuestName.toLowerCase().includes(query)) ||
                (item.rmName && item.rmName.toLowerCase().includes(query)) ||
                (item.rmTeam && item.rmTeam.toLowerCase().includes(query)) ||
                (item.remarks && item.remarks.toLowerCase().includes(query));

            // Session match
            const matchesSession = sessionFilter === 'all' || item.session === sessionFilter;

            // Status match
            const matchesStatus = statusFilter === 'all' || item.checkInStatus === statusFilter;

            return matchesSearch && matchesSession && matchesStatus;
        });
    }, [attendees, searchTerm, sessionFilter, statusFilter]);

    const handleCheckInClick = (attendee: AscendAttendee) => {
        const updated = onToggleCheckIn(attendee.id);
        if (updated) {
            if (updated.checkInStatus === 'Checked-in') {
                toast.success(`Checked in: ${attendee.clientName} (${attendee.numberOfAttendees} attendee${attendee.numberOfAttendees > 1 ? 's' : ''})`);
            } else {
                toast.info(`Check-in undone for: ${attendee.clientName}`);
            }
        }
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            onDeleteAttendee(deleteTargetId);
            toast.success("Guest removed from register.");
            setDeleteTargetId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Expected Attendees */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <span>Total Expected</span>
                        <Users className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                            {stats.totalExpectedAttendees}
                        </span>
                        <span className="text-xs text-slate-400">
                            ({stats.totalRegisteredClients} Clients)
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Includes primary clients + guests
                    </p>
                </div>

                {/* Checked In Count */}
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/80 via-emerald-950/20 to-slate-900 p-4 sm:p-5 backdrop-blur-md relative overflow-hidden">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <span>Checked In</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                            {stats.checkedInAttendees}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {stats.checkInPercentage}%
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                        {stats.pendingAttendees} attendees pending arrival
                    </p>
                </div>

                {/* Morning Session */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <span>Morning Session</span>
                        <Clock className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                            {stats.morningCheckedIn}
                        </span>
                        <span className="text-xs text-slate-400">
                            / {stats.morningAttendees} Expected
                        </span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 mt-1">
                        09:30 AM – 01:30 PM
                    </p>
                </div>

                {/* Evening Session */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <span>Evening Session</span>
                        <Clock className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                            {stats.eveningCheckedIn}
                        </span>
                        <span className="text-xs text-slate-400">
                            / {stats.eveningAttendees} Expected
                        </span>
                    </div>
                    <p className="text-[11px] text-violet-400/80 mt-1">
                        04:30 PM – 08:30 PM
                    </p>
                </div>
            </div>

            {/* ACTION TOOLBAR & CONTROLS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Client Name, Code (e.g. K000773), Mobile, Guest Name, or RM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500 text-sm h-10 rounded-xl"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-3 text-slate-500 hover:text-white"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Selectors */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Session Filter */}
                        <Select value={sessionFilter} onValueChange={setSessionFilter}>
                            <SelectTrigger className="w-[150px] bg-slate-950/80 border-slate-800 text-slate-200 text-xs h-10 rounded-xl">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                                <SelectItem value="all">All Sessions</SelectItem>
                                <SelectItem value="Morning Gathering">Morning Gathering</SelectItem>
                                <SelectItem value="Evening Gathering">Evening Gathering</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Check-in Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-950/80 border-slate-800 text-slate-200 text-xs h-10 rounded-xl">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Checked-in">Checked-in</SelectItem>
                                <SelectItem value="Registered">Pending Check-in</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Scanner Launch Button */}
                        <Button
                            onClick={onOpenScannerModal}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs h-10 px-3.5 rounded-xl gap-1.5 font-semibold"
                        >
                            <QrCode className="h-4 w-4" />
                            <span className="hidden sm:inline">Scan QR Pass</span>
                        </Button>

                        {/* Excel Actions */}
                        <Button
                            variant="outline"
                            onClick={onOpenImportModal}
                            className="border-slate-700 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-10 px-3.5 rounded-xl gap-1.5"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                            <span className="hidden sm:inline">Import Excel</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onExportExcel}
                            className="border-slate-700 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-10 px-3.5 rounded-xl gap-1.5"
                        >
                            <Download className="h-4 w-4 text-sky-400" />
                            <span className="hidden sm:inline">Export .xlsx</span>
                        </Button>

                        {/* Add Guest Manually Button */}
                        <Button
                            onClick={onOpenRegisterModal}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl gap-1.5 shadow-md shadow-amber-500/20"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Add Guest</span>
                        </Button>
                    </div>
                </div>

                {/* Sub-bar: Results count & Quick reset actions */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <div>
                        Showing <span className="font-bold text-white">{filteredAttendees.length}</span> of{' '}
                        <span className="font-bold text-white">{attendees.length}</span> registered guests
                        {(searchTerm || sessionFilter !== 'all' || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSessionFilter('all');
                                    setStatusFilter('all');
                                }}
                                className="text-amber-400 ml-2 hover:underline"
                            >
                                (Clear filters)
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onResetDemoData}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                            title="Reset dataset with default corporate guests"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset Demo Data
                        </button>
                    </div>
                </div>
            </div>

            {/* CORPORATE GUEST REGISTER TABLE */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* Standard Corporate Columns Header */}
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">NAME</th>
                                <th className="py-3.5 px-3">CLIENT CODE</th>
                                <th className="py-3.5 px-3">CONTACT NUMBER</th>
                                <th className="py-3.5 px-3">GUEST NAME</th>
                                <th className="py-3.5 px-3 text-center">NO. OF ATTENDEES</th>
                                <th className="py-3.5 px-3">SESSION</th>
                                <th className="py-3.5 px-4 text-center">CHECK-IN STATUS</th>
                                <th className="py-3.5 px-3">REMARKS</th>
                                <th className="py-3.5 px-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/60 text-xs">
                            {filteredAttendees.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-500 space-y-2">
                                        <Users className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-400">No matching guests found</p>
                                        <p className="text-xs text-slate-600">
                                            Try adjusting your search criteria or register a new client.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendees.map((attendee) => {
                                    const isCheckedIn = attendee.checkInStatus === 'Checked-in';
                                    return (
                                        <tr
                                            key={attendee.id}
                                            className={`transition-colors ${
                                                isCheckedIn
                                                    ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                                                    : 'hover:bg-slate-800/40'
                                            }`}
                                        >
                                            {/* 1. NAME */}
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                                    <span>{attendee.clientName}</span>
                                                    {isCheckedIn && (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-normal">
                                                    {attendee.email}
                                                </div>
                                            </td>

                                            {/* 2. CLIENT CODE */}
                                            <td className="py-3 px-3">
                                                <span className="font-mono font-bold text-amber-300 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                    {attendee.clientCode}
                                                </span>
                                            </td>

                                            {/* 3. CONTACT NUMBER */}
                                            <td className="py-3 px-3 font-mono text-slate-300">
                                                +91 {attendee.contactNumber}
                                            </td>

                                            {/* 4. GUEST NAME */}
                                            <td className="py-3 px-3">
                                                {attendee.hasAccompanyingGuest && attendee.accompanyingGuestName ? (
                                                    <div>
                                                        <span className="font-semibold text-slate-200 block">
                                                            {attendee.accompanyingGuestName}
                                                        </span>
                                                        {attendee.accompanyingGuestMobile && (
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                +91 {attendee.accompanyingGuestMobile}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 italic">- None -</span>
                                                )}
                                            </td>

                                            {/* 5. NO. OF ATTENDEES */}
                                            <td className="py-3 px-3 text-center">
                                                <span
                                                    className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs ${
                                                        attendee.numberOfAttendees === 2
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                    }`}
                                                >
                                                    {attendee.numberOfAttendees}
                                                </span>
                                            </td>

                                            {/* 6. SESSION */}
                                            <td className="py-3 px-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[11px] font-medium ${
                                                        attendee.session === 'Morning Gathering'
                                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                            : 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                                    }`}
                                                >
                                                    {attendee.session}
                                                </Badge>
                                            </td>

                                            {/* 7. CHECK-IN STATUS & TOGGLE */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <button
                                                        onClick={() => handleCheckInClick(attendee)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                            isCheckedIn
                                                                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/30'
                                                                : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700'
                                                        }`}
                                                    >
                                                        {isCheckedIn ? (
                                                            <>
                                                                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                                                                Attended
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                                Check In
                                                            </>
                                                        )}
                                                    </button>

                                                    {isCheckedIn && attendee.checkInTimestamp && (
                                                        <span className="text-[10px] text-emerald-400/80 font-mono">
                                                            {new Date(attendee.checkInTimestamp).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 8. REMARKS / RM */}
                                            <td className="py-3 px-3 text-slate-400 text-xs max-w-[180px] truncate">
                                                {attendee.rmTeam || attendee.rmName ? (
                                                    <span className="block text-slate-300 text-[11px]">
                                                        RM: {[attendee.rmName, attendee.rmTeam].filter(Boolean).join(' • ')}
                                                    </span>
                                                ) : null}
                                                {attendee.remarks ? (
                                                    <span className="block text-[11px] text-slate-400 truncate">
                                                        {attendee.remarks}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>

                                            {/* 9. ACTIONS */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* View / Print Pass */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onViewPass(attendee)}
                                                        className="h-8 w-8 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                                                        title="View & Print Digital Pass"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>

                                                    {/* Row Menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-white"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white text-xs">
                                                            <DropdownMenuLabel>Guest Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => onViewPass(attendee)}
                                                                className="gap-2 cursor-pointer hover:bg-slate-800"
                                                            >
                                                                <FileText className="h-3.5 w-3.5 text-amber-400" />
                                                                View Digital Pass
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleCheckInClick(attendee)}
                                                                className="gap-2 cursor-pointer hover:bg-slate-800"
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                                {isCheckedIn ? 'Undo Check-in' : 'Mark as Attended'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800" />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteTargetId(attendee.id)}
                                                                className="gap-2 cursor-pointer text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Remove from Register
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
                <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Attendee from Register?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 text-xs">
                            This will remove the guest and cancel their digital entry pass. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                        >
                            Remove Guest
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
