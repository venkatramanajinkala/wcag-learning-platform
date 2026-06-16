import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Reveal from "../../components/ui/Reveal";
import ThemeToggle from "../../components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-screen min-w-0 text-slate-900">
      <header className="theme-header">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#4338ca_100%)] text-sm font-black text-white shadow-lg shadow-slate-950/15">
              A
            </span>
            <div>
              <p className="text-sm font-black tracking-tight">A11yPlay</p>
              <p className="hidden text-[11px] font-semibold text-slate-500 sm:block">Premium WCAG learning platform</p>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/features"
              className="topbar-button"
            >
              Features
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full min-w-0 max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:py-12">
        <section className="theme-hero hidden rounded-[32px] p-8 lg:block">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 via-cyan-500 to-emerald-500" aria-hidden="true" />
          <Reveal className="space-y-5" delay={0.08}>
            <div className="premium-pill">
              <Sparkles className="h-3.5 w-3.5" />
              Modern WCAG practice
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Learn accessibility with a cleaner, calmer workspace.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Sign in to save progress, keep your audits tied to your account, and use the assistant to get quick WCAG guidance without losing context.
            </p>
            <div className="grid gap-3 pt-1">
              <div className="premium-card flex items-start gap-3 rounded-[24px] p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Protected progress</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Keep learning history, submissions, and resets connected to your login.
                  </p>
                </div>
              </div>
              <div className="premium-card flex items-start gap-3 rounded-[24px] p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Fast resume</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Jump back into criteria, tools, and assistant conversations without starting over.
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Premium onboarding</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Designed to feel calm, elevated, and trustworthy from the very first login.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="w-full min-w-0">{children}</section>
      </main>
    </div>
  );
}
