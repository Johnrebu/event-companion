import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    Briefcase,
    Building2,
    CalendarDays,
    Gift,
    Globe2,
    Handshake,
    LineChart,
    MonitorPlay,
    Plane,
    Rocket,
    ShieldAlert,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Wallet,
} from "lucide-react";
import coronaLogo from "@/assets/corona-logo.png";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type IconItem = {
    icon: LucideIcon;
    title: string;
    description: string;
};

type PortfolioItem = {
    category: string;
    title: string;
    description: string;
    frequency: string;
    icon: LucideIcon;
};

type CalendarRow = {
    event: string;
    cells: string[];
};

type KpiRow = {
    id: string;
    focusArea: string;
    indicator: string;
    target: string;
    measurement: string;
};

type KriRow = {
    risk: string;
    indicator: string;
    threshold: string;
    mitigation: string;
};

type GiftingRow = {
    occasion: string;
    clients: string;
    vendors: string;
    authorities: string;
    employees: string;
};

type RoadmapStage = {
    timeframe: string;
    role: string;
    theme: string;
    bullets: string[];
};

const sectionLinks = [
    { href: "#overview", label: "Overview" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#calendar", label: "Calendar" },
    { href: "#dashboards", label: "Dashboards" },
    { href: "#gifting", label: "Gifting" },
    { href: "#career", label: "Career" },
];

const summaryMetrics = [
    { value: "9", label: "Recurring event types" },
    { value: "6", label: "HNI meets per year" },
    { value: "4", label: "International cities per year" },
    { value: "3", label: "Branding projects per year" },
];

const contentsCards: IconItem[] = [
    {
        icon: Target,
        title: "Vision and Mission",
        description: "Naveen Kumar's purpose and aspiration as Creative Director.",
    },
    {
        icon: Briefcase,
        title: "Event Portfolio Overview",
        description: "All event types across Aionion Capital and Money Pechu.",
    },
    {
        icon: CalendarDays,
        title: "Event Calendar 2026 - 2027",
        description: "Monthly planner with city slots for all event types.",
    },
    {
        icon: Sparkles,
        title: "HNI Exclusive Events",
        description: "New initiative with intimate, high-value client experiences.",
    },
    {
        icon: Trophy,
        title: "KPI Dashboard - Naveen Kumar",
        description: "Personal performance indicators and career track targets.",
    },
    {
        icon: ShieldAlert,
        title: "KRI Dashboard - Naveen Kumar",
        description: "Risk indicators, thresholds, and mitigation actions.",
    },
    {
        icon: MonitorPlay,
        title: "KPI Dashboard - Johnson",
        description: "Production and digital operations targets.",
    },
    {
        icon: Users,
        title: "KPI Dashboard - Kaviya",
        description: "Hospitality, logistics, and international ticket conversion targets.",
    },
    {
        icon: Gift,
        title: "Gifting and Internal Events Plan",
        description: "Employee, client, vendor, and authority gifting framework.",
    },
    {
        icon: Rocket,
        title: "Career Roadmap",
        description: "Path from Event Manager to Creative Director by 2027.",
    },
];

const visionPillars: IconItem[] = [
    {
        icon: Sparkles,
        title: "Strategic Creativity",
        description: "Events should create memorable brand moments, not just gatherings.",
    },
    {
        icon: Handshake,
        title: "Client-First Philosophy",
        description: "Every format should deepen trust, retention, and relationship quality.",
    },
    {
        icon: LineChart,
        title: "Data-Driven Decisions",
        description: "KPIs and KRIs should guide execution, conversion, and risk response.",
    },
    {
        icon: Globe2,
        title: "Global Tamil Outreach",
        description: "Aionion should become the most recognised investment brand among Tamil audiences in India and abroad.",
    },
];

const eventPortfolio: PortfolioItem[] = [
    {
        category: "Existing clients",
        title: "Aionion Capital Connect",
        description: "Education and trust-building sessions for existing investors. Clarify doubts, share market insights, and strengthen relationships.",
        frequency: "Monthly",
        icon: Handshake,
    },
    {
        category: "Lead generation",
        title: "Money Pechu Fans Meet",
        description: "City-by-city fan meets with Mr. Anand Srinivasan. Audience conversion events across India with Tamil-focused outreach.",
        frequency: "Monthly",
        icon: TrendingUp,
    },
    {
        category: "Global diaspora",
        title: "Intl. Money Pechu Fans Meet",
        description: "International editions targeting Tamil diaspora markets globally. Kaviya handles logistics and ticket conversions.",
        frequency: "Bi-monthly",
        icon: Globe2,
    },
    {
        category: "High net worth",
        title: "HNI Exclusive Meets",
        description: "Intimate, small-scale gatherings for high net worth individuals with curated experience and personalised engagement.",
        frequency: "Bi-monthly",
        icon: Star,
    },
    {
        category: "Employee engagement",
        title: "Aionion Annual Dinner Night",
        description: "Premium entertainment evening for all employees with music, dance, gourmet dining, rewards, and appreciation.",
        frequency: "Annual",
        icon: Trophy,
    },
    {
        category: "Employee engagement",
        title: "Team Building Retreat",
        description: "Resort-based overnight retreat with group games, bonding activities, and a restorative break for the full team.",
        frequency: "Annual",
        icon: Users,
    },
    {
        category: "Employee welfare",
        title: "Employees Family Dinner",
        description: "Star-hotel dinner welcoming employees' families to build belonging, morale, and emotional connection with the organisation.",
        frequency: "Annual",
        icon: Building2,
    },
    {
        category: "Client relations",
        title: "Client Appreciation Dinner",
        description: "Exclusive fine-dining for existing clients as a gratitude gesture, relationship deepener, and subtle re-engagement moment.",
        frequency: "Annual",
        icon: Wallet,
    },
    {
        category: "International clients",
        title: "Foreign Client Appointments",
        description: "Personalised one-on-one or group appointments for overseas clients visiting India or key international hubs.",
        frequency: "On-demand",
        icon: Plane,
    },
];

const calendarMonths = ["Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26", "Nov '26", "Dec '26", "Jan '27", "Feb '27", "Mar '27"];

const calendarRows: CalendarRow[] = [
    {
        event: "Aionion Capital Connect",
        cells: Array(12).fill("City TBD"),
    },
    {
        event: "Money Pechu Fans Meet (India)",
        cells: Array(12).fill("City TBD"),
    },
    {
        event: "Intl. Money Pechu Fans Meet",
        cells: ["-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD"],
    },
    {
        event: "HNI Exclusive Meet",
        cells: ["-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD", "-", "City TBD"],
    },
    {
        event: "Client Appreciation Dinner",
        cells: ["-", "-", "-", "-", "-", "-", "-", "-", "Star Hotel TBD", "-", "-", "-"],
    },
    {
        event: "Gifting Campaign",
        cells: ["-", "-", "-", "-", "-", "-", "Diwali", "-", "New Year", "-", "-", "-"],
    },
    {
        event: "Employee Events (Dinner / Retreat)",
        cells: ["-", "-", "Team Retreat", "-", "-", "-", "-", "-", "Annual Dinner", "Family Dinner", "-", "-"],
    },
    {
        event: "Foreign Client Appointments",
        cells: ["On-demand", "-", "On-demand", "-", "On-demand", "-", "On-demand", "-", "On-demand", "-", "On-demand", "-"],
    },
];

const hniHighlights: IconItem[] = [
    {
        icon: Users,
        title: "Format",
        description: "Invite-only roundtables or private dinners of 20 to 30 HNI clients with a curated attendee list.",
    },
    {
        icon: CalendarDays,
        title: "Frequency",
        description: "Once every two months, targeting six events per year across select cities in India and key international hubs.",
    },
    {
        icon: LineChart,
        title: "Content",
        description: "Exclusive market insights, portfolio review sessions, and one-on-one conversations with senior leadership.",
    },
    {
        icon: Building2,
        title: "Venue",
        description: "Five-star hotel private lounges, exclusive clubs, or premium private event spaces with bespoke ambience.",
    },
    {
        icon: TrendingUp,
        title: "Expected Output",
        description: "Deeper HNI retention, premium AUM growth, and peer referrals within high-value social networks.",
    },
    {
        icon: Trophy,
        title: "KPI Target",
        description: "Minimum two new HNI conversions per event, 80% attendance from invitees, and NPS >= 9/10.",
    },
];

const naveenKpis: KpiRow[] = [
    { id: "1", focusArea: "Event delivery", indicator: "Events executed on time and on budget", target: "100% of planned events", measurement: "Monthly review" },
    { id: "2", focusArea: "Lead generation", indicator: "New leads from Money Pechu Fans Meet", target: "Minimum 150 leads per event", measurement: "Post-event CRM report" },
    { id: "3", focusArea: "Client retention", indicator: "Existing client attendance at Capital Connect", target: "Minimum 70% invited clients attend", measurement: "Event registration data" },
    { id: "4", focusArea: "HNI events", indicator: "HNI conversions per exclusive meet", target: "Minimum 2 conversions per event", measurement: "Sales team confirmation" },
    { id: "5", focusArea: "International reach", indicator: "Cities covered - Intl. Fans Meet", target: "Minimum 4 international cities per year", measurement: "Event execution records" },
    { id: "6", focusArea: "Brand and content", indicator: "Content pieces generated per event", target: "Minimum 5 creatives and 1 reel per event", measurement: "Digital content tracker" },
    { id: "7", focusArea: "Digital leads", indicator: "Leads via digital marketing campaigns", target: "Minimum 20% of total monthly leads", measurement: "Campaign analytics" },
    { id: "8", focusArea: "Team performance", indicator: "Team KPI achievement rate", target: "Both team members at >= 85% KPI", measurement: "Monthly 1-on-1 review" },
    { id: "9", focusArea: "Stakeholder NPS", indicator: "Event NPS score for client and employee events", target: ">= 8.5 / 10 average", measurement: "Post-event feedback form" },
    { id: "10", focusArea: "Career growth", indicator: "Brand and creative projects led", target: "Minimum 3 branding projects per year", measurement: "Project completion log" },
];

const naveenKris: KriRow[] = [
    { risk: "Venue booking failure", indicator: "Venue confirmed less than 3 weeks before event", threshold: "Any event without venue 21 days before", mitigation: "Maintain a list of 3 backup venues per city" },
    { risk: "Low lead attendance", indicator: "Registered leads attending less than 60% of capacity", threshold: "RSVP to walk-in ratio drops below 0.6", mitigation: "Run WhatsApp and email reminders 48 hours prior" },
    { risk: "Budget overrun", indicator: "Event spend exceeds approved budget by more than 10%", threshold: "Cost variance above 10% per event", mitigation: "Track costs weekly and use pre-approved vendor empanelment" },
    { risk: "Team dependency risk", indicator: "A key task is managed by one person only", threshold: "Any task with no backup owner", mitigation: "Cross-train Johnson and Kaviya and maintain SOPs" },
    { risk: "Digital content delay", indicator: "Post-event creatives delivered more than 48 hours late", threshold: "Content published more than 2 days after the event", mitigation: "Keep templates ready and brief the agency one week early" },
    { risk: "International event compliance", indicator: "Visa or regulatory issues for team or speakers", threshold: "Any compliance gap identified less than 2 weeks before", mitigation: "Kaviya handles paperwork at least 6 weeks in advance" },
    { risk: "Low HNI conversion", indicator: "Zero conversions in 2 consecutive HNI meets", threshold: "Conversion rate equals 0 for 2 consecutive events", mitigation: "Brief the sales team before the event and follow up within 48 hours" },
    { risk: "Reputational risk", indicator: "Negative social mentions after an event", threshold: "Any public complaint with more than 500 reach", mitigation: "Assign social listening and respond within 2 hours" },
];

const johnsonKpis: KpiRow[] = [
    { id: "1", focusArea: "Production readiness", indicator: "Stage, AV, and decor setup completed on time", target: "100% setup complete 2 hours before event", measurement: "Pre-event checklist sign-off" },
    { id: "2", focusArea: "Vendor management", indicator: "Vendor deliverables received without escalation", target: ">= 95% of vendors deliver without follow-up", measurement: "Vendor tracker sheet" },
    { id: "3", focusArea: "Digital ops", indicator: "Event registration and RSVP portal accuracy", target: "Zero errors in attendee data entry", measurement: "CRM audit post-event" },
    { id: "4", focusArea: "Content support", indicator: "Digital creatives and promotions published on time", target: "All posts live 48 hours before event date", measurement: "Content calendar tracker" },
    { id: "5", focusArea: "Live event tech", indicator: "AV or streaming uptime during the event", target: ">= 99% uptime during live sessions", measurement: "Tech incident log" },
    { id: "6", focusArea: "Social media ops", indicator: "Live coverage posts for Instagram, YouTube, and LinkedIn", target: "Minimum 3 live posts per event", measurement: "Social analytics dashboard" },
    { id: "7", focusArea: "Lead capture", indicator: "Digital lead form submissions captured correctly", target: "100% form entries synced to CRM", measurement: "CRM completion report" },
    { id: "8", focusArea: "Post-event", indicator: "Event recap content published within 48 hours", target: "Recap reel or blog live within 48 hours", measurement: "Content publish log" },
    { id: "9", focusArea: "SOP adherence", indicator: "Production SOP compliance score", target: ">= 90% compliance per event audit", measurement: "Monthly checklist review" },
    { id: "10", focusArea: "KRI monitoring", indicator: "Technical risk items flagged in advance", target: "Zero unplanned AV or tech failures", measurement: "Pre-event risk review" },
];

const kaviyaKpis: KpiRow[] = [
    { id: "1", focusArea: "Hospitality", indicator: "Guest experience rating at events", target: ">= 9 / 10 hospitality score", measurement: "Post-event survey" },
    { id: "2", focusArea: "Logistics", indicator: "Venue, catering, and travel arrangements confirmed on time", target: "All logistics locked 3 weeks before event", measurement: "Logistics checklist sign-off" },
    { id: "3", focusArea: "Intl. ticketing", indicator: "Ticket conversion rate for international fans meets", target: "Minimum 70% of registrations convert to paid tickets", measurement: "Ticketing platform report" },
    { id: "4", focusArea: "Intl. compliance", indicator: "Visa and entry documentation filed on time", target: "100% documents filed at least 6 weeks before event", measurement: "Documentation tracker" },
    { id: "5", focusArea: "Check-in ops", indicator: "Event check-in completion within first 20 minutes", target: ">= 90% guests checked in within 20 minutes of doors opening", measurement: "Check-in system timestamp log" },
    { id: "6", focusArea: "Vendor hospitality", indicator: "Catering and hospitality vendor satisfaction", target: "Zero escalations per event", measurement: "Vendor debrief notes" },
    { id: "7", focusArea: "Attendee follow-up", indicator: "Thank-you communication sent after the event", target: "100% attendees receive follow-up within 24 hours", measurement: "CRM communication log" },
    { id: "8", focusArea: "Budget adherence", indicator: "Hospitality and logistics spend within budget", target: "<= 5% variance from approved budget", measurement: "Finance reconciliation sheet" },
    { id: "9", focusArea: "Intl. sales", indicator: "International revenue from ticket sales", target: "Minimum INR X target per international event", measurement: "Sales dashboard" },
    { id: "10", focusArea: "Process efficiency", indicator: "SOP documentation for all recurring events", target: "100% of events have an updated SOP document", measurement: "SOP repository audit" },
];

const giftingRows: GiftingRow[] = [
    {
        occasion: "Diwali",
        clients: "Premium dry fruit hamper or silver coin",
        vendors: "Branded gift hamper",
        authorities: "Branded hamper and card",
        employees: "Bonus or gift voucher plus sweet box",
    },
    {
        occasion: "New Year",
        clients: "Personalised calendar or planner plus hamper",
        vendors: "Corporate diary and pen set",
        authorities: "Greeting card and desk gift",
        employees: "New Year gift bag and card from leadership",
    },
    {
        occasion: "Other occasions",
        clients: "Anniversary cards or milestone gifts",
        vendors: "Milestone recognition gifts",
        authorities: "Selective token gifts",
        employees: "Birthday wishes plus gift voucher",
    },
];

const internalEvents: PortfolioItem[] = [
    {
        category: "Internal framework",
        title: "Annual Dinner Night",
        description: "Entertainment night with music, dance, and gourmet dinner to celebrate achievements and build morale. Timing: Dec / Jan. Venue: Premium banquet hall.",
        frequency: "Annual",
        icon: Trophy,
    },
    {
        category: "Internal framework",
        title: "Team Building Retreat",
        description: "Overnight resort stay with team games, bonding activities, and a refreshing break. Timing: Mid-year. Venue: Resort or nature stay.",
        frequency: "Annual",
        icon: Users,
    },
    {
        category: "Internal framework",
        title: "Employees Family Dinner",
        description: "Star hotel dinner welcoming employees and their families to deepen belonging. Timing: Year-end. Venue: 5-star hotel.",
        frequency: "Annual",
        icon: Building2,
    },
    {
        category: "Client framework",
        title: "Client Appreciation Dinner",
        description: "Fine dining for existing clients focused on gratitude and subtle re-engagement. Venue: 5-star hotel.",
        frequency: "Annual",
        icon: Wallet,
    },
    {
        category: "Client framework",
        title: "Foreign Client Appointments",
        description: "Personalised meetings for overseas clients in India or global hubs. Venue: Premium lounges or offices.",
        frequency: "On-demand",
        icon: Plane,
    },
];

const roadmapStages: RoadmapStage[] = [
    {
        timeframe: "Now",
        role: "Event Manager",
        theme: "Execute and document every event type",
        bullets: [
            "Plan and execute all 9 event types.",
            "Lead Johnson and Kaviya across delivery.",
            "Build the SOP library and execution processes.",
        ],
    },
    {
        timeframe: "6M",
        role: "Brand Contributor",
        theme: "Take ownership of brand voice",
        bullets: [
            "Own event creatives and content outputs.",
            "Lead digital lead-generation campaigns.",
            "Build Aionion brand guidelines.",
        ],
    },
    {
        timeframe: "12M",
        role: "Events and Branding Lead",
        theme: "Lead branding projects officially",
        bullets: [
            "Manage branding projects as part of the formal role.",
            "Launch the HNI exclusive events series.",
            "Mentor the team on brand standards.",
        ],
    },
    {
        timeframe: "2027",
        role: "Creative Director",
        theme: "Creative and events under one roof",
        bullets: [
            "Take full ownership of events and branding.",
            "Lead content, digital, and creative strategy.",
            "Build a larger creative team for scale.",
        ],
    },
];

function renderSectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="max-w-3xl">
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                {eyebrow}
            </Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-400 md:text-lg">{description}</p>
        </div>
    );
}

