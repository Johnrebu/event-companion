export type AscendSession = 'Morning Gathering' | 'Evening Gathering' | 'General';

export type CheckInStatus = 'Registered' | 'Checked-in' | 'Cancelled';

export interface RMProfile {
    code: string;
    name: string;
    team: string;
}

export interface AscendAttendee {
    id: string;
    clientName: string;
    clientCode: string;
    contactNumber: string; // 10-digit mobile number
    email: string;
    hasAccompanyingGuest: boolean;
    accompanyingGuestName?: string;
    accompanyingGuestMobile?: string;
    numberOfAttendees: number; // 1 or 2
    rmCode?: string;
    rmName?: string;
    rmTeam?: string;
    session: AscendSession;
    checkInStatus: CheckInStatus;
    checkInTimestamp?: string; // ISO string when checked in
    remarks?: string;
    registeredAt: string; // ISO string
    qrPayload: string; // Unique string encoded into the QR code
}

export interface RegistrationFormData {
    clientName: string;
    clientCode: string;
    contactNumber: string;
    email: string;
    hasAccompanyingGuest: boolean;
    accompanyingGuestName: string;
    accompanyingGuestMobile: string;
    rmCode: string;
    rmName: string;
    rmTeam: string;
    session: AscendSession;
    remarks?: string;
}

export const EVENT_DETAILS = {
    name: "The Aionion Ascend",
    date: "Sunday, 23 August 2026",
    venue: "Grand Ballroom, The Leela Palace, Chennai",
    sessions: [
        {
            id: "Morning Gathering" as AscendSession,
            label: "Morning Gathering",
            time: "09:30 AM – 01:30 PM",
            reportingTime: "09:00 AM",
            description: "HNW Strategy Keynote, Portfolio Overview & Executive Networking Lunch",
            badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        },
        {
            id: "Evening Gathering" as AscendSession,
            label: "Evening Gathering",
            time: "04:30 PM – 08:30 PM",
            reportingTime: "04:00 PM",
            description: "Vision 2030 Fireside, Wealth Structuring & Gala Cocktail Dinner",
            badgeColor: "border-violet-500/40 bg-violet-500/10 text-violet-300",
        },
    ],
    defaultRMs: [
        { code: "RM-011", name: "Suresh Balakrishnan", team: "Royapettah 5" },
        { code: "RM-014", name: "Ananya Deshmukh", team: "Alwarpet" },
        { code: "RM-022", name: "Karthik Subramanian", team: "Anna Nagar" },
        { code: "RM-035", name: "Meera Venkatesh", team: "Nungambakkam" },
        { code: "RM-048", name: "Vikram Sundaram", team: "Adyar Private Wealth" },
        { code: "RM-059", name: "Pooja Ramanathan", team: "T. Nagar" },
    ] as RMProfile[],
};
