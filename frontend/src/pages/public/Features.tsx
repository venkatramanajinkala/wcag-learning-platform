import { Code, Lock, Wand2 } from "lucide-react";

const items = [
  {
    icon: Wand2,
    title: "Interactive sandboxes",
    body: "Switch between bad and good code, tweak HTML, and learn what scanners and assistive tech see.",
  },
  {
    icon: Lock,
    title: "Account-backed progress",
    body: "Progress, submissions, and resets are tied to your login. No more losing work across devices.",
  },
  {
    icon: Code,
    title: "Practical tooling",
    body: "Focus guide and spacing checks help you validate real UI behavior without guesswork.",
  },
];

export default function Features() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Features</h1>
        <p className="text-sm font-medium text-slate-600">A11yPlay is designed for repeatable, real-world learning.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <item.icon className="h-5 w-5 text-indigo-600" />
            <h2 className="mt-3 text-sm font-extrabold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

