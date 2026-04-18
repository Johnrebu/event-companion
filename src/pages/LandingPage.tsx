import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  TrendingUp,
  Zap,
} from "lucide-react";
import coronaLogo from "@/assets/corona-logo.png";

const features = [
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
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

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

          <Link
            to="/expenses"
            className="group inline-flex w-full max-w-[220px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
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
