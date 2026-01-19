import { useState, useEffect } from "react";
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Trophy,
    Search,
    MapPin,
    Mic2,
    Utensils,
    Stamp,
    ShieldCheck,
    Megaphone,
    LucideIcon,
    Printer,
    RotateCcw,
    Coffee,
    Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SOPTask {
    id: string;
    label: string;
    completed: boolean;
}

interface SOPCategoryMetadata {
    id: string;
    title: string;
    icon: LucideIcon;
    tasks: SOPTask[];
}

const SOP_METADATA: SOPCategoryMetadata[] = [
    // Phase 1: Strategic Location Analysis
    {
        id: "location-analysis",
        title: "Phase 1: Strategic Location Analysis",
        icon: Search,
        tasks: [
            { id: "date-finalization", label: "Event Date Finalization (45+ days advance)", completed: false },
            { id: "city-tier", label: "City Selection Strategy (Tier 1, 2, 3 Analysis)", completed: false },
            { id: "yt-stats", label: "Digital Research - YouTube Stats & Subscriber Analysis", completed: false },
            { id: "viewer-demographics", label: "Viewer Demographics & Watch Time Analysis", completed: false },
            { id: "regional-demand", label: "Regional Demand Assessment", completed: false },
        ],
    },
    {
        id: "venue-feasibility",
        title: "Venue Feasibility & Economic Modelling",
        icon: MapPin,
        tasks: [
            { id: "venue-rate", label: "Venue Rate ∝ Pax Count (Economic Formula)", completed: false },
            { id: "capacity-calc", label: "Maximum Capacity Calculation", completed: false },
            { id: "tax-assessment", label: "Tax & Compliance Assessment", completed: false },
            { id: "budget-estimate", label: "Pax Count vs Venue Budget Estimate", completed: false },
            { id: "venue-insurance", label: "Venue Insurance Coverage", completed: false },
        ],
    },
    {
        id: "vendor-allocation",
        title: "Vendor/Subcontractor/Staff/Partner Allocation",
        icon: ShieldCheck,
        tasks: [
            { id: "vendor-list", label: "Create Vendor Master List", completed: false },
            { id: "subcontractor-brief", label: "Subcontractor Briefing & Contracts", completed: false },
            { id: "partner-mou", label: "Partner MOU & Agreements", completed: false },
            { id: "staff-assignment", label: "Staff Role Assignment Matrix", completed: false },
            { id: "resource-timeline", label: "Resource Allocation Timeline", completed: false },
        ],
    },
    {
        id: "technical-specs",
        title: "Technical Specifications & Seating Layout",
        icon: Mic2,
        tasks: [
            { id: "stage-dimensions", label: "Final Stage Dimensions & Design", completed: false },
            { id: "seating-layout", label: "Seating Layout Plan (Row-wise)", completed: false },
            { id: "vip-section", label: "VIP/SVIP Section Planning", completed: false },
            { id: "general-section", label: "General Admission Section", completed: false },
            { id: "sightline-check", label: "Sightline & Visibility Check", completed: false },
            { id: "emergency-exits", label: "Emergency Exit Mapping", completed: false },
        ],
    },
    {
        id: "accessibility",
        title: "Accessibility, Parking & External Logistics",
        icon: Truck,
        tasks: [
            { id: "railway-access", label: "Railway Station Proximity Check", completed: false },
            { id: "bus-access", label: "Bus Stand Accessibility", completed: false },
            { id: "parking-layout", label: "Parking Area Layout & Capacity", completed: false },
            { id: "parking-security", label: "Parking Security Arrangement", completed: false },
            { id: "drop-zone", label: "VIP Drop Zone Planning", completed: false },
            { id: "traffic-mgmt", label: "Traffic Management Plan", completed: false },
        ],
    },
    // Phase 2: Production Elements & Hardware
    {
        id: "production-hardware",
        title: "Phase 2: Production Elements & Hardware",
        icon: Mic2,
        tasks: [
            { id: "led-screens", label: "LED Screen Setup (Size & Placement)", completed: false },
            { id: "sound-system", label: "Sound System Configuration", completed: false },
            { id: "lighting-rig", label: "Lighting Rig & Effects", completed: false },
            { id: "mics-stands", label: "Mics, Mike Stands & Wireless Systems", completed: false },
            { id: "walkie-talkies", label: "Walkie-Talkies for Team Communication", completed: false },
            { id: "backup-power", label: "Backup Power/Generator Arrangement", completed: false },
        ],
    },
    {
        id: "brand-collaterals",
        title: "Brand Collaterals & Material Logistics",
        icon: Stamp,
        tasks: [
            { id: "plan-colors", label: "Plan Color Changes & Brand Consistency", completed: false },
            { id: "standees", label: "Standees & Banner Design", completed: false },
            { id: "stage-backdrop", label: "Stage Backdrop Design", completed: false },
            { id: "signage", label: "Directional Signage & Branding", completed: false },
            { id: "swag-items", label: "Swag Items (Keychains, Notepads, Pens)", completed: false },
            { id: "id-cards", label: "Staff ID Cards & Lanyards", completed: false },
            { id: "feedback-forms", label: "Feedback Forms Ready", completed: false },
            { id: "courier-plan", label: "Courier Charges Plan (Books, Canopy, Standees)", completed: false },
        ],
    },
    {
        id: "hospitality-hitea",
        title: "Hospitality Standards: The Hi-Tea Experience",
        icon: Coffee,
        tasks: [
            { id: "hitea-vendor", label: "Hi-Tea Vendor Selection (Quality & Cost)", completed: false },
            { id: "menu-plan", label: "Menu Planning & Dietary Options", completed: false },
            { id: "serving-stations", label: "Serving Stations Layout", completed: false },
            { id: "arabian-tent", label: "Arabian Tent Setup (if needed)", completed: false },
            { id: "stall-space", label: "Stall Space for Aionion, Insurance, Books", completed: false },
            { id: "beverage-station", label: "Beverage Station Management", completed: false },
        ],
    },
    {
        id: "team-logistics",
        title: "Internal Team Logistics & Mobility",
        icon: Truck,
        tasks: [
            { id: "team-roles", label: "Team Roles: Accounts, Event, Sales, Media, Books", completed: false },
            { id: "travel-tickets", label: "Tickets (Train/Air) Booking", completed: false },
            { id: "accommodation", label: "Room/Accommodation Booking", completed: false },
            { id: "local-conveyance", label: "Local Conveyance Arrangement", completed: false },
            { id: "per-day-charges", label: "Per-day Charges Calculation", completed: false },
            { id: "team-food", label: "Daily Food Expenses for Team", completed: false },
            { id: "medical-emergency", label: "Medical Emergency Contact Ready", completed: false },
        ],
    },
    {
        id: "security-deployment",
        title: "Local Manpower & Security Deployment",
        icon: ShieldCheck,
        tasks: [
            { id: "promoters", label: "Promoters Deployment", completed: false },
            { id: "parking-staff", label: "Parking Staff Assignment", completed: false },
            { id: "security-team", label: "Security Team Briefing", completed: false },
            { id: "queue-managers", label: "Queue Managers Deployment", completed: false },
            { id: "vendor-mgmt", label: "General Vendor Management System", completed: false },
            { id: "quality-check", label: "Materials Quality Check", completed: false },
        ],
    },
    // Phase 3: Marketing, Digital & Ticketing
    {
        id: "marketing-ticketing",
        title: "Phase 3: Marketing, Digital & Ticketing",
        icon: Megaphone,
        tasks: [
            { id: "pricing-strategy", label: "Ticket Pricing Strategy (10% Rule)", completed: false },
            { id: "ticketing-platform", label: "Ticketing Platform Integration", completed: false },
            { id: "yt-promos", label: "YouTube Promos Launch", completed: false },
            { id: "meta-campaigns", label: "Meta (FB/IG) Ad Campaigns", completed: false },
            { id: "digital-team", label: "Digital Marketing Team Briefing", completed: false },
            { id: "pax-target", label: "Target: 500 PAX per Event", completed: false },
            { id: "promo-timeline", label: "Promotional Content Timeline", completed: false },
        ],
    },
    {
        id: "master-checklist",
        title: "The Master Execution Checklist (D-Day)",
        icon: ShieldCheck,
        tasks: [
            { id: "d-day-brief", label: "D-Day Team Briefing", completed: false },
            { id: "venue-walkthrough", label: "Final Venue Walkthrough", completed: false },
            { id: "tech-rehearsal", label: "Technical Rehearsal Complete", completed: false },
            { id: "vendor-confirm", label: "All Vendors On-Site Confirmation", completed: false },
            { id: "registration-ready", label: "Registration Desk Ready", completed: false },
            { id: "media-ready", label: "Media Team Positioned", completed: false },
            { id: "security-active", label: "Security Protocols Active", completed: false },
            { id: "emergency-plan", label: "Emergency Response Plan Shared", completed: false },
            { id: "post-event-debrief", label: "Post-Event Debrief Scheduled", completed: false },
        ],
    },
];

