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
    <div className="bg-header-gradient rounded-xl p-6 text-primary-foreground shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="bg-primary-foreground rounded-lg p-2 shrink-0">
          <img src={moneyPechuLogo} alt="Money Pechu" className="h-8 md:h-10 w-auto" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Money Pechu Event</h1>
          <p className="text-primary-foreground/80 text-xs md:text-sm">Event Expense Report</p>
        </div>
      </div>

      <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary-foreground" />
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
