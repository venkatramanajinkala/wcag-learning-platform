import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white">
              A
            </span>
            <span className="text-sm font-extrabold tracking-tight">A11yPlay</span>
          </Link>

          <nav aria-label="Public navigation" className="flex items-center gap-1.5 text-xs font-bold">
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `rounded-lg px-2.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `rounded-lg px-2.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              About
            </NavLink>
            <Link
              to="/login"
              className="ml-1 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3 text-xs font-extrabold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-[1100px] px-4 text-xs text-slate-500 sm:px-6">
          © 2026 A11yPlay. Accessibility-first learning.
        </div>
      </footer>
    </div>
  );
}

