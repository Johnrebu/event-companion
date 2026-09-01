import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";
import coronaLogo from "@/assets/corona-logo.png";
import blueprintImg from "@/assets/money-pechu-blueprint.jpg";

const features = [
  {
    icon: Sparkles,
    title: "The Aionion Ascend",
    description: "VIP Client Registration & Live Gate Check-in Desk",
    link: "/ascend",
    gradient: "from-amber-500/30 to-amber-600/10",
  },
  {
    icon: FileSpreadsheet,
    title: "Expenses",
    description: "Track income and expenses with precision",
    link: "/expenses",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    icon: CalendarDays,
    title: "Events",
    description: "Manage your calendar seamlessly",
    link: "/events",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: ClipboardCheck,
    title: "Pre-Event SOP",
    description: "Standardized preparation checklists",
    link: "/sop",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    icon: Zap,
    title: "Event SOP",
    description: "Execute with precision and speed",
    link: "/corona-sop",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    icon: TrendingUp,
    title: "Vision Board",
    description: "Vision board for 2026-2027",
    link: "/roadmap",
    gradient: "from-red-500/20 to-red-600/5",
  },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080B14] text-white">
      {/* Atmospheric Event Imagery Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.15] mix-blend-luminosity saturate-50">
        <img
          src="https://images.unsplash.com/photo-1540039155732-611422b40d16?w=1200&q=80"
          alt=""
          className="absolute -left-[10%] top-[5%] h-[60vh] w-[40vw] -rotate-6 rounded-[100px] object-cover blur-[4px] sm:h-[80vh] sm:w-[50vw]"
        />
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"
          alt=""
          className="absolute -right-[5%] top-[15%] h-[70vh] w-[45vw] rotate-12 rounded-[150px] object-cover blur-[6px] sm:h-[90vh] sm:w-[55vw]"
        />
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
          alt=""
          className="absolute -bottom-[15%] left-[15%] h-[50vh] w-[70vw] -rotate-12 rounded-[80px] object-cover blur-[5px] sm:h-[70vh] sm:w-[60vw]"
        />
        <img
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80"
          alt=""
          className="absolute -bottom-[10%] -right-[10%] h-[40vh] w-[40vw] rotate-6 rounded-[100px] object-cover blur-[4px] sm:h-[50vh] sm:w-[50vw]"
        />
      </div>

      {/* Creative Glowing Orbs Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[10%] h-[70vw] max-h-[800px] w-[70vw] max-w-[800px] rounded-full bg-gradient-to-br from-violet-600/40 via-fuchsia-600/30 to-transparent blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[20%] h-[80vw] max-h-[900px] w-[80vw] max-w-[900px] rounded-full bg-gradient-to-tl from-amber-500/30 via-orange-600/20 to-transparent blur-[130px]" />
        <div className="absolute left-[10%] top-[40%] h-[50vw] max-h-[600px] w-[50vw] max-w-[600px] rounded-full bg-gradient-to-tr from-blue-600/30 via-teal-500/20 to-transparent blur-[110px]" />
      </div>

      {/* Noise Texture Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <div className="mb-6 flex justify-center sm:mb-8">
            <img
              src={coronaLogo}
              alt="Corona Creative Solutions"
              className="h-20 w-auto drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-500 hover:drop-shadow-[0_0_50px_rgba(251,191,36,0.5)] sm:h-24 md:h-28"
            />
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-[0.95] tracking-tight sm:mb-6 sm:text-5xl md:text-7xl lg:text-8xl">
            <span className="block bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Corona Creative
            </span>
            <span className="mt-2 block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent sm:mt-3">
              Solutions
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl px-2 text-base font-light leading-7 tracking-wide text-gray-400 sm:mb-12 sm:px-4 sm:text-lg md:text-2xl">
            Crafting extraordinary experiences.
            <br />
            <span className="text-gray-500">Event management, reimagined.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/ascend"
              className="group inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-amber-500 px-6 py-3.5 text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-300 hover:bg-amber-400 hover:scale-[1.02] sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>The Aionion Ascend</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/expenses"
              className="group inline-flex w-full max-w-[220px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
            >
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-gray-600 sm:flex">
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <div className="h-8 w-px bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      <section className="relative px-4 py-20 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16 md:mb-20">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything you need
              </span>
            </h2>
            <p className="text-base text-gray-500 sm:text-lg">Powerful tools for modern event management</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.link}
                to={feature.link}
                className={`group relative rounded-2xl border border-white/5 bg-slate-900/40 bg-gradient-to-br ${feature.gradient} p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl sm:p-8`}
              >
                <feature.icon className="mb-6 h-10 w-10 text-white/80 transition-colors group-hover:text-white" />
                <h3 className="mb-2 text-xl font-semibold leading-tight text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-white/80 sm:bottom-8 sm:right-8" />
              </Link>
            ))}
          </div>

          {/* Featured Money Pechu Blueprint Banner */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Featured Visual Framework
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Money Pechu: <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">The Ultimate Event Blueprint</span>
                </h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Explore the complete operational infographic detailing Phase 1 Pre-Event Admin & Logistics, Phase 2 Production, and the critical Sunday execution timeline.
                </p>
                <div className="pt-2">
                  <Link
                    to="/sop"
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:gap-3"
                  >
                    <span>View Interactive Blueprint & SOP</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="w-full md:w-5/12 max-w-sm rounded-2xl overflow-hidden border border-amber-500/20 shadow-xl bg-slate-950/80 group">
                <Link to="/sop" className="block relative">
                  <img
                    src={blueprintImg}
                    alt="Money Pechu Event Blueprint Preview"
                    className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-amber-300">Click to view full resolution →</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <blockquote className="text-xl font-light leading-relaxed text-gray-300 sm:text-2xl md:text-3xl lg:text-4xl">
            "We don't just manage events.
            <br />
            <span className="font-normal text-white">We create moments that matter.</span>"
          </blockquote>
          <div className="mt-8 font-medium text-amber-500/80">- Corona Creative Solutions</div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={coronaLogo} alt="Corona" className="h-8 w-auto opacity-70" />
            <span className="text-sm text-gray-600">
              Copyright {new Date().getFullYear()} Corona Creative Solutions
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <Link to="/ascend" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              The Ascend
            </Link>
            <Link to="/expenses" className="text-sm text-gray-500 transition-colors hover:text-white">
              Expenses
            </Link>
            <Link to="/events" className="text-sm text-gray-500 transition-colors hover:text-white">
              Events
            </Link>
            <Link
              to="/reimbursement-form"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              Reimbursement Form
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
