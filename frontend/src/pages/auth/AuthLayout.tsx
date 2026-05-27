import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white">
              A
            </span>
            <span className="text-sm font-extrabold tracking-tight">A11yPlay</span>
          </Link>
          <Link
            to="/features"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-lg px-2 py-2"
          >
            Features
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1100px] place-items-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

