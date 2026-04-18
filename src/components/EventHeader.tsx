import { EventDetails } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Phone } from "lucide-react";
import moneyPechuLogo from "@/assets/moneypechu-logo.png";

interface EventHeaderProps {
  eventDetails: EventDetails;
  onChange: (details: EventDetails) => void;
}

const EventHeader = ({ eventDetails, onChange }: EventHeaderProps) => {
  const handleChange = (field: keyof EventDetails, value: string) => {
    onChange({ ...eventDetails, [field]: value });
  };

  return (
    <div className="rounded-xl bg-header-gradient p-4 text-primary-foreground shadow-lg sm:p-6">
      <div className="mb-5 flex flex-col items-start gap-4 sm:mb-6 sm:flex-row sm:items-center">
        <div className="bg-primary-foreground rounded-lg p-2 shrink-0">
          <img src={moneyPechuLogo} alt="Money Pechu" className="h-7 w-auto sm:h-8 md:h-10" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl md:text-3xl">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Money Pechu
            </span>
            {" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Event
            </span>
          </h1>
          <p className="text-[11px] font-medium tracking-wide text-primary-foreground/70 sm:text-xs md:text-sm">
            PROFESSIONAL EXPENSE REPORTING
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-primary-foreground/10 p-3 backdrop-blur-sm sm:p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-primary-foreground/60 sm:tracking-[0.2em]">
          <span className="h-1 w-1 rounded-full bg-amber-400" />
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
