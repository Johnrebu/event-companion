import { TrendingUp, Target, Globe, Users, Trophy, Rocket, Briefcase, Calendar, Star, Shield, Zap, ArrowUpRight, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

const GROWTH_DATA = [
    { year: '2025', leads: 3500, events: 18, conversion: 14 },
    { year: '2026', leads: 6000, events: 27, conversion: 18 },
    { year: '2027', leads: 10000, events: 33, conversion: 22 },
];

const CALENDAR_H1_2026 = [
    { month: "Jan", event: "Capital Connect", audience: "Existing Clients", target: "300 Leads", status: "Planning" },
    { month: "Feb", event: "Money Pechu", audience: "New Clients", target: "800 Leads", status: "Marketing" },
    { month: "Mar", event: "HNI Roundtable", audience: "HNI", target: "40 Leads", status: "Invite-only" },
    { month: "Apr", event: "Family Dinner", audience: "Employees", target: "Culture", status: "Internal" },
    { month: "May", event: "International MP", audience: "NRI (UAE)", target: "500 Leads", status: "Global" },
    { month: "Jun", event: "Team Building", audience: "Employees", target: "Culture", status: "Internal" },
];

export default function RoadmapPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 selection:bg-amber-500/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-500 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                            Strategic Roadmap 2026 – 2027
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                            Transforming <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Potential</span> Into Performance
                        </h1>
                        <p className="text-xl text-slate-400 font-light leading-relaxed mb-8">
                            A comprehensive blueprint for Aionion Capital's Event Division, focused on scalable lead generation, global expansion, and premium HNI positioning.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium">Revenue Hub Expansion</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                <Globe className="h-5 w-5 text-blue-400" />
                                <span className="text-sm font-medium">International Presence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vision Card */}
                    <Card className="lg:col-span-2 bg-slate-900/50 border-white/5 backdrop-blur-xl overflow-hidden hover:border-amber-500/20 transition-all duration-500">
                        <CardHeader className="border-b border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                                        <Target className="h-6 w-6 text-amber-500" />
                                        Executive Vision
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 mt-1">Driving Market Expansion & Direct Revenue</CardDescription>
                                </div>
                                <Rocket className="h-10 w-10 text-white/10" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: "Scalable Lead Gen", desc: "Building high-volume, quality funnel systems", icon: TrendingUp },
                                    { title: "Client Trust", desc: "Enhancing retention through premium events", icon: Shield },
                                    { title: "Global Tamils", desc: "Expanding into UAE, Singapore, US, and EU", icon: Globe },
                                    { title: "HNI Premium", desc: "Exclusive roundtable for high-value prospects", icon: Star },
                                ].map((item, i) => (
                                    <div key={i} className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                        <item.icon className="h-8 w-8 text-amber-500 mb-3" />
                                        <h3 className="text-white font-bold mb-1">{item.title}</h3>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                Growth Momentum
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-medium text-slate-400">2026 Lead Target</span>
                                    <span className="text-xl font-bold text-white">6,000+</span>
                                </div>
                                <Progress value={60} className="h-2 bg-slate-800" />
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-medium text-slate-400">2027 Lead Target</span>
                                    <span className="text-xl font-bold text-white">10,000+</span>
                                </div>
                                <Progress value={40} className="h-2 bg-slate-800" />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-amber-500">+30%</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Expected YoY Revenue Growth</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Core Engines & Strategy */}
                <div className="mt-16 space-y-16">
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">Strategic Growth Engines</h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Users className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <CardTitle className="text-white">Aionion Capital Connect</CardTitle>
                                    </div>
                                    <CardDescription>Existing Clients | Trust | Retention | Referrals</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-slate-400 text-sm">
                                        <li className="flex items-center gap-2">
                                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                            Increase client retention by 15%
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                            Generate 20% referral-based leads
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-500/20 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <CardTitle className="text-white">Money Pechu Fans Meet</CardTitle>
                                    </div>
                                    <CardDescription>New Acquisition | Lead Generation | Community</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-slate-400 text-sm">
                                        <li className="flex items-center gap-2">
                                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                            6,000+ leads target for 2026
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                            Positioning: Global Tamil Financial Awareness
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Chart Section */}
                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Growth Analytics</h2>
                                <p className="text-slate-500">Projected metrics for 2025 – 2027</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Leads</Badge>
                                <Badge variant="secondary" className="bg-blue-400/10 text-blue-400 border-blue-400/20">Events</Badge>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={GROWTH_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="year" stroke="#475569" />
                                    <YAxis yAxisId="left" stroke="#475569" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="leads" name="Leads Generated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="events" name="Annual Events" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Accountability Table */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">Team & Performance Matrix</h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-xs">Role / Member</TableHead>
                                        <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-xs">Primary Accountability</TableHead>
                                        <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-xs">Core KPIs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <TableCell className="font-bold text-white py-6">
                                            Naveen Kumar
                                            <div className="text-[10px] text-slate-500 font-normal">Strategic Oversight</div>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">Revenue Ownership, International Expansion, HNI Strategy</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-amber-500 border-amber-500/20">+25% Revenue Share</Badge>
                                                <Badge variant="outline" className="text-slate-400 border-white/10">30% HNI Conv.</Badge>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <TableCell className="font-bold text-white py-6">
                                            Johnson
                                            <div className="text-[10px] text-slate-500 font-normal">Production & Digital Ops</div>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">Zero failures, Digital lead capture accuracy, 100% on-time execution</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-blue-400 border-blue-400/20">99% Data Accuracy</Badge>
                                                <Badge variant="outline" className="text-slate-400 border-white/10">Zero AV Failures</Badge>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none hover:bg-white/[0.02] transition-colors">
                                        <TableCell className="font-bold text-white py-6">
                                            Kaviya
                                            <div className="text-[10px] text-slate-500 font-normal">Hospitality & Global Log.</div>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">Guest satisfaction, International conversion, Logistics timeliness</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-purple-400 border-purple-400/20">95% Guest Sat.</Badge>
                                                <Badge variant="outline" className="text-slate-400 border-white/10">75% Ticket Conv.</Badge>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* Annual Calendar H1 */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">Event Calendar (H1 2026)</h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CALENDAR_H1_2026.map((cal, i) => (
                                <div key={i} className="relative group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <Calendar className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="secondary" className="bg-amber-500 text-black font-black px-2 py-0">{cal.month}</Badge>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{cal.status}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{cal.event}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{cal.audience}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs text-slate-500">Target</span>
                                        <span className="text-sm font-bold text-amber-500">{cal.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Mission Footer */}
                    <section className="text-center py-20 border-t border-white/5 mt-20">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-4xl font-black text-white mb-6">The Goal 2027</h2>
                            <p className="text-xl text-slate-400 font-light italic">
                                "To position Aionion Capital as the most trusted Tamil investment brand globally."
                            </p>
                            <div className="flex justify-center gap-8 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                                <img src="/src/assets/corona-logo.png" className="h-12 w-auto" alt="Logo" />
                                <div className="h-12 w-px bg-white/20" />
                                <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-white">
                                    AIONION <span className="text-amber-500">CAPITAL</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
