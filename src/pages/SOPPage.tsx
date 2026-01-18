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
    RotateCcw
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
    {
        id: "planning",
        title: "Planning and Research",
        icon: Search,
        tasks: [
            { id: "date-final", label: "Date Finalization", completed: false },
            { id: "city-res", label: "City Research", completed: false },
            { id: "tier-cities", label: "Tier 1, 2, and 3 Cities Selection", completed: false },
            { id: "capacity-tax", label: "Maximum Capacity and Tax Assessment", completed: false },
        ],
    },
    {
        id: "venue",
        title: "Venue and Location",
        icon: MapPin,
        tasks: [
            { id: "easy-access", label: "Easy Access for Attendees", completed: false },
            { id: "proximity", label: "Proximity to Railway and Bus Stations", completed: false },
            { id: "parking", label: "Adequate Parking Space", completed: false },
            { id: "backstage", label: "Backstage Space Planning", completed: false },
            { id: "insurance", label: "Venue Insurance", completed: false },
        ],
    },
    {
        id: "production",
        title: "Production Elements",
        icon: Mic2,
        tasks: [
            { id: "led-sound", label: "LED, Sound, and Light Setup", completed: false },
            { id: "comms", label: "Mics and Walkie-talkies", completed: false },
            { id: "stage-dim", label: "Stage Dimensions Finalization", completed: false },
            { id: "decor", label: "Event Decor and Ambience", completed: false },
            { id: "furniture", label: "Furniture and VIP Sofas", completed: false },
        ],
    },
    {
        id: "hospitality",
        title: "Hospitality and Logistics",
        icon: Utensils,
        tasks: [
            { id: "travel", label: "Travel and Conveyance Arranged", completed: false },
            { id: "food", label: "Daily Food Expenses for Team", completed: false },
            { id: "staff", label: "Staff and Sales Team Coordination", completed: false },
            { id: "media-hospital", label: "Media and Hospital Teams Ready", completed: false },
        ],
    },
    {
        id: "branding",
        title: "Collaterals and Branding",
        icon: Stamp,
        tasks: [
            { id: "swag", label: "Keychains and Notepads", completed: false },
            { id: "id-cards", label: "Staff ID Cards", completed: false },
            { id: "feedback", label: "Feedback Forms Ready", completed: false },
            { id: "books", label: "Event Books/Brochures", completed: false },
        ],
    },
    {
        id: "operations",
        title: "Operations and Manpower",
        icon: ShieldCheck,
        tasks: [
            { id: "security", label: "Promoters and Security Staff", completed: false },
            { id: "queue", label: "Queue Managers Deployment", completed: false },
            { id: "vendor", label: "Vendor Management System", completed: false },
            { id: "materials", label: "Quality Materials Quality Check", completed: false },
            { id: "cost", label: "Cost Effectiveness Review", completed: false },
        ],
    },
    {
        id: "marketing",
        title: "Marketing and Sales",
        icon: Megaphone,
        tasks: [
            { id: "pricing", label: "Ticket Pricing Strategy", completed: false },
            { id: "platforms", label: "Ticketing Platforms Integration", completed: false },
            { id: "yt-promos", label: "YouTube Promos Launch", completed: false },
            { id: "meta", label: "Meta (FB/IG) Campaigns", completed: false },
            { id: "digital-team", label: "Digital Marketing Team Briefing", completed: false },
        ],
    },
];

const STORAGE_KEY = "event-sop-data-v2";

export default function SOPPage() {
    const [taskState, setTaskState] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        planning: true,
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
                                Pre-Event SOP
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Standard Operating Procedure for Event Excellence
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
