export interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    capacity: number;
    category: 'conference' | 'workshop' | 'social' | 'meeting' | 'other';
    createdAt: string;
}

export interface RSVP {
    id: string;
    eventId: string;
    name: string;
    email: string;
    phone?: string;
    status: 'attending' | 'maybe' | 'not_attending';
    createdAt: string;
}

export type EventCategory = Event['category'];
export type RSVPStatus = RSVP['status'];

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Social' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
];

export const RSVP_STATUSES: { value: RSVPStatus; label: string; color: string }[] = [
    { value: 'attending', label: 'Attending', color: 'bg-green-500' },
    { value: 'maybe', label: 'Maybe', color: 'bg-yellow-500' },
    { value: 'not_attending', label: 'Not Attending', color: 'bg-red-500' },
];
