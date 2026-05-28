import { ArrowRight, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[28px] border border-indigo-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_48%,#ecfeff_100%)] p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            About A11yPlay
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Accessibility practice that feels like a product, not a textbook.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            A11yPlay is a WCAG learning platform built around interactive examples, saved progress, and a practical AI assistant for quick guidance.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-700">
              WCAG practice
            </span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
              Progress tracking
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              AI guidance
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-sm font-extrabold text-slate-900">Protected learning</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Your progress, submissions, and saved work stay tied to your account.
          </p>
        </article>

        <article className="rounded-[24px] border border-cyan-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-sm font-extrabold text-slate-900">Real audit habits</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            The platform is built to help you practice the checks you&apos;d actually use in production work.
          </p>
        </article>

        <article className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-sm font-extrabold text-slate-900">Concise AI help</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            The assistant explains WCAG in short, practical language and keeps the answer easy to act on.
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#0891b2_100%)] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-200">Built for teams</p>
            <h2 className="text-2xl font-black tracking-tight">Learn, audit, and ask questions in one place.</h2>
            <p className="text-sm leading-relaxed text-slate-200">
              A11yPlay keeps the learning flow calm and the guidance practical, so the interface feels like a modern product instead of a document library.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-slate-100"
          >
            Create account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
