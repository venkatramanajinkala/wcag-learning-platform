import { ReactNode } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_44%,#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-indigo-100/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white shadow-sm">
              A
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight">A11yPlay</span>
              <span className="hidden text-[11px] font-semibold text-slate-500 sm:block">WCAG learning platform</span>
            </span>
          </Link>

          <nav aria-label="Public navigation" className="flex items-center gap-2 text-xs font-bold">
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                  isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                  isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              About
            </NavLink>
            <Link
              to="/login"
              className="ml-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-sm">
                  A
                </span>
                <div>
                  <p className="text-sm font-extrabold text-white">A11yPlay</p>
                  <p className="text-[11px] font-semibold text-slate-400">Accessibility-first learning</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Practice WCAG with interactive lessons, protected progress, and a built-in AI assistant that speaks like a mentor.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  WCAG practice
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  Progress tracking
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  AI assistance
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Explore</p>
              <div className="space-y-2 text-sm font-semibold text-slate-200">
                <Link to="/features" className="block transition hover:text-white">
                  Features
                </Link>
                <Link to="/about" className="block transition hover:text-white">
                  About
                </Link>
                <Link to="/login" className="block transition hover:text-white">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Built for</p>
              <div className="space-y-3 text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  WCAG practice
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Real audit workflows
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright 2026 A11yPlay. Built for accessibility training.</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                WCAG 2.2 Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 font-semibold text-slate-300">
                Learning workspace
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
