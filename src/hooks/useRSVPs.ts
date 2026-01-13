import { useState, useEffect, useCallback } from 'react';
import { RSVP } from '@/types/event';

const STORAGE_KEY = 'event-companion-rsvps';

export function useRSVPs() {
    const [rsvps, setRSVPs] = useState<RSVP[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load RSVPs from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRSVPs(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored RSVPs:', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save RSVPs to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
        }
    }, [rsvps, isLoading]);

    const addRSVP = useCallback((rsvp: Omit<RSVP, 'id' | 'createdAt'>) => {
        const newRSVP: RSVP = {
            ...rsvp,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        setRSVPs((prev) => [...prev, newRSVP]);
        return newRSVP;
    }, []);

    const updateRSVP = useCallback((updatedRSVP: RSVP) => {
        setRSVPs((prev) =>
            prev.map((rsvp) => (rsvp.id === updatedRSVP.id ? updatedRSVP : rsvp))
        );
    }, []);

    const deleteRSVP = useCallback((id: string) => {
        setRSVPs((prev) => prev.filter((rsvp) => rsvp.id !== id));
    }, []);

    const getRSVPsForEvent = useCallback(
        (eventId: string) => rsvps.filter((rsvp) => rsvp.eventId === eventId),
        [rsvps]
    );

    const getAttendeeCount = useCallback(
        (eventId: string) =>
            rsvps.filter(
                (rsvp) => rsvp.eventId === eventId && rsvp.status === 'attending'
            ).length,
        [rsvps]
    );

    const getMaybeCount = useCallback(
        (eventId: string) =>
            rsvps.filter(
                (rsvp) => rsvp.eventId === eventId && rsvp.status === 'maybe'
            ).length,
        [rsvps]
    );

    const hasRSVPed = useCallback(
        (eventId: string, email: string) =>
            rsvps.some((rsvp) => rsvp.eventId === eventId && rsvp.email === email),
        [rsvps]
    );

    const getRSVPByEmail = useCallback(
        (eventId: string, email: string) =>
            rsvps.find((rsvp) => rsvp.eventId === eventId && rsvp.email === email),
        [rsvps]
    );

    return {
        rsvps,
        isLoading,
        addRSVP,
        updateRSVP,
        deleteRSVP,
        getRSVPsForEvent,
        getAttendeeCount,
        getMaybeCount,
        hasRSVPed,
        getRSVPByEmail,
    };
}
