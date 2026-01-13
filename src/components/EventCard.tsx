import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { Event, EVENT_CATEGORIES } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
    event: Event;
    attendeeCount: number;
    onRSVP: (event: Event) => void;
    onEdit: (event: Event) => void;
    onDelete: (eventId: string) => void;
}

const categoryColors: Record<Event["category"], string> = {
    conference: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    workshop: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    social: "bg-pink-500/10 text-pink-600 border-pink-500/30",
    meeting: "bg-green-500/10 text-green-600 border-green-500/30",
    other: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

export function EventCard({
    event,
    attendeeCount,
    onRSVP,
    onEdit,
    onDelete,
}: EventCardProps) {
    const categoryLabel =
        EVENT_CATEGORIES.find((c) => c.value === event.category)?.label || "Other";
    const isFull = attendeeCount >= event.capacity;
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate >= new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <Card className={cn(
            "group transition-all duration-300 hover:shadow-lg",
            !isUpcoming && "opacity-60"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                        <Badge
                            variant="outline"
                            className={cn("text-xs font-medium", categoryColors[event.category])}
                        >
                            {categoryLabel}
                        </Badge>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                            {event.name}
                        </h3>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(event)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onDelete(event.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-2">
                {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {format(eventDate, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {event.startTime} - {event.endTime}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5" />
                        <span className={cn(isFull && "text-destructive font-medium")}>
                            {attendeeCount}/{event.capacity}
                        </span>
                    </div>
                    {isFull && (
                        <Badge variant="destructive" className="text-xs">
                            Full
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    className="w-full"
                    variant={isFull ? "secondary" : "default"}
                    onClick={() => onRSVP(event)}
                >
                    {isFull ? "View RSVPs" : "RSVP Now"}
                </Button>
            </CardFooter>
        </Card>
    );
}
