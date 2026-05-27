import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Learn WCAG by doing
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            A modern WCAG learning platform built for real audits.
          </h1>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            Practice success criteria with interactive sandboxes, progress tracking, and accessibility tools that build muscle memory.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-xs font-extrabold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-extrabold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50 p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-extrabold text-slate-900">Protected learning workspace</p>
                <p className="mt-0.5 text-xs font-medium text-slate-600">
                  Keep your progress, submissions, and tools tied to your account.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-extrabold text-slate-900">Track real audit checkpoints</p>
                <p className="mt-0.5 text-xs font-medium text-slate-600">
                  Learn the same steps you use on production apps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