const STORAGE_KEY = "event-sop-data-v4";

export default function SOPPage() {
    const [taskState, setTaskState] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "location-analysis": true,
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setTaskState(JSON.parse(saved));
            } catch (e) {
                setTaskState({});
            }
        }
    }, []);

    useEffect(() => {
        if (Object.keys(taskState).length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState));
        }
    }, [taskState]);

    const toggleTask = (taskId: string) => {
        setTaskState(prev => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const handleReset = () => {
        setTaskState({});
        localStorage.removeItem(STORAGE_KEY);
        toast.success("SOP progress has been reset");
    };

    const handlePrint = () => {
        window.print();
    };

    const toggleExpand = (categoryId: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const calculateProgress = (tasks: SOPTask[]) => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => taskState[t.id]).length;
        return Math.round((completed / tasks.length) * 100);
    };

    const allTasks = SOP_METADATA.flatMap(cat => cat.tasks);
    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter(t => taskState[t.id]).length;
    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pb-20 print:p-0 print:bg-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl print:max-w-none print:px-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:mb-8">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
                                Pre-Event Operations
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Strategic Planning & Execution Guide
                            </p>
                        </div>
                        <div className="flex gap-2 no-print">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                                <Printer className="h-4 w-4" />
                                Print Checklist
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <RotateCcw className="h-4 w-4" />
                                        Reset Progress
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will reset all your checkmarks for the Pre-Event SOP. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Reset
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <Card className="w-full md:w-64 border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm print:shadow-none print:bg-white print:border-none">
                        <CardHeader className="py-4">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Overall Completion
                                </CardTitle>
                                <Trophy className={cn("h-5 w-5 no-print", overallProgress === 100 ? "text-yellow-500 animate-bounce" : "text-muted-foreground")} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
                                <span className="text-sm text-muted-foreground mb-1">
                                    ({completedTasksCount}/{totalTasksCount})
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="py-0 pb-4">
                            <Progress value={overallProgress} className="h-2" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 print:gap-4">
                    {SOP_METADATA.map(category => {
                        const progress = calculateProgress(category.tasks);
                        const isExpanded = expandedCategories[category.id];
                        const isFullyCompleted = progress === 100;
                        const Icon = category.icon;

                        return (
                            <Card
                                key={category.id}
                                className={cn(
                                    "overflow-hidden transition-all duration-300 border-l-4 print:border-l-2 print:shadow-none",
                                    isFullyCompleted ? "border-l-green-500 bg-green-50/5 print:border-l-black" : "border-l-primary/40 print:border-l-gray-300"
                                )}
                            >
                                <div
                                    className="p-6 cursor-pointer hover:bg-accent/5 transition-colors print:cursor-default print:p-4"
                                    onClick={() => !window.matchMedia('print').matches && toggleExpand(category.id)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-lg print:hidden",
                                                isFullyCompleted ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                                            )}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2 print:text-lg">
                                                    {category.title}
                                                    {isFullyCompleted && (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 print:text-black" />
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 no-print">
                                                    <Progress value={progress} className="w-24 h-1.5" />
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {progress}% Complete
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="no-print">
                                            {isExpanded ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "p-6 pt-0 border-t bg-card/30 print:block print:p-4 print:pt-0",
                                    isExpanded ? "block" : "hidden print:block"
                                )}>
                                    <div className="grid gap-4 mt-6 print:mt-4">
                                        {category.tasks.map(task => {
                                            const isCompleted = !!taskState[task.id];
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "flex items-center space-x-3 p-3 rounded-xl transition-all border print:border-none print:p-1",
                                                        isCompleted
                                                            ? "bg-green-50/50 border-green-100/50"
                                                            : "bg-background/50 border-border/50 hover:border-primary/30"
                                                    )}
                                                >
                                                    <Checkbox
                                                        id={task.id}
                                                        checked={isCompleted}
                                                        onCheckedChange={() => toggleTask(task.id)}
                                                        className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 no-print"
                                                    />
                                                    <div className="hidden print:block w-4 h-4 border border-black mr-2">
                                                        {isCompleted && <div className="w-full h-full bg-black" />}
                                                    </div>
                                                    <label
                                                        htmlFor={task.id}
                                                        className={cn(
                                                            "text-base font-medium leading-none cursor-pointer transition-colors print:text-sm",
                                                            isCompleted ? "text-muted-foreground line-through print:no-underline" : "text-foreground"
                                                        )}
                                                    >
                                                        {task.label}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-12 text-center no-print">
                    <Badge variant="outline" className="px-4 py-1 text-sm font-normal text-muted-foreground">
                        All changes are automatically saved to your browser
                    </Badge>
                </div>
            </div>
        </div>
    );
}
