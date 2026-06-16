import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Reveal from "../../components/ui/Reveal";

export default function Landing() {
  return (
    <div className="space-y-12">
      <section className="theme-hero landing-hero rounded-[36px] p-6 sm:p-8 lg:p-10">
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <Reveal className="space-y-6" delay={0.05}>
            <div className="premium-pill w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Learn WCAG by doing
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                A modern WCAG learning platform built for real audits.
              </h1>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                Practice success criteria with interactive sandboxes, progress tracking, and accessibility tools that build muscle memory without making the interface feel heavy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="premium-button premium-button-primary">
                Create account
              </Link>
              <Link to="/login" className="premium-button premium-button-secondary">
                Sign in
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="premium-panel rounded-[24px] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Premium feel</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Glass, depth, and calm motion.</p>
              </div>
              <div className="premium-panel rounded-[24px] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Accessible</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Strong contrast and clear focus states.</p>
              </div>
              <div className="premium-panel rounded-[24px] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Practical</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Built for real audits, not demos.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="premium-surface-strong landing-workspace rounded-[34px] p-6 sm:p-7">
              <div className="space-y-4">
                <div className="landing-callout flex items-start gap-3 rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="landing-title text-sm font-extrabold text-slate-950">Protected learning workspace</p>
                    <p className="landing-subtitle mt-0.5 text-xs font-medium text-slate-600">
                      Keep your progress, submissions, and tools tied to your account.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="landing-stat-card rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] p-4 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Audit depth</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">66</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">WCAG criteria in the learning dataset.</p>
                  </div>
                  <div className="landing-stat-card rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] p-4 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Assistive flow</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">3</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">Practice modes: learn, audit, ask.</p>
                  </div>
                </div>
                <div className="landing-callout flex items-start gap-3 rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="landing-title text-sm font-extrabold text-slate-950">Track real audit checkpoints</p>
                    <p className="landing-subtitle mt-0.5 text-xs font-medium text-slate-600">
                      Learn the same steps you use on production apps, with a calmer premium presentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
