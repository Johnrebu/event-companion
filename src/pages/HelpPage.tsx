import { useState } from "react";
import {
    Search,
    HelpCircle,
    FileSpreadsheet,
    Calendar,
    ClipboardCheck,
    ChevronRight,
    BookOpen,
    MessageCircle,
    ArrowRight,
    LucideIcon,
    Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HelpArticle {
    title: string;
    content: string;
}

interface HelpSection {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    articles: HelpArticle[];
}

const HELP_DATA: HelpSection[] = [
    {
        id: "expenses",
        title: "Financial Command Center",
        icon: FileSpreadsheet,
        description: "Track incomes, manage expenses with professional grade analytical tools.",
        articles: [
            {
                title: "Drafts vs. Permanent Database Storage",
                content: "We offer two ways to save. 'Save Draft' stores your work locally in your browser's memory—useful for quick pick-ups. 'Save to Database' permanently stores your report in our cloud (Supabase), making it accessible across devices and secure from browser clears."
            },
            {
                title: "How to manage saved reports?",
                content: "Click the 'Reports' button in the toolbar to see all your cloud-saved records. You can view the Net Balance for each report at a glance. Clicking a report loads it back into your workspace, while the trash icon allows for permanent deletion."
            },
            {
                title: "Professional Report Styling",
                content: "Our system uses the 'Outfit' typography and high-contrast gradients to ensure your financial data is easy to read and looks professional for client presentations. The 'Print / PDF' button generates a high-quality physical copy optimized for A4 paper."
            }
        ]
    },
    {
        id: "mobile",
        title: "On-the-Go Usage",
        icon: Zap,
        description: "The platform is fully optimized for smartphones and tablets.",
        articles: [
            {
                title: "Where is the navigation menu?",
                content: "On mobile devices, we use a sleek 'Hamburger' menu in the top right. Tap it to access Home, Expenses, Events, and the Help Center seamlessly."
            },
            {
                title: "Editing tables on small screens",
                content: "Our expense tables are horizontally scrollable on mobile. Simply swipe left or right on the table to access all columns like 'Bills' and 'Remarks' while maintaining readable input sizes."
            }
        ]
    },
    {
        id: "events",
        title: "Event Coordination",
        icon: Calendar,
        description: "Master your schedule and organize flawless experiences.",
        articles: [
            {
                title: "Creating and managing events",
                content: "The Events page lists all your planned activities. You can see event dates, locations, and current RSVP counts at a glance."
            },
            {
                title: "Professional Landing Page",
                content: "Our new 'Corona Creative Solutions' home page provides a high-end entry point for your team, highlighting our core mission and providing quick-access shortcuts to all features."
            }
        ]
    },
    {
        id: "sop",
        title: "Standard Operating Procedures",
        icon: ClipboardCheck,
        description: "Follow standardized checklists used by the industry's best.",
        articles: [
            {
                title: "What is the Pre-Event SOP?",
                content: "The SOP (Standard Operating Procedure) is a comprehensive checklist of 7 major categories (Planning, Venue, Production, etc.) that ensures every detail of your event is covered."
            },
            {
                title: "Syncing & Printing Checks",
                content: "All checklist items are saved as you tick them. Use the 'Print' feature to generate a physical walkthrough list for your ground team during event setup."
            }
        ]
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredData = HELP_DATA.map(section => ({
        ...section,
        articles: section.articles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.articles.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pb-20">
            {/* Hero Section */}
            <div className="bg-[#0a0a0a] text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-500 bg-amber-500/10 px-4 py-1">
                        MISSION CONTROL SUPPORT
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
                        <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                            System
                        </span>{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                            Intelligence
                        </span>
                    </h1>
                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            placeholder="Search command protocols, financial guides..."
                            className="pl-12 h-14 text-lg rounded-2xl border-white/10 bg-white/5 backdrop-blur-md shadow-2xl text-white placeholder:text-gray-500 focus-visible:ring-amber-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 max-w-6xl">
                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {HELP_DATA.map((item) => (
                        <Card
                            key={item.id}
                            className={cn(
                                "group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-primary/10",
                                activeCategory === item.id ? "ring-2 ring-primary" : ""
                            )}
                            onClick={() => setActiveCategory(activeCategory === item.id ? null : item.id)}
                        >
                            <CardHeader className="space-y-4">
                                <div className="p-3 bg-primary/10 w-fit rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                    <CardDescription className="mt-2 line-clamp-2">
                                        {item.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {filteredData.length > 0 ? (
                            filteredData.map((section) => (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    className={cn(
                                        "transition-opacity duration-300",
                                        activeCategory && activeCategory !== section.id ? "opacity-30" : "opacity-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <section.icon className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-bold">{section.title}</h2>
                                    </div>
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {section.articles.map((article, index) => (
                                            <AccordionItem
                                                key={index}
                                                value={`${section.id}-${index}`}
                                                className="border rounded-2xl px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold text-lg">
                                                    {article.title}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                                    {article.content}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-primary/10">
                                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold">No results found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or browse categories above.</p>
                                <Button
                                    variant="link"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 text-primary"
                                >
                                    Clear search
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none">
                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Need more help?
                                </CardTitle>
                                <CardDescription className="text-primary-foreground/80 mt-2">
                                    Can't find what you're looking for? Our support team is here for you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <Button variant="secondary" className="w-full group">
                                    Contact Support
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </CardContent>
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                        </Card>

                        <Card className="border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Start Guide</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {[
                                        "Watch tutorial video",
                                        "Application checklist",
                                        "Privacy & Securities",
                                        "Terms of Service"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors group">
                                            <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