function renderKpiTable({ rows }: { rows: KpiRow[] }) {
    return (
        <ScrollArea className="w-full rounded-2xl border border-white/10">
            <div className="min-w-[980px] bg-slate-950/70">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-16 text-slate-300">#</TableHead>
                            <TableHead className="text-slate-300">Focus Area</TableHead>
                            <TableHead className="text-slate-300">Key Performance Indicator</TableHead>
                            <TableHead className="text-slate-300">Target</TableHead>
                            <TableHead className="text-slate-300">Measurement</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id} className="border-white/10 hover:bg-white/[0.03]">
                                <TableCell className="font-semibold text-amber-300">{row.id}</TableCell>
                                <TableCell className="font-medium text-white">{row.focusArea}</TableCell>
                                <TableCell className="text-slate-300">{row.indicator}</TableCell>
                                <TableCell className="text-slate-300">{row.target}</TableCell>
                                <TableCell className="text-slate-400">{row.measurement}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ScrollArea>
    );
}

function renderKriTable({ rows }: { rows: KriRow[] }) {
    return (
        <ScrollArea className="w-full rounded-2xl border border-white/10">
            <div className="min-w-[980px] bg-slate-950/70">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-300">Risk Category</TableHead>
                            <TableHead className="text-slate-300">KRI Indicator</TableHead>
                            <TableHead className="text-slate-300">Threshold / Alert</TableHead>
                            <TableHead className="text-slate-300">Mitigation Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.risk} className="border-white/10 hover:bg-white/[0.03]">
                                <TableCell className="font-medium text-white">{row.risk}</TableCell>
                                <TableCell className="text-slate-300">{row.indicator}</TableCell>
                                <TableCell className="text-slate-300">{row.threshold}</TableCell>
                                <TableCell className="text-slate-400">{row.mitigation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ScrollArea>
    );
}

