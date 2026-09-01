import React, { useState, useMemo } from 'react';
import {
    User,
    Hash,
    Phone,
    Mail,
    Users,
    Briefcase,
    Calendar,
    Clock,
    Sparkles,
    Check,
    AlertCircle,
    UserPlus,
    Building,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
    AscendAttendee,
    RegistrationFormData,
    AscendSession,
    EVENT_DETAILS,
} from '@/types/ascend';

interface AscendRegistrationFormProps {
    onSuccess: (attendee: AscendAttendee) => void;
    existingAttendees?: AscendAttendee[];
    onRegisterClient: (formData: RegistrationFormData) => AscendAttendee;
    isModal?: boolean;
}

export const AscendRegistrationForm: React.FC<AscendRegistrationFormProps> = ({
    onSuccess,
    existingAttendees = [],
    onRegisterClient,
    isModal = false,
}) => {
    // Form state
    const [formData, setFormData] = useState<RegistrationFormData>({
        clientName: '',
        clientCode: '',
        contactNumber: '',
        email: '',
        hasAccompanyingGuest: false,
        accompanyingGuestName: '',
        accompanyingGuestMobile: '',
        rmCode: '',
        rmName: '',
        rmTeam: '',
        session: 'Morning Gathering',
        remarks: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suggestedCodes, setSuggestedCodes] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filter suggestions based on clientCode input
    const handleCodeChange = (codeVal: string) => {
        const val = codeVal.toUpperCase();
        setFormData((prev) => ({ ...prev, clientCode: val }));

        if (val.length >= 1) {
            const matches = existingAttendees
                .map((a) => a.clientCode)
                .filter((code) => code.toUpperCase().includes(val) && code.toUpperCase() !== val)
                .slice(0, 5);
            setSuggestedCodes(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setSuggestedCodes([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (code: string) => {
        const match = existingAttendees.find((a) => a.clientCode === code);
        if (match) {
            setFormData((prev) => ({
                ...prev,
                clientCode: match.clientCode,
                clientName: match.clientName || prev.clientName,
                contactNumber: match.contactNumber || prev.contactNumber,
                email: match.email || prev.email,
                rmCode: match.rmCode || prev.rmCode,
                rmName: match.rmName || prev.rmName,
                rmTeam: match.rmTeam || prev.rmTeam,
            }));
            toast.info(`Autofilled details for client code: ${code}`);
        } else {
            setFormData((prev) => ({ ...prev, clientCode: code }));
        }
        setShowSuggestions(false);
    };

    // RM Quick Selector
    const handleRMSelect = (rmCodeVal: string) => {
        if (rmCodeVal === 'custom') {
            setFormData((prev) => ({
                ...prev,
                rmCode: '',
                rmName: '',
                rmTeam: '',
            }));
            return;
        }

        const rm = EVENT_DETAILS.defaultRMs.find((r) => r.code === rmCodeVal);
        if (rm) {
            setFormData((prev) => ({
                ...prev,
                rmCode: rm.code,
                rmName: rm.name,
                rmTeam: rm.team,
            }));
        }
    };

    // Field validation
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // 1. Client Name (Required)
        if (!formData.clientName.trim()) {
            newErrors.clientName = "Client Name is required.";
        }

        // 2. Client Code (Required)
        if (!formData.clientCode.trim()) {
            newErrors.clientCode = "Client Code is required (e.g., K000773).";
        }

        // 3. Mobile Number (10 digits validation)
        const cleanPhone = formData.contactNumber.replace(/\D/g, '');
        if (!cleanPhone) {
            newErrors.contactNumber = "Mobile Number is required.";
        } else if (cleanPhone.length !== 10) {
            newErrors.contactNumber = "Please enter a valid 10-digit mobile number.";
        }

        // 4. Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email ID is required.";
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        // 5. Accompanying Guest validation (if Yes)
        if (formData.hasAccompanyingGuest) {
            if (!formData.accompanyingGuestName.trim()) {
                newErrors.accompanyingGuestName = "Accompanying Guest Full Name is required.";
            }
            if (formData.accompanyingGuestMobile) {
                const cleanGuestPhone = formData.accompanyingGuestMobile.replace(/\D/g, '');
                if (cleanGuestPhone.length !== 10) {
                    newErrors.accompanyingGuestMobile = "Guest mobile number must be 10 digits if provided.";
                }
            }
        }

        // 6. Session selection validation
        if (!formData.session) {
            newErrors.session = "Please select an event session.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please resolve the highlighted form errors before proceeding.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newAttendee = onRegisterClient(formData);
            toast.success(`Registration confirmed for ${newAttendee.clientName}!`);
            onSuccess(newAttendee);

            // Reset form
            setFormData({
                clientName: '',
                clientCode: '',
                contactNumber: '',
                email: '',
                hasAccompanyingGuest: false,
                accompanyingGuestName: '',
                accompanyingGuestMobile: '',
                rmCode: '',
                rmName: '',
                rmTeam: '',
                session: 'Morning Gathering',
                remarks: '',
            });
            setErrors({});
        } catch (err) {
            console.error('Registration failed:', err);
            toast.error("Failed to complete registration. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: CLIENT IDENTITY VERIFICATION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40">
                        1
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-amber-400" />
                            Client Identity Verification
                        </h3>
                        <p className="text-xs text-slate-400">
                            Primary invitee credentials as per portfolio registration
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Client Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="clientName" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Client Name <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                id="clientName"
                                placeholder="e.g. Priya Ramanathan"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                className={`pl-9 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 ${
                                    errors.clientName ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                }`}
                            />
                        </div>
                        {errors.clientName && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.clientName}
                            </p>
                        )}
                    </div>

                    {/* Client Code */}
                    <div className="space-y-1.5 relative">
                        <Label htmlFor="clientCode" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Client Code <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                id="clientCode"
                                placeholder="e.g. K000773"
                                value={formData.clientCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                onFocus={() => suggestedCodes.length > 0 && setShowSuggestions(true)}
                                className={`pl-9 font-mono uppercase bg-slate-950/80 border-slate-800 text-amber-300 placeholder:text-slate-600 ${
                                    errors.clientCode ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                }`}
                            />
                        </div>
                        {errors.clientCode && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.clientCode}
                            </p>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestedCodes.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-900 border border-amber-500/40 rounded-lg shadow-xl overflow-hidden">
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-amber-400 uppercase tracking-wider bg-slate-950 border-b border-slate-800">
                                    Suggested Existing Client Codes
                                </div>
                                {suggestedCodes.map((code) => (
                                    <button
                                        type="button"
                                        key={code}
                                        onClick={() => handleSelectSuggestion(code)}
                                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 flex items-center justify-between transition-colors font-mono"
                                    >
                                        <span>{code}</span>
                                        <span className="text-[10px] text-slate-400 font-sans">
                                            {existingAttendees.find((a) => a.clientCode === code)?.clientName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                        <Label htmlFor="contactNumber" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Mobile Number (10 Digits) <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">+91</span>
                            <Input
                                id="contactNumber"
                                type="tel"
                                maxLength={10}
                                placeholder="9840123456"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, '') })}
                                className={`pl-12 font-mono bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 ${
                                    errors.contactNumber ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                }`}
                            />
                        </div>
                        {errors.contactNumber && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.contactNumber}
                            </p>
                        )}
                    </div>

                    {/* Email ID */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Email Address <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="priya.ramanathan@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`pl-9 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 ${
                                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.email}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* STEP 2: ACCOMPANYING GUEST DETAILS (CONDITIONAL) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40">
                        2
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-400" />
                            Accompanying Guest Details
                        </h3>
                        <p className="text-xs text-slate-400">
                            Specify if spouse, co-director, or partner is attending with you
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Toggle: Will anyone accompany you? */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-200 block">
                                Will anyone be accompanying you to the event?
                            </span>
                            <span className="text-[11px] text-slate-400">
                                Total Attendees count will adjust automatically: {formData.hasAccompanyingGuest ? '2 Persons' : '1 Person'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, hasAccompanyingGuest: false })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    !formData.hasAccompanyingGuest
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                            >
                                No (1 Person)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, hasAccompanyingGuest: true })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    formData.hasAccompanyingGuest
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                            >
                                Yes (2 Persons)
                            </button>
                        </div>
                    </div>

                    {/* Conditional Guest Inputs */}
                    {formData.hasAccompanyingGuest && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/90 border border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Guest Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="guestName" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                    Accompanying Guest Full Name <span className="text-rose-400">*</span>
                                </Label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="guestName"
                                        placeholder="e.g. Arvind Ramanathan"
                                        value={formData.accompanyingGuestName}
                                        onChange={(e) => setFormData({ ...formData, accompanyingGuestName: e.target.value })}
                                        className={`pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 ${
                                            errors.accompanyingGuestName ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                        }`}
                                    />
                                </div>
                                {errors.accompanyingGuestName && (
                                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.accompanyingGuestName}
                                    </p>
                                )}
                            </div>

                            {/* Guest Mobile */}
                            <div className="space-y-1.5">
                                <Label htmlFor="guestMobile" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                    Guest Mobile Number <span className="text-slate-500 text-[10px]">(Optional)</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">+91</span>
                                    <Input
                                        id="guestMobile"
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9840987654"
                                        value={formData.accompanyingGuestMobile}
                                        onChange={(e) => setFormData({ ...formData, accompanyingGuestMobile: e.target.value.replace(/\D/g, '') })}
                                        className={`pl-12 font-mono bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 ${
                                            errors.accompanyingGuestMobile ? 'border-rose-500 ring-1 ring-rose-500' : 'focus:border-amber-500'
                                        }`}
                                    />
                                </div>
                                {errors.accompanyingGuestMobile && (
                                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.accompanyingGuestMobile}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* STEP 3: RELATIONSHIP MANAGER (RM) ATTRIBUTION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40">
                        3
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-amber-400" />
                            Relationship Manager (RM) Attribution
                        </h3>
                        <p className="text-xs text-slate-400">
                            Tag managing RM & branch location for hospitality coordination
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* RM Preset Dropdown */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">
                            Select Assigned RM / Branch
                        </Label>
                        <Select onValueChange={handleRMSelect} value={formData.rmCode || 'custom'}>
                            <SelectTrigger className="bg-slate-950/80 border-slate-800 text-white">
                                <SelectValue placeholder="Choose Relationship Manager" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                {EVENT_DETAILS.defaultRMs.map((rm) => (
                                    <SelectItem key={rm.code} value={rm.code} className="hover:bg-slate-800">
                                        {rm.name} ({rm.team}) — <span className="font-mono text-amber-400">{rm.code}</span>
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom" className="hover:bg-slate-800 text-slate-400">
                                    + Other / Enter Custom RM Details
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* RM Custom Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="rmCode" className="text-[11px] text-slate-400">RM Code</Label>
                            <Input
                                id="rmCode"
                                placeholder="e.g. RM-011"
                                value={formData.rmCode}
                                onChange={(e) => setFormData({ ...formData, rmCode: e.target.value })}
                                className="font-mono text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="rmName" className="text-[11px] text-slate-400">RM Name</Label>
                            <Input
                                id="rmName"
                                placeholder="e.g. Suresh Balakrishnan"
                                value={formData.rmName}
                                onChange={(e) => setFormData({ ...formData, rmName: e.target.value })}
                                className="text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="rmTeam" className="text-[11px] text-slate-400">RM Team / Branch</Label>
                            <Input
                                id="rmTeam"
                                placeholder="e.g. Royapettah 5"
                                value={formData.rmTeam}
                                onChange={(e) => setFormData({ ...formData, rmTeam: e.target.value })}
                                className="text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* STEP 4: SESSION SELECTION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40">
                        4
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            Session Selection
                        </h3>
                        <p className="text-xs text-slate-400">
                            Select preferred gathering slot for Sunday, 23 August 2026
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {EVENT_DETAILS.sessions.map((session) => {
                        const isSelected = formData.session === session.id;
                        return (
                            <div
                                key={session.id}
                                onClick={() => setFormData({ ...formData, session: session.id })}
                                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${
                                    isSelected
                                        ? 'border-amber-500 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 ring-1 ring-amber-500 shadow-xl'
                                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${session.badgeColor}`}>
                                            {session.label}
                                        </span>
                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                            isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                                        }`}>
                                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                        </div>
                                    </div>

                                    <div className="text-lg font-bold text-white pt-1">
                                        {session.time}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {session.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                                    <span>Reporting: {session.reportingTime}</span>
                                    <span className="font-semibold text-amber-400/80">Grand Ballroom</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* STEP 5: REMARKS & CONFIRMATION SUBMIT */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="text-center sm:text-left space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Step 5: Instant Pass Generation
                    </div>
                    <p className="text-xs text-slate-400">
                        Confirming will register the attendee and generate an official Digital Entry Pass with QR code.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                    {isSubmitting ? "Generating Pass..." : "Confirm & Generate Guest Pass →"}
                </Button>
            </div>
        </form>
    );
};
