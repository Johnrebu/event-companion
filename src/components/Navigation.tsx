import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, CalendarDays, FolderOpen, ClipboardCheck, HelpCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import coronaLogo from "@/assets/corona-logo.png";

const navItems = [
    { path: "/", label: "Expenses", icon: FileSpreadsheet },
    { path: "/events", label: "Events", icon: CalendarDays },
    { path: "/sop", label: "Pre-Event", icon: ClipboardCheck },
    { path: "/corona-sop", label: "Event SOP", icon: Zap },
    { path: "/help", label: "Help", icon: HelpCircle },
];

export function Navigation() {
    const location = useLocation();

    return (
        <nav className="bg-card border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-14 gap-6">
                    <div className="flex items-center gap-2">
                        <img src={coronaLogo} alt="Corona Creative Solutions" className="h-8 w-auto" />
                        <span className="font-bold text-lg text-primary">Corona Creative Solutions</span>
                    </div>
                    <div className="flex gap-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.path === "/"
                                    ? location.pathname === "/"
                                    : location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
