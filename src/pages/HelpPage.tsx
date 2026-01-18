import { useState } from "react";
import {
    Search,
    HelpCircle,
    FileSpreadsheet,
    Calendar,
    Image as ImageIcon,
    ClipboardCheck,
    ChevronRight,
    BookOpen,
    MessageCircle,
    ArrowRight,
    LucideIcon
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
        title: "Expense Management",
        icon: FileSpreadsheet,
        description: "Track incomes, manage expenses, and generate professional reports.",
        articles: [
            {
                title: "How to add new expense items?",
                content: "On the Expenses page, click the 'Add Item' button at the bottom of the table. You can then enter the particulars, income or expense amount, and any remarks. The totals will update automatically."
            },
            {
                title: "How does the GST calculation work?",
                content: "You can adjust the GST percentage in the Summary section at the bottom. The system calculates the GST amount based on your total expenses and adds it to the grand total."
            },
            {
                title: "Exporting and Printing Reports",
                content: "Use the 'Save Draft', 'Export CSV', and 'Print / PDF' buttons at the top of the Expenses page. Saving stores data locally in your browser, while Export downloads a CSV file. Print opens a professional report layout optimized for physical printing."
            }
        ]
    },
    {
        id: "events",
        title: "Event Planning",
        icon: Calendar,
        description: "Keep track of your upcoming events and manage RSVPs.",
        articles: [
            {
                title: "Creating and managing events",
                content: "The Events page lists all your planned activities. You can see event dates, locations, and current RSVP counts at a glance."
            },
            {
                title: "How to manage RSVPs?",
                content: "Click on a specific event to view the RSVP list. You can add new attendees, update their status, and keep track of who is coming."
            }
        ]
    },
    {
        id: "gallery",
        title: "Document Gallery",
        icon: ImageIcon,
        description: "Secure storage for event photos, PDFs, and Word documents.",
        articles: [
            {
                title: "Uploading Documents",
                content: "Navigate to the Gallery, select the relevant event category, and use the upload button to store documents. Supported formats include images (JPG/PNG), PDFs, and Word documents."
            },
            {
                title: "Searching and Filtering",
                content: "Use the search bar in the Gallery to find specific files. You can also filter by event type to quickly locate all documents related to a specific project."
            }
        ]
    },
    {
        id: "sop",
        title: "Pre-Event SOP",
        icon: ClipboardCheck,
        description: "Follow a standard checklist to ensure event excellence.",
        articles: [
            {
                title: "What is the Pre-Event SOP?",
                content: "The SOP (Standard Operating Procedure) is a comprehensive checklist of 7 major categories (Planning, Venue, Production, etc.) that ensures every detail of your event is covered."
            },
            {
                title: "How to track progress?",
                content: "As you complete tasks, check them off. Each category has its own progress bar, and the overall completion status is shown at the top. This data is saved locally to your browser."
            },
            {
                title: "Resetting or Printing the SOP",
                content: "You can use the Reset button to start fresh for a new event. The Print button generates a clean version of your checklist, which is useful for on-site execution."
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
            <div className="bg-primary text-primary-foreground py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent-content border-accent/30">
                        Support Center
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                        How can we help you today?
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for guides, features, or FAQs..."
                            className="pl-12 h-14 text-lg rounded-2xl border-none shadow-2xl text-foreground"
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
