import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/event';

const STORAGE_KEY = 'event-companion-events';

export function useEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load events from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setEvents(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored events:', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save events to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        }
    }, [events, isLoading]);

    const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>) => {
        const newEvent: Event = {
            ...event,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
    }, []);

    const updateEvent = useCallback((updatedEvent: Event) => {
        setEvents((prev) =>
            prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        );
    }, []);

    const deleteEvent = useCallback((id: string) => {
        setEvents((prev) => prev.filter((event) => event.id !== id));
    }, []);

    const getEventById = useCallback(
        (id: string) => events.find((event) => event.id === id),
        [events]
    );

    const getEventsForDate = useCallback(
        (date: string) => events.filter((event) => event.date === date),
        [events]
    );

    const getUpcomingEvents = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return events
            .filter((event) => event.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [events]);

    return {
        events,
        isLoading,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventsForDate,
        getUpcomingEvents,
    };
}
