import { useState, useEffect } from "react";
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Zap,
    Target,
    Users,
    Clock,
    MapPin,
    Megaphone,
    Shield,
    Coffee,
    Camera,
    Truck,
    DollarSign,
    FileCheck,
    AlertTriangle,
    Phone,
    Calendar,
    Star,
    LucideIcon,
    Printer,
    RotateCcw,
    Rocket,
    Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import coronaLogo from "@/assets/corona-logo.png";

interface SOPTask {
    id: string;
    label: string;
    priority?: "critical" | "high" | "normal";
    owner?: string;
}

interface SOPPhase {
    id: string;
    title: string;
    icon: LucideIcon;
    timeline: string;
    color: string;
    tasks: SOPTask[];
}

const CORONA_SOP_PHASES: SOPPhase[] = [
    {
        id: "pre-event-30",
        title: "D-30: Strategic Foundation",
        icon: Target,
        timeline: "30 Days Before",
        color: "from-blue-500 to-cyan-500",
        tasks: [
            { id: "c-date-lock", label: "Event Date Locked & Confirmed", priority: "critical", owner: "Project Lead" },
            { id: "c-venue-scout", label: "Venue Shortlisting (3 Options Minimum)", priority: "critical", owner: "Operations" },
            { id: "c-budget-approve", label: "Budget Sanctioned & Allocated", priority: "critical", owner: "Finance" },
            { id: "c-team-assign", label: "Core Team Assignment Complete", priority: "high", owner: "HR" },
            { id: "c-client-brief", label: "Client Brief Document Finalized", priority: "high", owner: "Account Manager" },
            { id: "c-timeline-create", label: "Master Timeline Created", priority: "high", owner: "Project Lead" },
        ],
    },
    {
        id: "pre-event-21",
        title: "D-21: Vendor & Logistics Lock",
        icon: Building2,
        timeline: "21 Days Before",
        color: "from-purple-500 to-pink-500",
        tasks: [
            { id: "c-venue-book", label: "Venue Contract Signed", priority: "critical", owner: "Legal" },
            { id: "c-vendor-av", label: "AV Vendor Confirmed (Sound/Light/LED)", priority: "critical", owner: "Production" },
            { id: "c-vendor-catering", label: "Catering Vendor Finalized", priority: "high", owner: "Hospitality" },
            { id: "c-vendor-decor", label: "Decor Partner Onboarded", priority: "high", owner: "Creative" },
            { id: "c-transport-arr", label: "Transport Logistics Arranged", priority: "normal", owner: "Operations" },
            { id: "c-security-plan", label: "Security Plan Approved", priority: "high", owner: "Security" },
            { id: "c-permit-apply", label: "All Permits Applied", priority: "critical", owner: "Legal" },
        ],
    },
    {
        id: "pre-event-14",
        title: "D-14: Creative & Marketing Sprint",
        icon: Megaphone,
        timeline: "14 Days Before",
        color: "from-orange-500 to-red-500",
        tasks: [
            { id: "c-design-final", label: "All Creatives Approved by Client", priority: "critical", owner: "Creative" },
            { id: "c-print-order", label: "Print Materials Ordered", priority: "high", owner: "Procurement" },
            { id: "c-social-plan", label: "Social Media Calendar Ready", priority: "high", owner: "Digital" },
            { id: "c-pr-outreach", label: "PR & Media Outreach Initiated", priority: "normal", owner: "PR" },
            { id: "c-invite-send", label: "Invitations Sent", priority: "high", owner: "Account Manager" },
            { id: "c-rsvp-track", label: "RSVP Tracking System Active", priority: "normal", owner: "Coordinator" },
        ],
    },
    {
        id: "pre-event-7",
        title: "D-7: Execution Prep Week",
        icon: Clock,
        timeline: "7 Days Before",
        color: "from-green-500 to-emerald-500",
        tasks: [
            { id: "c-runsheet-final", label: "Event Runsheet Finalized", priority: "critical", owner: "Project Lead" },
            { id: "c-vendor-confirm", label: "All Vendor Confirmations Received", priority: "critical", owner: "Operations" },
            { id: "c-staff-brief", label: "Staff Briefing Scheduled", priority: "high", owner: "HR" },
            { id: "c-backup-plan", label: "Contingency Plan Documented", priority: "high", owner: "Project Lead" },
            { id: "c-tech-test", label: "Technical Rehearsal Scheduled", priority: "high", owner: "Production" },
            { id: "c-guest-list", label: "Final Guest List Locked", priority: "critical", owner: "Coordinator" },
            { id: "c-material-check", label: "All Materials Received & Checked", priority: "high", owner: "Procurement" },
        ],
    },
    {
        id: "pre-event-1",
        title: "D-1: Final Checks",
        icon: Shield,
        timeline: "1 Day Before",
        color: "from-yellow-500 to-amber-500",
        tasks: [
            { id: "c-venue-walk", label: "Venue Walkthrough Complete", priority: "critical", owner: "All Leads" },
            { id: "c-setup-start", label: "Setup Commenced", priority: "critical", owner: "Operations" },
            { id: "c-av-test", label: "AV Systems Tested", priority: "critical", owner: "Production" },
            { id: "c-catering-confirm", label: "Catering Setup Confirmed", priority: "high", owner: "Hospitality" },
            { id: "c-team-brief", label: "Full Team Briefing Done", priority: "critical", owner: "Project Lead" },
            { id: "c-emergency-num", label: "Emergency Contacts Shared", priority: "high", owner: "Coordinator" },
            { id: "c-client-walkin", label: "Client Walkthrough Scheduled", priority: "high", owner: "Account Manager" },
        ],
    },
    {
        id: "event-day",
        title: "D-Day: Execute Flawlessly",
        icon: Zap,
        timeline: "Event Day",
        color: "from-red-600 to-rose-600",
        tasks: [
            { id: "c-early-arrive", label: "Core Team Arrives 3 Hours Early", priority: "critical", owner: "All" },
            { id: "c-final-av", label: "Final AV Check 2 Hours Before", priority: "critical", owner: "Production" },
            { id: "c-registration", label: "Registration Desk Ready 1 Hour Before", priority: "critical", owner: "Coordinator" },
            { id: "c-client-greet", label: "Client Greeted & Briefed", priority: "high", owner: "Account Manager" },
            { id: "c-vip-ready", label: "VIP Holding Area Ready", priority: "high", owner: "Hospitality" },
            { id: "c-photo-brief", label: "Photo/Video Team Briefed", priority: "normal", owner: "Media" },
            { id: "c-live-updates", label: "Live Social Updates Active", priority: "normal", owner: "Digital" },
            { id: "c-backup-active", label: "Backup Systems on Standby", priority: "high", owner: "Production" },
        ],
    },
    {
        id: "post-event",
        title: "D+1 to D+7: Closure & Analysis",
        icon: FileCheck,
        timeline: "Post Event",
        color: "from-slate-500 to-zinc-600",
        tasks: [
            { id: "c-venue-clear", label: "Venue Cleared & Handover Done", priority: "critical", owner: "Operations" },
            { id: "c-vendor-settle", label: "Vendor Settlements Initiated", priority: "high", owner: "Finance" },
            { id: "c-debrief-internal", label: "Internal Debrief Conducted", priority: "high", owner: "Project Lead" },
            { id: "c-client-feedback", label: "Client Feedback Collected", priority: "high", owner: "Account Manager" },
            { id: "c-media-deliver", label: "Media Assets Delivered to Client", priority: "normal", owner: "Media" },
            { id: "c-report-final", label: "Final Report & Insights Submitted", priority: "high", owner: "Project Lead" },
            { id: "c-archive-docs", label: "All Documents Archived", priority: "normal", owner: "Coordinator" },
        ],
    },
];

