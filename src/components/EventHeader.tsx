import { EventDetails } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Phone } from "lucide-react";
import type { ExpenseCompany } from "@/lib/expenseCompanies";

interface EventHeaderProps {
  eventDetails: EventDetails;
  onChange: (details: EventDetails) => void;
  company: ExpenseCompany;
}

const EventHeader = ({ eventDetails, onChange, company }: EventHeaderProps) => {
  const handleChange = (field: keyof EventDetails, value: string) => {
    onChange({ ...eventDetails, [field]: value });
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${company.screenGradientClass} p-4 text-primary-foreground shadow-xl sm:p-6`}>
      <div className="mb-5 flex flex-col items-start gap-4 sm:mb-6 sm:flex-row sm:items-center">
        <div className="shrink-0 rounded-2xl bg-primary-foreground/15 p-2 ring-1 ring-white/20">
          <img
            src={company.logoSrc}
            alt={company.logoAlt}
            className="h-7 w-auto object-contain no-auto-move sm:h-8 md:h-10"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl md:text-3xl">
            <span className="block text-primary-foreground">{company.displayName}</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/70 sm:text-xs md:text-sm">
              Expense Claims
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-[11px] font-medium leading-6 tracking-wide text-primary-foreground/75 sm:text-xs md:text-sm">
            Entity-specific links, branded PDF generation, manager approval routing, and accounting CC.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-primary-foreground/10 p-3 backdrop-blur-sm sm:p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-primary-foreground/70 sm:tracking-[0.2em]">
          <span className="h-1 w-1 rounded-full bg-white/80" />
          EXPENSES SUMMARY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-primary-foreground/90 text-sm font-medium">
              Event Name
            </Label>
            <Input
              value={eventDetails.eventName}
              onChange={(e) => handleChange("eventName", e.target.value)}
              placeholder="Enter event name"
              className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground/90 text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date
            </Label>
            <Input
              type="date"
              value={eventDetails.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground focus:border-primary-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground/90 text-sm font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Venue
            </Label>
            <Input
              value={eventDetails.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              placeholder="Enter venue address"
              className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground/90 text-sm font-medium flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone
            </Label>
            <Input
              value={eventDetails.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter contact number"
              className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
