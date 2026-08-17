import { useState } from "react";
import {
    Maximize2,
    Download,
    Eye,
    Clock,
    Sparkles,
    CheckCircle2,
    Building2,
    FileText,
    Train,
    Radio,
    Armchair,
    Coffee,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCcw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import blueprintImg from "@/assets/money-pechu-blueprint.jpg";

interface BlueprintCardProps {
    onJumpToCategory?: (categoryId: string) => void;
    defaultExpanded?: boolean;
}

export function MoneyPechuBlueprintCard({ onJumpToCategory }: BlueprintCardProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [activePhase, setActivePhase] = useState<"all" | "phase1" | "phase2">("all");

    const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
    const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
    const handleResetZoom = () => setZoomLevel(1);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = blueprintImg;
        link.download = "Money-Pechu-Event-Blueprint.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Main Visual Banner Card */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 shadow-2xl transition-all duration-300 hover:border-amber-500/50">
                {/* Ambient Glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold px-2.5 py-0.5">
                                    <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-400" />
                                    Official SOP Visual
                                </Badge>
                                <Badge variant="outline" className="border-slate-700 text-slate-300">
                                    Full 2-Phase Roadmap
                                </Badge>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                Money Pechu: <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">The Ultimate Event Blueprint</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-400">
                                Visual masterplan for Pre-Event Admin, Logistics, Rigging, VIP Setup & On-Site Execution.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsLightboxOpen(true)}
                                className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 gap-1.5 h-9 text-xs sm:text-sm"
                            >
                                <Maximize2 className="h-4 w-4" />
                                <span>Inspect Full Blueprint</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5 h-9 text-xs sm:text-sm"
                                title="Download image"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                        </div>
                    </div>

                    {/* Image Preview with Interactive Overlay */}
                    <div className="mt-4 group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
                        <img
                            src={blueprintImg}
                            alt="Money Pechu: The Ultimate Event Blueprint"
                            className="w-full h-auto max-h-[380px] sm:max-h-[460px] object-contain transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
                            onClick={() => setIsLightboxOpen(true)}
                        />
                        {/* Hover Overlay Button */}
                        <div
                            onClick={() => setIsLightboxOpen(true)}
                            className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-amber-300 shadow-xl">
                                <Eye className="h-4 w-4 text-amber-400" />
                                Click to Expand Full Resolution Blueprint
                            </span>
                        </div>
                    </div>

                    {/* Interactive Highlights Grid */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Blueprint Core Pillars & Milestones
                            </h3>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActivePhase("all")}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${activePhase === "all" ? "bg-amber-500 text-black font-semibold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                                >
                                    All Pillars
                                </button>
                                <button
                                    onClick={() => setActivePhase("phase1")}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${activePhase === "phase1" ? "bg-blue-600 text-white font-semibold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                                >
                                    Phase 1: Pre-Event
                                </button>
                                <button
                                    onClick={() => setActivePhase("phase2")}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${activePhase === "phase2" ? "bg-purple-600 text-white font-semibold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                                >
                                    Phase 2: Production
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Pillar 1 */}
                            {(activePhase === "all" || activePhase === "phase1") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("location-analysis")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-blue-500/40 text-blue-400 text-[10px]">
                                                Phase 1 • Logistics
                                            </Badge>
                                            <Building2 className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-blue-300">
                                                Strategic City Research & Tiering
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Categorize locations into Tiers 1, 2, and 3 based on digital reach and viewership.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pillar 2 */}
                            {(activePhase === "all" || activePhase === "phase1") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("vendor-allocation")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                                                Phase 1 • Admin
                                            </Badge>
                                            <FileText className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300">
                                                The "Paperwork" Foundation
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Secure police permissions and verify GST/PAN details for all vendor invoices and payments.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pillar 3 */}
                            {(activePhase === "all" || activePhase === "phase1") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("accessibility")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px]">
                                                Phase 1 • Venue
                                            </Badge>
                                            <Train className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300">
                                                Venue Criteria & Access
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Select venues with easy access to railway stations and ample parking for attendees.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pillar 4 */}
                            {(activePhase === "all" || activePhase === "phase2") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("production-hardware")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-purple-500/40 text-purple-400 text-[10px]">
                                                Phase 2 • Tech Rig
                                            </Badge>
                                            <Radio className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-purple-300">
                                                Technical Rig & Dry Run
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Conduct a dry run for a start, testing LED walls and RCF sound systems.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pillar 5 */}
                            {(activePhase === "all" || activePhase === "phase2") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("technical-specs")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-pink-500/50 hover:bg-pink-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-pink-500/40 text-pink-400 text-[10px]">
                                                Phase 2 • Seating
                                            </Badge>
                                            <Armchair className="h-4 w-4 text-pink-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-pink-300">
                                                VIP & Stage Furniture
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Arrange red double-seater VIP sofas, stage teapoy, and 10–13 reserved front-row seats.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pillar 6 */}
                            {(activePhase === "all" || activePhase === "phase2") && (
                                <Card
                                    onClick={() => onJumpToCategory?.("hospitality-hitea")}
                                    className="border-slate-800/80 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                                                Phase 2 • Stalls
                                            </Badge>
                                            <Coffee className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-amber-300">
                                                Stalls & Hospitality Setup
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Themed stalls (Tax, Stocks, Insurance) & Hi-Tea with Cothas coffee & samosas.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Critical Sunday Timeline Banner */}
                        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900 to-amber-950/30 p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            Critical Sunday Evening Timeline
                                            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">
                                                Zero-Tolerance
                                            </Badge>
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Synchronized milestone execution for Money Pechu event start.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <span className="font-bold text-amber-400">2:00 PM</span>
                                        <span className="text-slate-300">Venue Handover</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 hidden sm:inline" />
                                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <span className="font-bold text-blue-400">2:30 PM</span>
                                        <span className="text-slate-300">Production Dry Run</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 hidden sm:inline" />
                                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <span className="font-bold text-emerald-400">4:30 PM</span>
                                        <span className="text-slate-300">Audience Entry & Start</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Screen Lightbox Modal */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[92vh] overflow-hidden bg-slate-950 border-slate-800 text-white p-4 sm:p-6 flex flex-col">
                    <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                Money Pechu: The Ultimate Event Blueprint
                            </DialogTitle>
                            <p className="text-xs text-slate-400">
                                Master illustration for high-yield event execution
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pr-6">
                            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-white"
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-xs px-2 font-mono text-slate-400">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-white"
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-white"
                                    onClick={handleResetZoom}
                                    title="Reset Zoom"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="h-8 border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-xs gap-1"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Save Image</span>
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Zoomable Image Container */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 rounded-xl mt-4 border border-slate-800/80">
                        <div
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transition: "transform 0.2s ease-in-out",
                                transformOrigin: "center center",
                            }}
                            className="max-w-full"
                        >
                            <img
                                src={blueprintImg}
                                alt="Money Pechu: The Ultimate Event Blueprint"
                                className="max-h-[72vh] w-auto object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
