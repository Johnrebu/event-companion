import { useState, useMemo } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventCalendarProps {
    events: Event[];
    onDateSelect: (date: Date) => void;
    onEventClick: (event: Event) => void;
}

const categoryColors: Record<Event["category"], string> = {
    conference: "bg-blue-500",
    workshop: "bg-purple-500",
    social: "bg-pink-500",
    meeting: "bg-green-500",
    other: "bg-gray-500",
};

export function EventCalendar({
    events,
    onDateSelect,
    onEventClick,
}: EventCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const firstDayOfWeek = startOfMonth(currentMonth).getDay();

    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter((event) =>
            isSameDay(new Date(event.date), selectedDate)
        );
    }, [events, selectedDate]);

    const getEventsForDay = (day: Date) => {
        return events.filter((event) => isSameDay(new Date(event.date), day));
    };

    const handlePrevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        onDateSelect(day);
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle className="text-lg">
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before first of month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Day cells */}
                        {daysInMonth.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "aspect-square p-1 rounded-lg transition-all hover:bg-accent relative flex flex-col items-center justify-start",
                                        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                                        isToday && !isSelected && "ring-2 ring-primary ring-offset-1"
                                    )}
                                >
                                    <span className="text-sm font-medium">{format(day, "d")}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        categoryColors[event.category]
                                                    )}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <span className="text-[10px] leading-none">+{dayEvents.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Selected date events */}
            {selectedDate && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Events on {format(selectedDate, "MMMM d, yyyy")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {eventsForSelectedDate.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No events on this date.</p>
                        ) : (
                            <div className="space-y-2">
                                {eventsForSelectedDate.map((event) => (
                                    <button
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className="w-full p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full flex-shrink-0",
                                                    categoryColors[event.category]
                                                )}
                                            />
                                            <span className="font-medium text-sm truncate">
                                                {event.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {event.startTime} - {event.endTime} • {event.venue}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
