import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[linear-gradient(180deg,#eef2ff_0%,#ecfeff_38%,#f8fafc_100%)] text-slate-900">
      <header className="border-b border-indigo-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
              A
            </span>
            <div>
              <p className="text-sm font-extrabold tracking-tight">A11yPlay</p>
              <p className="hidden text-[11px] font-semibold text-slate-500 sm:block">WCAG learning platform</p>
            </div>
          </Link>
          <Link
            to="/features"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Features
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-3.5rem)] w-full min-w-0 max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:py-12">
        <section className="relative hidden overflow-hidden rounded-[32px] border border-indigo-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_48%,#ecfeff_100%)] p-8 shadow-sm lg:block">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 via-cyan-500 to-emerald-500" aria-hidden="true" />
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Modern WCAG practice
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Learn accessibility with a cleaner, calmer workspace.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Sign in to save progress, keep your audits tied to your account, and use the assistant to get quick WCAG guidance without losing context.
            </p>
            <div className="grid gap-3 pt-1">
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Protected progress</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Keep learning history, submissions, and resets connected to your login.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Fast resume</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Jump back into criteria, tools, and assistant conversations without starting over.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full min-w-0">{children}</section>
      </main>
    </div>
  );
}
