import { useState } from "react";
import { Plus, List, CalendarDays, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { useEvents } from "@/hooks/useEvents";
import { useRSVPs } from "@/hooks/useRSVPs";
import { EventFormDialog } from "@/components/EventFormDialog";
import { EventCard } from "@/components/EventCard";
import { EventCalendar } from "@/components/EventCalendar";
import { RSVPDialog } from "@/components/RSVPDialog";
import { RSVPList } from "@/components/RSVPList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

type ViewMode = "grid" | "calendar";

export default function EventsPage() {
    const { events, addEvent, updateEvent, deleteEvent } = useEvents();
    const { rsvps, addRSVP, updateRSVP, deleteRSVP, getRSVPsForEvent, getAttendeeCount, getRSVPByEmail } = useRSVPs();

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | undefined>();
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);
    const [isRSVPListOpen, setIsRSVPListOpen] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

    // Event handlers
    const handleCreateEvent = (eventData: Omit<Event, "id" | "createdAt">) => {
        addEvent(eventData);
        toast.success("Event created successfully!");
    };

    const handleUpdateEvent = (eventData: Omit<Event, "id" | "createdAt">) => {
        if (editingEvent) {
            updateEvent({ ...editingEvent, ...eventData });
            toast.success("Event updated successfully!");
            setEditingEvent(undefined);
        }
    };

    const handleDeleteEvent = () => {
        if (deleteEventId) {
            deleteEvent(deleteEventId);
            // Also delete all RSVPs for this event
            const eventRSVPs = getRSVPsForEvent(deleteEventId);
            eventRSVPs.forEach((rsvp) => deleteRSVP(rsvp.id));
            toast.success("Event deleted successfully!");
            setDeleteEventId(null);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setIsEventFormOpen(true);
    };

    const handleRSVPClick = (event: Event) => {
        setSelectedEvent(event);
        setIsRSVPDialogOpen(true);
    };

    const handleRSVPSubmit = (rsvpData: Omit<typeof rsvps[0], "id" | "createdAt">) => {
        if (!selectedEvent) return;

        const existingRSVP = getRSVPByEmail(selectedEvent.id, rsvpData.email);
        if (existingRSVP) {
            updateRSVP({ ...existingRSVP, ...rsvpData });
            toast.success("RSVP updated successfully!");
        } else {
            addRSVP(rsvpData);
            toast.success("RSVP submitted successfully!");
        }
    };

    const handleViewRSVPs = (event: Event) => {
        setSelectedEvent(event);
        setIsRSVPListOpen(true);
    };

    const handleEventClickFromCalendar = (event: Event) => {
        setSelectedEvent(event);
        setIsRSVPListOpen(true);
    };

    const upcomingEvents = events
        .filter((e) => e.date >= new Date().toISOString().split("T")[0])
        .sort((a, b) => a.date.localeCompare(b.date));

    const pastEvents = events
        .filter((e) => e.date < new Date().toISOString().split("T")[0])
        .sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Events</h1>
                            <p className="text-muted-foreground">
                                Manage your events and track RSVPs
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex border rounded-lg p-1">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="gap-1"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grid</span>
                                </Button>
                                <Button
                                    variant={viewMode === "calendar" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("calendar")}
                                    className="gap-1"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    <span className="hidden sm:inline">Calendar</span>
                                </Button>
                            </div>
                            <Button onClick={() => setIsEventFormOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Event
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    {viewMode === "calendar" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <EventCalendar
                                    events={events}
                                    onDateSelect={() => { }}
                                    onEventClick={handleEventClickFromCalendar}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No upcoming events</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsEventFormOpen(true)}
                                        >
                                            Create your first event
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {upcomingEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                attendeeCount={getAttendeeCount(event.id)}
                                                onRSVP={handleRSVPClick}
                                                onEdit={handleEditEvent}
                                                onDelete={(id) => setDeleteEventId(id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Tabs defaultValue="upcoming" className="w-full">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="upcoming">
                                    Upcoming ({upcomingEvents.length})
                                </TabsTrigger>
                                <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upcoming" className="mt-6">
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No upcoming events</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsEventFormOpen(true)}
                                        >
                                            Create your first event
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {upcomingEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                attendeeCount={getAttendeeCount(event.id)}
                                                onRSVP={handleRSVPClick}
                                                onEdit={handleEditEvent}
                                                onDelete={(id) => setDeleteEventId(id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="past" className="mt-6">
                                {pastEvents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No past events</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pastEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                attendeeCount={getAttendeeCount(event.id)}
                                                onRSVP={() => handleViewRSVPs(event)}
                                                onEdit={handleEditEvent}
                                                onDelete={(id) => setDeleteEventId(id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>

            {/* Event Form Dialog */}
            <EventFormDialog
                open={isEventFormOpen}
                onOpenChange={(open) => {
                    setIsEventFormOpen(open);
                    if (!open) setEditingEvent(undefined);
                }}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                editEvent={editingEvent}
            />

            {/* RSVP Dialog */}
            <RSVPDialog
                open={isRSVPDialogOpen}
                onOpenChange={setIsRSVPDialogOpen}
                event={selectedEvent}
                attendeeCount={selectedEvent ? getAttendeeCount(selectedEvent.id) : 0}
                onSubmit={handleRSVPSubmit}
            />

            {/* RSVP List Sheet */}
            <Sheet open={isRSVPListOpen} onOpenChange={setIsRSVPListOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{selectedEvent?.name}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                        {selectedEvent && (
                            <>
                                <div className="mb-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setIsRSVPListOpen(false);
                                            setIsRSVPDialogOpen(true);
                                        }}
                                    >
                                        Add RSVP
                                    </Button>
                                </div>
                                <RSVPList
                                    rsvps={getRSVPsForEvent(selectedEvent.id)}
                                    eventName={selectedEvent.name}
                                    onDelete={deleteRSVP}
                                />
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteEventId}
                onOpenChange={(open) => !open && setDeleteEventId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the event and all associated RSVPs.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEvent}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Event
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
