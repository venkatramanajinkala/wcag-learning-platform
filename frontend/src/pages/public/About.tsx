import { ArrowRight, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../../components/ui/Reveal";

export default function About() {
  return (
    <div className="space-y-10">
      <section className="theme-hero rounded-[32px] p-6 sm:p-8">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <Reveal className="max-w-2xl space-y-4" delay={0.05}>
            <div className="premium-pill relative">
              <Sparkles className="h-3.5 w-3.5" />
              About A11yPlay
            </div>
            <h1 className="relative text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Accessibility practice that feels like a product, not a textbook.
            </h1>
            <p className="relative max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              A11yPlay is a WCAG learning platform built around interactive examples, saved progress, and a practical AI assistant for quick guidance.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="premium-chip relative bg-cyan-50 text-cyan-700">
                WCAG practice
              </span>
              <span className="premium-chip relative bg-indigo-50 text-indigo-700">
                Progress tracking
              </span>
              <span className="premium-chip relative bg-emerald-50 text-emerald-700">
                AI guidance
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="premium-surface-strong rounded-[30px] p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Trust</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Built to feel clear and reliable.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Depth</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Layered surfaces with restrained glow.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Clarity</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Readable content with visible hierarchy.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Pace</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Calm motion that supports focus.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Reveal delay={0.08}>
          <article className="premium-card rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-slate-950">Protected learning</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Your progress, submissions, and saved work stay tied to your account.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.12}>
          <article className="premium-card rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-slate-950">Real audit habits</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              The platform is built to help you practice the checks you&apos;d actually use in production work.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.16}>
          <article className="premium-card rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-slate-950">Concise AI help</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              The assistant explains WCAG in short, practical language and keeps the answer easy to act on.
            </p>
          </article>
        </Reveal>
      </section>

      <section className="rounded-[32px] border border-slate-900/10 bg-[linear-gradient(135deg,#020617_0%,#1e293b_44%,#334155_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-8">
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