const STORAGE_KEY = "corona-sop-data-v1";

export default function CoronaSOPPage() {
    const [taskState, setTaskState] = useState<Record<string, boolean>>({});
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
        "pre-event-30": true,
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setTaskState(JSON.parse(saved));
            } catch {
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

    const toggleExpand = (phaseId: string) => {
        setExpandedPhases(prev => ({
            ...prev,
            [phaseId]: !prev[phaseId],
        }));
    };

    const calculatePhaseProgress = (tasks: SOPTask[]) => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => taskState[t.id]).length;
        return Math.round((completed / tasks.length) * 100);
    };

    const allTasks = CORONA_SOP_PHASES.flatMap(phase => phase.tasks);
    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter(t => taskState[t.id]).length;
    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    const criticalTasks = allTasks.filter(t => t.priority === "critical" && !taskState[t.id]);

    const getPriorityBadge = (priority?: "critical" | "high" | "normal") => {
        switch (priority) {
            case "critical":
                return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">CRITICAL</Badge>;
            case "high":
                return <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-orange-500">HIGH</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 print:p-0 print:bg-white">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 py-12 relative z-10 print:py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={coronaLogo}
                                    alt="Corona Creative Solutions"
                                    className="h-16 w-auto drop-shadow-lg print:h-10"
                                />
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight print:text-2xl print:text-black">
                                        Event <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent print:text-orange-600">SOP</span>
                                    </h1>
                                    <p className="text-slate-400 text-lg mt-1 print:text-sm print:text-gray-600">
                                        Execute with Precision. Deliver Excellence.
                                    </p>
                                </div>
                            </div>

                            {/* Elon-style Principle */}
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 max-w-xl print:hidden">
                                <div className="flex items-start gap-3">
                                    <Rocket className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">First Principles Approach</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            "If something is important enough, you do it even if the odds are against you."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 no-print">
                                <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2 bg-slate-700 hover:bg-slate-600 text-white">
                                    <Printer className="h-4 w-4" />
                                    Export
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                            <RotateCcw className="h-4 w-4" />
                                            Reset
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Reset All Progress?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-400">
                                                This will clear all checkmarks. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                                                Reset
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex flex-col sm:flex-row gap-4 print:flex-row">
                            {/* Overall Progress */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 w-full sm:w-56 print:bg-white print:border-gray-300">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">Progress</span>
                                        <Star className={cn("h-5 w-5", overallProgress === 100 ? "text-yellow-400 animate-pulse" : "text-slate-600")} />
                                    </div>
                                    <div className="flex items-end gap-2 mb-3">
                                        <span className={cn(
                                            "text-4xl font-black",
                                            overallProgress === 100 ? "text-green-400" : "text-white print:text-black"
                                        )}>
                                            {overallProgress}%
                                        </span>
                                        <span className="text-sm text-slate-400 mb-1 print:text-gray-600">
                                            {completedTasksCount}/{totalTasksCount}
                                        </span>
                                    </div>
                                    <Progress value={overallProgress} className="h-2 bg-slate-700 print:bg-gray-200" />
                                </CardContent>
                            </Card>

                            {/* Critical Tasks Remaining */}
                            <Card className={cn(
                                "backdrop-blur-sm border w-full sm:w-56 print:bg-white",
                                criticalTasks.length > 0
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-green-500/10 border-green-500/30"
                            )}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">Critical</span>
                                        <AlertTriangle className={cn(
                                            "h-5 w-5",
                                            criticalTasks.length > 0 ? "text-red-400" : "text-green-400"
                                        )} />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className={cn(
                                            "text-4xl font-black",
                                            criticalTasks.length > 0 ? "text-red-400" : "text-green-400"
                                        )}>
                                            {criticalTasks.length}
                                        </span>
                                        <span className="text-sm text-slate-400 mb-1 print:text-gray-600">
                                            {criticalTasks.length > 0 ? "remaining" : "all done!"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Phases */}
            <div className="container mx-auto px-4 py-8 print:py-4">
                <div className="space-y-4">
                    {CORONA_SOP_PHASES.map((phase, index) => {
                        const progress = calculatePhaseProgress(phase.tasks);
                        const isExpanded = expandedPhases[phase.id];
                        const isComplete = progress === 100;
                        const Icon = phase.icon;

                        return (
                            <div key={phase.id} className="relative">
                                {/* Timeline connector */}
                                {index < CORONA_SOP_PHASES.length - 1 && (
                                    <div className="absolute left-7 top-full w-0.5 h-4 bg-slate-700 z-0 print:hidden" />
                                )}

                                <Card className={cn(
                                    "overflow-hidden transition-all duration-300 bg-slate-800/50 backdrop-blur-sm print:bg-white print:border-gray-300",
                                    isComplete
                                        ? "border-green-500/50 print:border-green-500"
                                        : "border-slate-700"
                                )}>
                                    {/* Phase Header */}
                                    <div
                                        className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors print:cursor-default print:p-3"
                                        onClick={() => toggleExpand(phase.id)}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl bg-gradient-to-br print:p-2",
                                                    phase.color,
                                                    isComplete && "ring-2 ring-green-400 ring-offset-2 ring-offset-slate-800"
                                                )}>
                                                    <Icon className="h-6 w-6 text-white print:h-4 print:w-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-bold text-white print:text-sm print:text-black">
                                                            {phase.title}
                                                        </h3>
                                                        {isComplete && (
                                                            <CheckCircle2 className="h-5 w-5 text-green-400 print:text-green-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 print:text-gray-600 print:border-gray-400">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {phase.timeline}
                                                        </Badge>
                                                        <span className="text-xs text-slate-500 print:text-gray-500">
                                                            {phase.tasks.filter(t => taskState[t.id]).length}/{phase.tasks.length} tasks
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block no-print">
                                                    <span className={cn(
                                                        "text-2xl font-bold",
                                                        isComplete ? "text-green-400" : "text-white"
                                                    )}>
                                                        {progress}%
                                                    </span>
                                                </div>
                                                <div className="no-print">
                                                    {isExpanded
                                                        ? <ChevronUp className="text-slate-400" />
                                                        : <ChevronDown className="text-slate-400" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <Progress
                                            value={progress}
                                            className="h-1 mt-4 bg-slate-700 print:bg-gray-200"
                                        />
                                    </div>

                                    {/* Tasks */}
                                    <div className={cn(
                                        "border-t border-slate-700 print:block print:border-gray-200",
                                        isExpanded ? "block" : "hidden print:block"
                                    )}>
                                        <div className="p-5 print:p-3">
                                            <div className="grid gap-2">
                                                {phase.tasks.map(task => {
                                                    const isCompleted = !!taskState[task.id];
                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-lg transition-all print:p-1",
                                                                isCompleted
                                                                    ? "bg-green-500/10 border border-green-500/20"
                                                                    : "bg-slate-700/30 border border-slate-700 hover:border-slate-600"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                id={task.id}
                                                                checked={isCompleted}
                                                                onCheckedChange={() => toggleTask(task.id)}
                                                                className="h-5 w-5 border-slate-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 no-print"
                                                            />
                                                            <div className="hidden print:block w-4 h-4 border border-black shrink-0">
                                                                {isCompleted && <div className="w-full h-full bg-black" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <label
                                                                        htmlFor={task.id}
                                                                        className={cn(
                                                                            "text-sm font-medium cursor-pointer transition-colors print:text-xs",
                                                                            isCompleted
                                                                                ? "text-slate-400 line-through print:text-gray-400"
                                                                                : "text-white print:text-black"
                                                                        )}
                                                                    >
                                                                        {task.label}
                                                                    </label>
                                                                    {getPriorityBadge(task.priority)}
                                                                </div>
                                                                {task.owner && (
                                                                    <span className="text-xs text-slate-500 print:text-gray-500">
                                                                        <Users className="h-3 w-3 inline mr-1" />
                                                                        {task.owner}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Quote */}
                <div className="mt-12 text-center no-print">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
                        <Zap className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-slate-400">
                            "Perfection is achieved when there is nothing left to take away."
                        </span>
                    </div>
                    <Badge variant="outline" className="block mx-auto mt-4 px-4 py-1 text-sm font-normal text-slate-500 border-slate-700">
                        Progress saved automatically
                    </Badge>
                </div>
            </div>
        </div>
    );
}
