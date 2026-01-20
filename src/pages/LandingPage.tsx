import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, FileSpreadsheet, ClipboardCheck, Zap } from "lucide-react";
import coronaLogo from "@/assets/corona-logo.png";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px'
                    }}
                />

                {/* Content */}
                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <img
                            src={coronaLogo}
                            alt="Corona Creative Solutions"
                            className="h-24 w-auto drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-500 hover:drop-shadow-[0_0_50px_rgba(251,191,36,0.5)]"
                        />
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                            Corona Creative
                        </span>
                        {" "}
                        <span className="md:inline hidden"><br /></span>
                        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                            Solutions
                        </span>
                    </h1>

                    {/* Tagline */}
                    <p className="text-lg md:text-2xl text-gray-400 font-light tracking-wide mb-12 max-w-2xl mx-auto px-4">
                        Crafting extraordinary experiences.
                        <br />
                        <span className="text-gray-500">Event management, reimagined.</span>
                    </p>

                    {/* CTA Button */}
                    <Link
                        to="/expenses"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-lg font-medium transition-all duration-300 hover:bg-white/10 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                    >
                        <span>Get Started</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
                    <span className="text-xs uppercase tracking-widest">Explore</span>
                    <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Everything you need
                            </span>
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Powerful tools for modern event management
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: FileSpreadsheet,
                                title: "Expenses",
                                description: "Track income & expenses with precision",
                                link: "/expenses",
                                gradient: "from-emerald-500/20 to-emerald-600/5"
                            },
                            {
                                icon: CalendarDays,
                                title: "Events",
                                description: "Manage your calendar seamlessly",
                                link: "/events",
                                gradient: "from-blue-500/20 to-blue-600/5"
                            },
                            {
                                icon: ClipboardCheck,
                                title: "Pre-Event SOP",
                                description: "Standardized preparation checklists",
                                link: "/sop",
                                gradient: "from-purple-500/20 to-purple-600/5"
                            },
                            {
                                icon: Zap,
                                title: "Event SOP",
                                description: "Execute with precision & speed",
                                link: "/corona-sop",
                                gradient: "from-amber-500/20 to-amber-600/5"
                            }
                        ].map((feature, index) => (
                            <Link
                                key={index}
                                to={feature.link}
                                className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-white/5 transition-all duration-500 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl`}
                            >
                                <feature.icon className="h-10 w-10 mb-6 text-white/80 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-semibold mb-2 text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                                <ArrowRight className="absolute bottom-8 right-8 h-5 w-5 text-white/30 transition-all group-hover:text-white/80 group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-300 leading-relaxed">
                        "We don't just manage events.
                        <br />
                        <span className="text-white font-normal">We create moments that matter.</span>"
                    </blockquote>
                    <div className="mt-8 text-amber-500/80 font-medium">
                        — Corona Creative Solutions
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src={coronaLogo} alt="Corona" className="h-8 w-auto opacity-70" />
                        <span className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} Corona Creative Solutions
                        </span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/expenses" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Expenses
                        </Link>
                        <Link to="/events" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Events
                        </Link>
                        <Link to="/help" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Help
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
