import { Code2, LayoutGrid, Lock, Wand2 } from "lucide-react";
import Reveal from "../../components/ui/Reveal";

const items = [
  {
    icon: Wand2,
    title: "Interactive sandboxes",
    body: "Switch between bad and good code, tweak HTML, and learn what scanners and assistive tech see.",
  },
  {
    icon: Lock,
    title: "Account-backed progress",
    body: "Progress, submissions, and resets are tied to your login so nothing gets lost between sessions.",
  },
  {
    icon: Code2,
    title: "Practical tooling",
    body: "Focus guide, spacing checks, and audit helpers let you validate real UI behavior without guesswork.",
  },
];

export default function Features() {
  return (
    <div className="space-y-10">
      <section className="theme-hero rounded-[32px] p-6 sm:p-8">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <Reveal className="max-w-2xl space-y-4" delay={0.05}>
            <div className="premium-pill relative">
              <LayoutGrid className="h-3.5 w-3.5" />
              Features
            </div>
            <h1 className="relative text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Built for fast WCAG practice, not busywork.</h1>
            <p className="relative max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              A11yPlay keeps the interface calm and the learning loop tight: inspect, fix, test, and come back later with your progress intact.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="premium-card rounded-[24px] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Layered</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Depth without clutter.</p>
            </div>
            <div className="premium-card rounded-[24px] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Subtle</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Motion only where it helps.</p>
            </div>
            <div className="premium-card rounded-[24px] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Readable</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">High contrast and clear hierarchy.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Reveal delay={0.08}>
            <article className="premium-card rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#4f46e5_100%)] text-white shadow-lg shadow-slate-950/15">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-extrabold text-slate-950">{item.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="grid gap-4 rounded-[32px] border border-slate-900/10 bg-[linear-gradient(135deg,#020617_0%,#1e293b_44%,#334155_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:grid-cols-3 sm:p-8">
        <div>
          <p className="text-3xl font-black">66</p>
          <p className="mt-1 text-sm text-slate-300">WCAG criteria in the learning dataset</p>
        </div>
        <div>
          <p className="text-3xl font-black">1</p>
          <p className="mt-1 text-sm text-slate-300">Assistant that explains accessibility in plain language</p>
        </div>
        <div>
          <p className="text-3xl font-black">3</p>
          <p className="mt-1 text-sm text-slate-300">Practice modes: learn, audit, and ask the assistant</p>
        </div>
      </section>
    </div>
  );
}
