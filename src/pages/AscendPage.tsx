import React, { useState } from 'react';
import {
    Sparkles,
    Calendar,
    MapPin,
    Clock,
    UserCheck,
    FileSpreadsheet,
    QrCode,
    Shield,
    Users,
    Building2,
    BookOpen,
    CheckCircle,
    UserPlus,
} from 'lucide-react';
import { useAscendStore } from '@/hooks/useAscendStore';
import { AscendCheckInConsole } from '@/components/ascend/AscendCheckInConsole';
import { AscendRegistrationForm } from '@/components/ascend/AscendRegistrationForm';
import { DigitalEntryPassModal } from '@/components/ascend/DigitalEntryPassModal';
import { ExcelImportModal } from '@/components/ascend/ExcelImportModal';
import { QRScannerModal } from '@/components/ascend/QRScannerModal';
import { AscendAuthGuard } from '@/components/ascend/AscendAuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AscendAttendee, EVENT_DETAILS } from '@/types/ascend';
import { toast } from 'sonner';

export default function AscendPage() {
    const {
        attendees,
        isLoaded,
        stats,
        registerClient,
        toggleCheckIn,
        checkInByCodeOrPayload,
        deleteAttendee,
        importFromParsedRows,
        exportToExcel,
        downloadSampleTemplate,
        resetToDemoData,
    } = useAscendStore();

    // Modals state
    const [selectedAttendeeForPass, setSelectedAttendeeForPass] = useState<AscendAttendee | null>(null);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [isManualRegisterOpen, setIsManualRegisterOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('console');

    const handleRegistrationSuccess = (newAttendee: AscendAttendee) => {
        setSelectedAttendeeForPass(newAttendee);
        setIsPassModalOpen(true);
        setIsManualRegisterOpen(false);
    };

    const handleViewPass = (attendee: AscendAttendee) => {
        setSelectedAttendeeForPass(attendee);
        setIsPassModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#080B14] text-white selection:bg-amber-500 selection:text-slate-950 pb-20">
            {/* Atmospheric Background Glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-[15%] -top-[10%] h-[60vw] max-h-[700px] w-[60vw] max-w-[700px] rounded-full bg-gradient-to-br from-amber-600/15 via-violet-600/10 to-transparent blur-[140px]" />
                <div className="absolute -right-[15%] top-[20%] h-[50vw] max-h-[600px] w-[50vw] max-w-[600px] rounded-full bg-gradient-to-tl from-amber-500/15 via-blue-600/10 to-transparent blur-[130px]" />
            </div>

            <div className="relative z-10 container mx-auto px-3 sm:px-6 pt-6 sm:pt-8 max-w-7xl space-y-6 sm:space-y-8">
                {/* HERO BANNER */}
                <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-6 sm:p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3 max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                Exclusive Annual Conclave • Client & Guest Portal
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
                                The Aionion{' '}
                                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                                    Ascend
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                                Enterprise Registration, Automated QR Pass Issuance, and On-Day Check-in Desk.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <Calendar className="h-4 w-4 text-amber-400" />
                                    {EVENT_DETAILS.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="h-4 w-4 text-amber-400" />
                                    {EVENT_DETAILS.venue}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                    Morning & Evening Gatherings
                                </span>
                            </div>
                        </div>

                        {/* Fast Actions in Hero */}
                        <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 justify-start lg:justify-end">
                            <Button
                                onClick={() => setIsManualRegisterOpen(true)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-11 px-5 rounded-xl shadow-lg shadow-amber-500/20 gap-2 transition-all hover:scale-[1.02]"
                            >
                                <UserPlus className="h-4 w-4" />
                                Register New Client
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsScannerModalOpen(true)}
                                className="border-amber-500/40 bg-slate-900/80 text-amber-300 hover:bg-slate-800 text-xs h-11 px-5 rounded-xl gap-2"
                            >
                                <QrCode className="h-4 w-4" />
                                Open Gate QR Scanner
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MAIN TAB INTERFACE */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
                            <TabsTrigger
                                value="console"
                                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 transition-all gap-2"
                            >
                                <Users className="h-4 w-4" />
                                <span>Check-in Console & Register</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 transition-all gap-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Client Registration Form</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="guidelines"
                                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 transition-all gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                <span>Event Guide & Schedule</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB 1: CHECK-IN CONSOLE (PROTECTED BY AUTHENTICATION GUARD) */}
                    <TabsContent value="console" className="mt-0 focus-visible:outline-none">
                        <AscendAuthGuard
                            title="The Aionion Ascend — Client Register & Gate Console"
                            description="Restricted Access: Contains confidential client records, contact numbers, and gate attendance logs. Please authenticate with your authorized staff email and password."
                        >
                            <AscendCheckInConsole
                                attendees={attendees}
                                stats={stats}
                                onToggleCheckIn={toggleCheckIn}
                                onDeleteAttendee={deleteAttendee}
                                onOpenRegisterModal={() => setIsManualRegisterOpen(true)}
                                onOpenImportModal={() => setIsImportModalOpen(true)}
                                onOpenScannerModal={() => setIsScannerModalOpen(true)}
                                onViewPass={handleViewPass}
                                onExportExcel={() => exportToExcel()}
                                onResetDemoData={resetToDemoData}
                            />
                        </AscendAuthGuard>
                    </TabsContent>

                    {/* TAB 2: CLIENT REGISTRATION FORM */}
                    <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="text-center space-y-2 mb-6">
                                <h2 className="text-2xl sm:text-3xl font-black text-white">
                                    Client Registration & Pass Issuance
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Complete the 5-step identity and guest verification flow to generate an official digital entry pass.
                                </p>
                            </div>

                            <AscendRegistrationForm
                                existingAttendees={attendees}
                                onRegisterClient={registerClient}
                                onSuccess={handleRegistrationSuccess}
                            />
                        </div>
                    </TabsContent>

                    {/* TAB 3: EVENT GUIDELINES & SESSIONS */}
                    <TabsContent value="guidelines" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Session Timeline */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-400" />
                                    Conclave Sessions & Timings
                                </h3>

                                <div className="space-y-4">
                                    {EVENT_DETAILS.sessions.map((sess) => (
                                        <div
                                            key={sess.id}
                                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sess.badgeColor}`}>
                                                    {sess.label}
                                                </span>
                                                <span className="text-xs font-mono text-amber-400 font-semibold">
                                                    {sess.time}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {sess.description}
                                            </p>
                                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                                                <span>Gate Reporting: {sess.reportingTime}</span>
                                                <span>Valet Available</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Relationship Managers & Helpdesk */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <UserCheck className="h-5 w-5 text-amber-400" />
                                    Relationship Managers & Branches
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {EVENT_DETAILS.defaultRMs.map((rm) => (
                                        <div
                                            key={rm.code}
                                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-white">{rm.name}</span>
                                                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                    {rm.code}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-[11px]">{rm.team}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                                        <Shield className="h-4 w-4" /> Hospitality Coordination Note
                                    </p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        All Relationship Managers must be present at their assigned registration desks 30 minutes prior to session reporting times.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* MANUAL REGISTRATION MODAL */}
            <Dialog open={isManualRegisterOpen} onOpenChange={setIsManualRegisterOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0F19] border-slate-800 text-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl">
                    <DialogHeader className="border-b border-slate-800 pb-3">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-amber-400" />
                            Register Guest - The Aionion Ascend
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Fill in primary client identity, accompanying guest, RM attribution, and session.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <AscendRegistrationForm
                            existingAttendees={attendees}
                            onRegisterClient={registerClient}
                            onSuccess={handleRegistrationSuccess}
                            isModal
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* DIGITAL ENTRY PASS MODAL */}
            <DigitalEntryPassModal
                open={isPassModalOpen}
                onOpenChange={setIsPassModalOpen}
                attendee={selectedAttendeeForPass}
                triggerConfetti
            />

            {/* EXCEL BULK IMPORT MODAL */}
            <ExcelImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportRows={importFromParsedRows}
                onDownloadTemplate={downloadSampleTemplate}
            />

            {/* LIVE QR SCANNER MODAL */}
            <QRScannerModal
                open={isScannerModalOpen}
                onOpenChange={setIsScannerModalOpen}
                onCheckInCode={checkInByCodeOrPayload}
                onViewPass={handleViewPass}
            />
        </div>
    );
}
