import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Menu, Sparkles, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "../../components/theme/ThemeToggle";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  const publicLinks = [
    { to: "/features", label: "Features" },
    { to: "/about", label: "About" },
  ];

  return (
    <div className="app-shell min-h-screen min-w-0 text-slate-900">
      <header className="theme-header sticky top-0 z-30">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#4338ca_100%)] text-sm font-black text-white shadow-lg shadow-slate-950/15">
              A
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-tight text-slate-950">A11yPlay</span>
              <span className="hidden text-[11px] font-semibold text-slate-500 sm:block">Premium WCAG learning platform</span>
            </span>
          </Link>

          <nav aria-label="Public navigation" className="hidden min-w-0 items-center justify-end gap-2 text-xs font-bold lg:flex">
            {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `topbar-button ${
                    isActive ? "topbar-button-primary" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="topbar-button topbar-button-primary"
            >
              Sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </nav>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex min-h-10 items-center justify-center rounded-xl p-2.5 text-slate-700 transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:hidden"
            aria-label={menuOpen ? "Close public navigation menu" : "Open public navigation menu"}
            aria-controls="public-mobile-navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div
            ref={menuRef}
            id="public-mobile-navigation"
            className="theme-header-panel px-4 py-3 lg:hidden"
          >
            <nav aria-label="Public mobile navigation" className="mx-auto flex max-w-6xl flex-col gap-2 text-sm font-bold">
              {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                    `topbar-button w-full justify-start ${
                      isActive ? "topbar-button-primary" : ""
                    }`
                }
              >
                {item.label}
              </NavLink>
              ))}
              <Link
                to="/login"
                className="topbar-button topbar-button-primary w-full"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="pt-1">
                <ThemeToggle className="w-full justify-start" />
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>

      <footer className="border-t border-white/70 bg-slate-950/95 text-slate-200 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-lg shadow-black/20">
                  A
                </span>
                <div>
                  <p className="text-sm font-black text-white">A11yPlay</p>
                  <p className="text-[11px] font-semibold text-slate-400">Accessibility-first learning</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Practice WCAG with interactive lessons, protected progress, and a built-in AI assistant that speaks like a mentor.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  WCAG practice
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  Progress tracking
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-300">
                  AI assistance
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Explore</p>
              <div className="space-y-2 text-sm font-semibold text-slate-200">
                <Link to="/features" className="block transition hover:text-white">
                  Features
                </Link>
                <Link to="/about" className="block transition hover:text-white">
                  About
                </Link>
                <Link to="/login" className="block transition hover:text-white">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Built for</p>
              <div className="space-y-3 text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  WCAG practice
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Real audit workflows
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex min-w-0 flex-col gap-3 border-t border-slate-800 pt-5 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p>Copyright 2026 A11yPlay. Built for accessibility training.</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                WCAG 2.2 Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 font-semibold text-slate-300">
                Learning workspace
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
