import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Users, AlertCircle } from "lucide-react";
import { Event, RSVP, RSVP_STATUSES } from "@/types/event";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const rsvpFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    status: z.enum(["attending", "maybe", "not_attending"]),
});

type RSVPFormValues = z.infer<typeof rsvpFormSchema>;

interface RSVPDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event | null;
    attendeeCount: number;
    onSubmit: (rsvp: Omit<RSVP, "id" | "createdAt">) => void;
    existingRSVP?: RSVP;
}

export function RSVPDialog({
    open,
    onOpenChange,
    event,
    attendeeCount,
    onSubmit,
    existingRSVP,
}: RSVPDialogProps) {
    const isFull = event ? attendeeCount >= event.capacity : false;
    const spotsLeft = event ? event.capacity - attendeeCount : 0;

    const form = useForm<RSVPFormValues>({
        resolver: zodResolver(rsvpFormSchema),
        defaultValues: existingRSVP
            ? {
                name: existingRSVP.name,
                email: existingRSVP.email,
                phone: existingRSVP.phone || "",
                status: existingRSVP.status,
            }
            : {
                name: "",
                email: "",
                phone: "",
                status: "attending",
            },
    });

    const selectedStatus = form.watch("status");

    const handleSubmit = (values: RSVPFormValues) => {
        if (!event) return;

        // Prevent "attending" if event is full
        if (values.status === "attending" && isFull && !existingRSVP) {
            form.setError("status", {
                type: "manual",
                message: "Event is full. Please select 'Maybe' or 'Not Attending'.",
            });
            return;
        }

        onSubmit({
            eventId: event.id,
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            status: values.status,
        });

        form.reset();
        onOpenChange(false);
    };

    if (!event) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {existingRSVP ? "Update RSVP" : "RSVP to Event"}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 pt-2">
                            <div className="p-3 rounded-lg bg-accent/50">
                                <h4 className="font-semibold">{event.name}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {format(new Date(event.date), "MMM d, yyyy")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {event.startTime} - {event.endTime}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.venue}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="text-sm">
                                        {attendeeCount}/{event.capacity} attending
                                    </span>
                                    {isFull ? (
                                        <Badge variant="destructive" className="text-xs">Full</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {isFull && !existingRSVP && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This event is full. You can still RSVP as "Maybe" to join the waitlist.
                                </AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+91 98765 43210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Response</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {RSVP_STATUSES.map((status) => {
                                                const isDisabled =
                                                    status.value === "attending" && isFull && !existingRSVP;
                                                return (
                                                    <label
                                                        key={status.value}
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                            selectedStatus === status.value
                                                                ? "border-primary bg-primary/5"
                                                                : "border-input hover:border-primary/50",
                                                            isDisabled && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <RadioGroupItem
                                                            value={status.value}
                                                            disabled={isDisabled}
                                                            className="sr-only"
                                                        />
                                                        <div
                                                            className={cn("h-2 w-2 rounded-full", status.color)}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {status.label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {existingRSVP ? "Update RSVP" : "Submit RSVP"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
