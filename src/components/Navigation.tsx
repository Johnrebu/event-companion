import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, CalendarDays, FolderOpen, ClipboardCheck, Zap, Home, Menu, Percent, LayoutList } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { TEAM_MEMBERS, User } from "@/types/user";

const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/expenses", label: "Expenses", icon: FileSpreadsheet },
    { path: "/events", label: "Events", icon: CalendarDays },
    { path: "/sop", label: "Pre-Event", icon: ClipboardCheck },
    { path: "/corona-sop", label: "Event SOP", icon: Zap },
    { path: "/tasks", label: "Task Board", icon: LayoutList },
];

export function Navigation() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isGSTOpen, setIsGSTOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("current-user");
        return saved ? JSON.parse(saved) : TEAM_MEMBERS[0];
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("current-user", JSON.stringify(currentUser));
            // Dispatch a custom event to notify other components of user change
            window.dispatchEvent(new Event('user-changed'));
        }
    }, [currentUser]);

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

                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-muted-foreground mb-3 px-4 uppercase tracking-wider">Switch User</p>
                                        <div className="flex flex-col gap-1">
                                            {TEAM_MEMBERS.map((user) => (
                                                <Button
                                                    key={user.id}
                                                    variant="ghost"
                                                    className={cn(
                                                        "flex items-center justify-start gap-3 px-4 py-3 h-auto rounded-lg text-base font-medium transition-colors w-full",
                                                        currentUser?.id === user.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                    )}
                                                    onClick={() => {
                                                        setCurrentUser(user);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase ring-1 ring-white/10">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="leading-none">{user.name}</span>
                                                        <span className="text-[10px] opacity-70 mt-1">{user.role}</span>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop User Switcher */}
                    <div className="hidden lg:flex items-center ml-auto gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                        {currentUser?.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span>{currentUser?.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {TEAM_MEMBERS.map((user) => (
                                    <DropdownMenuItem
                                        key={user.id}
                                        onClick={() => setCurrentUser(user)}
                                        className={currentUser?.id === user.id ? "bg-accent" : ""}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span>{user.name}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                ({user.role})
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

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
