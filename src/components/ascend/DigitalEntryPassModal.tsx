import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
    Sparkles,
    Calendar,
    Clock,
    MapPin,
    Users,
    Download,
    Printer,
    CheckCircle2,
    Share2,
    Building2,
    UserCheck,
    X,
} from 'lucide-react';
import { AscendAttendee, EVENT_DETAILS } from '@/types/ascend';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DigitalEntryPassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendee: AscendAttendee | null;
    triggerConfetti?: boolean;
}

export const DigitalEntryPassModal: React.FC<DigitalEntryPassModalProps> = ({
    open,
    onOpenChange,
    attendee,
    triggerConfetti = true,
}) => {
    const passRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && triggerConfetti && attendee) {
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#F59E0B', '#D97706', '#6366F1', '#38BDF8', '#FFFFFF'],
                });
            } catch (e) {
                // Ignore if canvas-confetti fails in test environment
            }
        }
    }, [open, triggerConfetti, attendee]);

    if (!attendee) return null;

    const sessionInfo = EVENT_DETAILS.sessions.find((s) => s.id === attendee.session) || EVENT_DETAILS.sessions[0];

    const handlePrint = () => {
        window.print();
    };

    const handleCopyDetails = () => {
        const text = `The Aionion Ascend - Guest Pass
Attendee: ${attendee.clientName}
Client Code: ${attendee.clientCode}
Session: ${attendee.session} (${sessionInfo.time})
Attendees: ${attendee.numberOfAttendees} ${attendee.hasAccompanyingGuest ? `(+ Guest: ${attendee.accompanyingGuestName})` : ''}
Venue: ${EVENT_DETAILS.venue}
Date: ${EVENT_DETAILS.date}
Verification QR: ${attendee.qrPayload}`;

        navigator.clipboard.writeText(text);
        toast.success("Pass details copied to clipboard!");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 overflow-hidden bg-[#0B0F19] border-amber-500/30 text-white shadow-2xl rounded-2xl sm:rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Digital Entry Pass - {attendee.clientName}</DialogTitle>
                    <DialogDescription>
                        Official Digital Entry Pass for The Aionion Ascend
                    </DialogDescription>
                </DialogHeader>

                {/* Header Brand Strip */}
                <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-6 py-3 text-slate-950 flex items-center justify-between font-bold text-xs tracking-wider uppercase">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        <span>Official VIP Entry Pass</span>
                    </div>
                    <span className="bg-black/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        {attendee.clientCode || 'INVITED GUEST'}
                    </span>
                </div>

                {/* Printable Pass Container */}
                <div ref={passRef} id="printable-entry-pass" className="p-6 sm:p-7 space-y-6">
                    {/* Event Branding Header */}
                    <div className="text-center space-y-1.5 pb-4 border-b border-slate-800 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-1">
                            <Building2 className="h-3.5 w-3.5" />
                            Aionion Capital Annual Conclave
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            The Aionion <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Ascend</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium">
                            {EVENT_DETAILS.date} • {EVENT_DETAILS.venue}
                        </p>
                    </div>

                    {/* Attendee VIP Card */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/20 p-5 shadow-inner">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                            <div className="space-y-3 text-center sm:text-left flex-1">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                        Primary Client Name
                                    </div>
                                    <div className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                                        <span>{attendee.clientName}</span>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                    <div>
                                        <span className="text-slate-400 block">Client Code</span>
                                        <span className="font-mono font-bold text-amber-300 text-sm">
                                            {attendee.clientCode}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Contact</span>
                                        <span className="font-mono text-slate-200">
                                            +91 {attendee.contactNumber}
                                        </span>
                                    </div>
                                </div>

                                {attendee.hasAccompanyingGuest && attendee.accompanyingGuestName && (
                                    <div className="pt-2 border-t border-slate-800 text-xs text-left bg-slate-950/50 p-2.5 rounded-lg">
                                        <span className="text-slate-400 block font-medium">Accompanying Guest:</span>
                                        <span className="font-semibold text-slate-200">
                                            {attendee.accompanyingGuestName}
                                        </span>
                                        {attendee.accompanyingGuestMobile && (
                                            <span className="text-slate-400 ml-2 font-mono">
                                                (+91 {attendee.accompanyingGuestMobile})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* QR Code Container */}
                            <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-lg border-2 border-amber-400/40">
                                <QRCodeSVG
                                    value={attendee.qrPayload || attendee.clientCode}
                                    size={110}
                                    level="H"
                                    includeMargin={false}
                                />
                                <span className="text-[10px] font-mono text-slate-700 font-bold mt-1.5 tracking-wider">
                                    SCAN AT GATE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Session & Allocation Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{attendee.session}</span>
                            </div>
                            <p className="text-slate-300 font-medium">{sessionInfo.time}</p>
                            <p className="text-[11px] text-slate-500">Reporting: {sessionInfo.reportingTime}</p>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                <Users className="h-3.5 w-3.5" />
                                <span>Total Attendees</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-white">
                                    {attendee.numberOfAttendees} {attendee.numberOfAttendees === 2 ? 'Persons' : 'Person'}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    {attendee.numberOfAttendees === 2 ? 'Double Admit' : 'Single Admit'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                {attendee.rmTeam ? `Branch: ${attendee.rmTeam}` : 'Corporate Register'}
                            </p>
                        </div>
                    </div>

                    {/* RM Attribution Footer Note */}
                    {(attendee.rmName || attendee.rmTeam) && (
                        <div className="flex items-center justify-between text-[11px] bg-slate-950/60 px-3.5 py-2 rounded-lg border border-slate-800 text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                                <span>Relationship Manager:</span>
                                <span className="font-semibold text-slate-200">{attendee.rmName || 'Assigned RM'}</span>
                            </div>
                            <span className="text-slate-500">{attendee.rmTeam}</span>
                        </div>
                    )}

                    {/* Important Instructions */}
                    <div className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 space-y-1">
                        <p className="font-semibold text-slate-300 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-400" /> Entry Guidelines:
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                            <li>Please present this digital pass or physical QR printout at the Grand Ballroom desk.</li>
                            <li>Valet parking is complimentary for all registered attendees.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyDetails}
                        className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs gap-1.5"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Copy Pass Info
                    </Button>

                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handlePrint}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs gap-1.5 shadow-md shadow-amber-500/20"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Print / Save Pass
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-white text-xs"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
