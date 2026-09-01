import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Calendar,
    MapPin,
    Clock,
    ArrowLeft,
    ShieldCheck,
    Building2,
} from 'lucide-react';
import { useAscendStore } from '@/hooks/useAscendStore';
import { AscendRegistrationForm } from '@/components/ascend/AscendRegistrationForm';
import { DigitalEntryPassModal } from '@/components/ascend/DigitalEntryPassModal';
import { AscendAttendee, EVENT_DETAILS } from '@/types/ascend';
import coronaLogo from '@/assets/corona-logo.png';
import { Button } from '@/components/ui/button';

export default function AscendRegisterPage() {
    const { attendees, registerClient } = useAscendStore();
    const [registeredAttendee, setRegisteredAttendee] = useState<AscendAttendee | null>(null);
    const [isPassOpen, setIsPassOpen] = useState(false);

    const handleSuccess = (attendee: AscendAttendee) => {
        setRegisteredAttendee(attendee);
        setIsPassOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#080B14] text-white selection:bg-amber-500 selection:text-slate-950 pb-20">
            {/* Ambient Background Lights */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-[20%] -top-[10%] h-[70vw] max-h-[800px] w-[70vw] max-w-[800px] rounded-full bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent blur-[140px]" />
                <div className="absolute -right-[20%] bottom-[10%] h-[70vw] max-h-[800px] w-[70vw] max-w-[800px] rounded-full bg-gradient-to-tl from-violet-600/15 via-blue-600/10 to-transparent blur-[140px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl space-y-8">
                {/* Navigation Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/ascend"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Ascend Command Center</span>
                    </Link>

                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Secure Client Gateway</span>
                    </div>
                </div>

                {/* Header Card */}
                <div className="text-center space-y-4 pt-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        Official Guest Registration Portal
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                        The Aionion{' '}
                        <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            Ascend
                        </span>
                    </h1>

                    <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-light">
                        Please verify your client credentials and RSVP details below to generate your personalized VIP Digital Entry Pass.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-300 pt-2">
                        <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                            <Calendar className="h-4 w-4 text-amber-400" />
                            {EVENT_DETAILS.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                            <MapPin className="h-4 w-4 text-amber-400" />
                            {EVENT_DETAILS.venue}
                        </span>
                    </div>
                </div>

                {/* Registration Form Component */}
                <div className="mt-8">
                    <AscendRegistrationForm
                        existingAttendees={attendees}
                        onRegisterClient={registerClient}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>

            {/* Pass Modal */}
            <DigitalEntryPassModal
                open={isPassOpen}
                onOpenChange={setIsPassOpen}
                attendee={registeredAttendee}
                triggerConfetti
            />
        </div>
    );
}
