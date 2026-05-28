import { Code2, LayoutGrid, Lock, Wand2 } from "lucide-react";

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
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-700">
            <LayoutGrid className="h-3.5 w-3.5" />
            Features
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Built for fast WCAG practice, not busywork.</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            A11yPlay keeps the interface calm and the learning loop tight: inspect, fix, test, and come back later with your progress intact.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-slate-900">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#0891b2_100%)] p-6 text-white shadow-sm sm:grid-cols-3">
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
