import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, CalendarDays, FolderOpen, ClipboardCheck, HelpCircle, Zap, Home, Menu, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import coronaLogo from "@/assets/corona-logo.png";
import { Button } from "@/components/ui/button";
import GSTCalculator from "@/components/GSTCalculator";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/expenses", label: "Expenses", icon: FileSpreadsheet },
    { path: "/events", label: "Events", icon: CalendarDays },
    { path: "/sop", label: "Pre-Event", icon: ClipboardCheck },
    { path: "/corona-sop", label: "Event SOP", icon: Zap },
    { path: "/help", label: "Help", icon: HelpCircle },
];

export function Navigation() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isGSTOpen, setIsGSTOpen] = useState(false);

    return (
        <nav className="bg-card border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-16 justify-between lg:justify-start lg:gap-8">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <img src={coronaLogo} alt="Corona Creative Solutions" className="h-8 w-8 object-contain" />
                        <span className="font-bold text-base md:text-lg text-primary truncate max-w-[150px] md:max-w-none">
                            Corona Creative Solutions
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex gap-1">
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
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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

                    {/* Mobile Menu */}
                    <div className="flex lg:hidden items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 lg:hidden"
                            onClick={() => setIsGSTOpen(true)}
                        >
                            <Percent className="h-5 w-5" />
                            <span className="sr-only">GST Calculator</span>
                        </Button>
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[80%] max-w-[300px] sm:w-[350px]">
                                <SheetHeader className="text-left pb-4 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <img src={coronaLogo} alt="Logo" className="h-6 w-6" />
                                        <span>Navigation</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-2 mt-4">
                                    {navItems.map((item) => {
                                        const isActive =
                                            item.path === "/"
                                                ? location.pathname === "/"
                                                : location.pathname.startsWith(item.path);
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                    <Button
                                        variant="ghost"
                                        className="flex items-center justify-start gap-3 px-4 py-3 h-auto rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsGSTOpen(true);
                                        }}
                                    >
                                        <Percent className="h-5 w-5" />
                                        GST Calculator
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop GST Button */}
                    <div className="hidden lg:flex items-center ml-auto">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setIsGSTOpen(true)}
                        >
                            <Percent className="h-4 w-4" />
                            GST Calculator
                        </Button>
                    </div>
                </div>
            </div>
            <GSTCalculator isOpen={isGSTOpen} onClose={() => setIsGSTOpen(false)} />
        </nav>
    );
}