export default function RoadmapPage() {
    return (
        <div className="min-h-screen bg-slate-950 pb-20 text-slate-100 selection:bg-amber-400/30">
            <div className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_25%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />

                <div className="container relative mx-auto px-6 pb-16 pt-20">
                    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
                        <div className="max-w-4xl">
                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 px-4 py-1 text-amber-300">
                                Vision Board 2026 - 2027
                            </Badge>
                            <h1 className="mt-6 text-5xl font-black tracking-tight text-white md:text-7xl">
                                Events. Brand. <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Legacy.</span>
                            </h1>
                            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                                A full execution and growth framework for Aionion Capital across events, branding, content, digital marketing, team KPIs, risk controls, gifting, and career progression.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Badge className="bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/10">Presented by Naveen Kumar</Badge>
                                <Badge className="bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/10">Event Manager and future Creative Director</Badge>
                                <Badge className="bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/10">Team: Johnson and Kaviya</Badge>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {sectionLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-amber-400/40 hover:bg-white/10"
                                    >
                                        {link.label}
                                        <ArrowRight className="h-4 w-4 text-amber-300" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <Card className="border-white/10 bg-slate-900/70 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Prepared for execution</CardTitle>
                                <CardDescription className="text-slate-400">
                                    The page now follows the PDF structure end to end while keeping the existing route stable.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                {summaryMetrics.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <div className="text-3xl font-black text-amber-300">{item.value}</div>
                                        <div className="mt-1 text-sm leading-6 text-slate-400">{item.label}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="container mx-auto space-y-24 px-6 pt-16">
                <section id="overview" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slides 1 - 2",
                        title: "Vision Board Overview",
                        description: "This section translates the title slides and table of contents into a working page structure, with clear ownership, scope, and sequencing.",
                    })}

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border-white/10 bg-slate-900/60">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Prepared by Naveen Kumar</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Event Manager and future Creative Director for Aionion Capital.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <div className="flex items-center gap-3 text-white">
                                        <Users className="h-5 w-5 text-amber-300" />
                                        <span className="font-semibold">Core team</span>
                                    </div>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Johnson</div>
                                            <div className="mt-2 text-base font-semibold text-white">Production and Digital Ops</div>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Kaviya</div>
                                            <div className="mt-2 text-base font-semibold text-white">Hospitality, Logistics, and Intl. Ticketing</div>
                                        </div>
                                    </div>
                                </div>

                                <blockquote className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-lg leading-8 text-slate-200">
                                    "Events are not just gatherings - they are brand moments that build legacies."
                                </blockquote>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {contentsCards.map((item) => (
                                <Card key={item.title} className="border-white/10 bg-slate-900/55 transition-colors hover:border-amber-400/30">
                                    <CardHeader className="space-y-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 3",
                        title: "Vision, Mission, and Operating Beliefs",
                        description: "The PDF positions Naveen's destination clearly: move from event execution into full creative leadership while keeping event quality, trust, and brand growth tightly connected.",
                    })}

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="border-white/10 bg-slate-900/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                                    <Target className="h-6 w-6 text-amber-300" />
                                    My Vision
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-8 text-slate-300">
                                    To become the Creative Director of Aionion Capital by owning events, brand identity, content strategy, and digital marketing, and by helping Aionion become the most recognised investment brand among Tamil audiences in India and globally.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-slate-900/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                                    <Rocket className="h-6 w-6 text-sky-300" />
                                    My Mission
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-8 text-slate-300">
                                    To engineer memorable, high-impact events that deepen client trust, generate quality leads, and build a stronger brand ecosystem while nurturing a high-performing, motivated team.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {visionPillars.map((item) => (
                            <Card key={item.title} className="border-white/10 bg-slate-900/50">
                                <CardHeader>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-amber-300">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="portfolio" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 4",
                        title: "Event Portfolio Overview",
                        description: "The portfolio spans recurring lead generation, trust-building, client retention, employee engagement, international expansion, and the new HNI private-meet initiative.",
                    })}

                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        {eventPortfolio.map((item) => (
                            <Card key={item.title} className="border-white/10 bg-slate-900/55">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <Badge variant="outline" className="border-white/15 text-slate-300">
                                            {item.category}
                                        </Badge>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                                        <CardDescription className="mt-2 text-slate-400">Frequency: {item.frequency}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-7 text-slate-300">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="calendar" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 5",
                        title: "Event Calendar 2026 - 2027",
                        description: "The monthly plan from April 2026 to March 2027 is kept intact, including city placeholders, recurring cycles, gifting moments, employee events, and on-demand foreign client appointments.",
                    })}

                    <Card className="border-white/10 bg-slate-900/55">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">12-month execution calendar</CardTitle>
                            <CardDescription className="text-slate-400">
                                City names remain intentionally open where the PDF marks them as "City TBD".
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full rounded-2xl border border-white/10">
                                <div className="min-w-[1180px] bg-slate-950/70">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="w-[260px] text-slate-300">Event</TableHead>
                                                {calendarMonths.map((month) => (
                                                    <TableHead key={month} className="text-center text-slate-300">
                                                        {month}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {calendarRows.map((row) => (
                                                <TableRow key={row.event} className="border-white/10 hover:bg-white/[0.03]">
                                                    <TableCell className="font-medium text-white">{row.event}</TableCell>
                                                    {row.cells.map((cell, index) => (
                                                        <TableCell key={`${row.event}-${calendarMonths[index]}`} className="text-center text-slate-300">
                                                            {cell}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                            <p className="mt-4 text-sm text-slate-500">
                                Note: city names are intentionally left blank where the PDF says they should be filled in after venue and schedule confirmation.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 6",
                        title: "HNI Exclusive Meets",
                        description: "This is the new flagship pitch idea in the PDF: small-scale, premium, invite-only experiences built for trust, premium conversions, and high-value relationship compounding.",
                    })}

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {hniHighlights.map((item) => (
                            <Card key={item.title} className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-amber-300">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-7 text-slate-300">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-amber-500/20 bg-amber-500/10">
                        <CardContent className="p-6 text-center text-lg leading-8 text-slate-100">
                            "Where trust becomes investment and investment becomes legacy."
                        </CardContent>
                    </Card>
                </section>

                <section id="dashboards" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slides 7 - 10",
                        title: "KPI and KRI Dashboards",
                        description: "The PDF defines one leadership KPI dashboard, one risk dashboard, and role-based operational scorecards for Johnson and Kaviya. Those tables are preserved below with the same targets and measurements.",
                    })}

                    <Tabs defaultValue="naveen-kpi" className="space-y-6">
                        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                            <TabsTrigger value="naveen-kpi" className="border border-white/10 bg-white/5 text-slate-200 data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                                Naveen KPI
                            </TabsTrigger>
                            <TabsTrigger value="naveen-kri" className="border border-white/10 bg-white/5 text-slate-200 data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                                Naveen KRI
                            </TabsTrigger>
                            <TabsTrigger value="johnson" className="border border-white/10 bg-white/5 text-slate-200 data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                                Johnson
                            </TabsTrigger>
                            <TabsTrigger value="kaviya" className="border border-white/10 bg-white/5 text-slate-200 data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                                Kaviya
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="naveen-kpi" className="space-y-4">
                            <Card className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Naveen Kumar KPI Dashboard</CardTitle>
                                    <CardDescription className="text-slate-400">Event Manager to Creative Director track.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderKpiTable({ rows: naveenKpis })}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="naveen-kri" className="space-y-4">
                            <Card className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Naveen Kumar KRI Dashboard</CardTitle>
                                    <CardDescription className="text-slate-400">Key risk indicators, thresholds, and mitigation actions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderKriTable({ rows: naveenKris })}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="johnson" className="space-y-4">
                            <Card className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Johnson KPI Dashboard</CardTitle>
                                    <CardDescription className="text-slate-400">Production and digital operations targets.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderKpiTable({ rows: johnsonKpis })}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="kaviya" className="space-y-4">
                            <Card className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Kaviya KPI Dashboard</CardTitle>
                                    <CardDescription className="text-slate-400">Hospitality, logistics, and international ticket conversion targets.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderKpiTable({ rows: kaviyaKpis })}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                <section id="gifting" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 11",
                        title: "Gifting Plan and Internal Events Framework",
                        description: "The PDF combines gifting occasions, recipient-specific gift ideas, internal employee experiences, and client-facing hospitality formats into one reusable operating framework.",
                    })}

                    <Card className="border-white/10 bg-slate-900/55">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">Gifting occasions and recipients</CardTitle>
                            <CardDescription className="text-slate-400">
                                Structured gifting for clients, vendors, authorities, and employees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full rounded-2xl border border-white/10">
                                <div className="min-w-[980px] bg-slate-950/70">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableHead className="text-slate-300">Occasion</TableHead>
                                                <TableHead className="text-slate-300">Clients</TableHead>
                                                <TableHead className="text-slate-300">Vendors</TableHead>
                                                <TableHead className="text-slate-300">Authorities</TableHead>
                                                <TableHead className="text-slate-300">Employees</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {giftingRows.map((row) => (
                                                <TableRow key={row.occasion} className="border-white/10 hover:bg-white/[0.03]">
                                                    <TableCell className="font-medium text-white">{row.occasion}</TableCell>
                                                    <TableCell className="text-slate-300">{row.clients}</TableCell>
                                                    <TableCell className="text-slate-300">{row.vendors}</TableCell>
                                                    <TableCell className="text-slate-300">{row.authorities}</TableCell>
                                                    <TableCell className="text-slate-300">{row.employees}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        {internalEvents.map((item) => (
                            <Card key={item.title} className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <Badge variant="outline" className="border-white/15 text-slate-300">
                                            {item.frequency}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                    <CardDescription className="text-slate-500">{item.category}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-7 text-slate-300">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="career" className="space-y-10">
                    {renderSectionHeading({
                        eyebrow: "Slide 12",
                        title: "Career Roadmap to Creative Director",
                        description: "The target role progression is explicit in the PDF: first own event execution, then own brand voice, then officially lead branding, and finally consolidate events and creative leadership under one role.",
                    })}

                    <div className="grid gap-5 lg:grid-cols-4">
                        {roadmapStages.map((stage) => (
                            <Card key={stage.timeframe} className="border-white/10 bg-slate-900/55">
                                <CardHeader>
                                    <Badge className="w-fit bg-amber-500 text-black hover:bg-amber-500">{stage.timeframe}</Badge>
                                    <CardTitle className="text-xl text-white">{stage.role}</CardTitle>
                                    <CardDescription className="text-slate-400">{stage.theme}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {stage.bullets.map((bullet) => (
                                        <div key={bullet} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                                            <span>{bullet}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-amber-500/20 bg-amber-500/10">
                        <CardContent className="p-6 text-center text-lg leading-8 text-slate-100">
                            "Great brands are built by people who care - and great events are how that care is shown."
                        </CardContent>
                    </Card>
                </section>

                <section className="border-t border-white/10 pt-16">
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                                Slide 13
                            </Badge>
                            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Aionion Capital - Events. Brand. Legacy.</h2>
                            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
                                Prepared by Naveen Kumar for the Aionion Capital team, with Johnson leading production and digital operations, and Kaviya leading hospitality, logistics, and international ticketing.
                            </p>
                            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-500">
                                Aspiration: Creative Director - Events and Branding
                            </p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
                            <img src={coronaLogo} alt="Corona Creative Solutions" className="h-12 w-auto" />
                            <div className="h-10 w-px bg-white/10" />
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Vision Board</div>
                                <div className="text-xl font-black text-white">2026 - 2027</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
