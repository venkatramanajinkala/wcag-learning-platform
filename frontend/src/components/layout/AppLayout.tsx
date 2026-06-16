/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ReactNode, MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Layers, 
  Search,
  Filter,
  Info,
  Trophy,
  Trash2
} from "lucide-react";
import { wcagCriteria } from "../../data/wcag/criteria";
import AccessibilityWidget from "./AccessibilityWidget";
import AuthPanel from "../auth/AuthPanel";
import ChatWidget from "../chat/ChatWidget";
import ThemeToggle from "../theme/ThemeToggle";
import { readLocalProgress } from "../../lib/progress";
import { getStoredToken, isBackendConfigured, resetRemoteProgress } from "../../lib/api";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedVersion, setSelectedVersion] = useState<string>("ALL");
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>("ALL");
  const location = useLocation();

  const [progressTrigger, setProgressTrigger] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Advanced accessibility helper simulators
  const [textSpacingEnabled, setTextSpacingEnabled] = useState(false);
  const [focusHighlightEnabled, setFocusHighlightEnabled] = useState(false);

  // Close mobile sidebar on route modification
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Listen to local progress updates
  useEffect(() => {
    const handleUpdate = () => {
      setProgressTrigger(prev => prev + 1);
    };

    window.addEventListener("a11y-progress-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("a11y-progress-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Soft timeout to dismiss reset confirmation trigger
  useEffect(() => {
    if (resetConfirm) {
      const timer = setTimeout(() => {
        setResetConfirm(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [resetConfirm]);

  // Compute global progress metrics
  const progressStats = useMemo(() => {
    let totalCheckpoints = 0;
    let checkedCheckpoints = 0;
    let completedCriteriaCount = 0;
    const totalCriteriaCount = wcagCriteria.length;

    wcagCriteria.forEach((criterion) => {
      const bestPracticesCount = criterion.bestPractices?.length || 4;
      totalCheckpoints += bestPracticesCount;

      const parsed = readLocalProgress(criterion.id);

      let criterionCheckedCount = 0;
      for (let i = 0; i < bestPracticesCount; i++) {
        if (parsed[`practice-${i}`]) {
          checkedCheckpoints++;
          criterionCheckedCount++;
        }
      }

      if (criterionCheckedCount === bestPracticesCount) {
        completedCriteriaCount++;
      }
    });

    const percentComplete = totalCheckpoints > 0 
      ? Math.round((checkedCheckpoints / totalCheckpoints) * 100) 
      : 0;

    return {
      totalCheckpoints,
      checkedCheckpoints,
      completedCriteriaCount,
      totalCriteriaCount,
      percentComplete
    };
  }, [progressTrigger, location.pathname]);

  const handleResetAllProgress = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }

    wcagCriteria.forEach((criterion) => {
      localStorage.removeItem(`a11y-audit-${criterion.id}`);
    });
    setResetConfirm(false);

    if (isBackendConfigured() && getStoredToken()) {
      resetRemoteProgress().catch((error) => {
        console.warn("Remote progress reset failed; local progress was cleared.", error);
      });
    }

    // Notify all listeners
    window.dispatchEvent(new Event("a11y-progress-update"));
  };

  const handleSkipToMain = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("main-content");
    main?.focus();
    main?.scrollIntoView({ block: "start" });
  };

  // Filters candidates
  const filteredCriteria = wcagCriteria.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.id.includes(searchQuery) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === "ALL" ? true : item.level === selectedLevel;
    const matchesPrinciple = selectedPrinciple === "ALL" ? true : item.principle === selectedPrinciple;
    const matchesVersion = selectedVersion === "ALL" ? true : item.version === selectedVersion;

    return matchesSearch && matchesLevel && matchesPrinciple && matchesVersion;
  });

  // Group filtered criteria by their accessibility Principle - Includes Robust!
  const principles = ["Perceivable", "Operable", "Understandable", "Robust"];

  return (
    <div className={`app-shell min-h-screen min-w-0 flex flex-col overflow-x-clip text-slate-800 font-sans ${textSpacingEnabled ? "a11y-text-spacing" : ""}`}>
      {textSpacingEnabled && (
        <style dangerouslySetInnerHTML={{ __html: `
          .a11y-text-spacing *, 
          .a11y-text-spacing p, 
          .a11y-text-spacing span, 
          .a11y-text-spacing h1, 
          .a11y-text-spacing h2, 
          .a11y-text-spacing h3, 
          .a11y-text-spacing a, 
          .a11y-text-spacing button, 
          .a11y-text-spacing li {
            line-height: 1.625 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }
          .a11y-text-spacing p, 
          .a11y-text-spacing h1, 
          .a11y-text-spacing h2, 
          .a11y-text-spacing h3 {
            margin-bottom: 1.5em !important;
          }
        `}} />
      )}
      {focusHighlightEnabled && (
        <style dangerouslySetInnerHTML={{ __html: `
          *:focus, *:focus-visible {
            outline: 4px solid #f59e0b !important;
            outline-offset: 3.5px !important;
            box-shadow: 0 0 0 6px #ec4899 !important;
          }
        `}} />
      )}
      {/* WCAG 2.4.1 Skip Link: Critical keyboard accessibility requirement */}
      <a 
        href="#main-content" 
        onClick={handleSkipToMain}
        className="absolute left-4 top-4 z-[100] rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold tracking-wide text-white opacity-0 shadow-xl shadow-slate-950/20 transition-opacity focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-slate-900"
      >
        Skip to main content
      </a>

      {/* Top Banner Landmarks */}
      <header className="theme-header sticky top-0 z-30">
        <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl p-2.5 text-slate-600 transition hover:bg-white/80 focus:outline focus:outline-2 focus:outline-slate-800 focus:ring-slate-850 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close side menu" : "Open side menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Core branding */}
            <Link 
              to="/app" 
              className="flex min-w-0 items-center gap-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              aria-label="A11yPlay Home Screen"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#4338ca_100%)] text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition-transform hover:scale-105">
                A
              </div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-black tracking-tight text-slate-950 sm:text-base">
                  A11yPlay
                </span>
                <span className="mt-0.5 hidden truncate text-[10px] font-bold leading-none text-slate-500 sm:block">
                  Premium WCAG Learning Platform
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <nav aria-label="Primary navigation" className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
              <AccessibilityWidget
                focusGuideEnabled={focusHighlightEnabled}
                textSpacingEnabled={textSpacingEnabled}
                onToggleFocusGuide={() => setFocusHighlightEnabled((value) => !value)}
                onToggleTextSpacing={() => setTextSpacingEnabled((value) => !value)}
              />
              <ThemeToggle />
              {(() => {
                const isActive = location.pathname === "/app" || location.pathname.startsWith("/app/");
                return (
                  <Link
                    to="/app"
                    className={`topbar-button ${
                      isActive ? "topbar-button-primary" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                Dashboard
                  </Link>
                );
              })()}
              <AuthPanel />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Structural Boundary */}
      <div className="relative mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col lg:flex-row">
        {/* Desktop Sidebar Landmarks */}
        <aside 
          className={`lg:w-76 lg:border-r border-white/70 bg-white/75 backdrop-blur-xl shrink-0 lg:static fixed inset-y-16 left-0 w-[min(20rem,calc(100vw-1rem))] transform shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } transition-transform duration-200 z-20 flex max-w-full flex-col overflow-y-auto max-h-[calc(100vh-4rem)] p-4 sm:p-5`}
          aria-label="Criteria Directory"
        >
          {/* Quick filter block */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search WCAG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                aria-label="Search criteria list"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-2 top-2.5 text-slate-500 text-xs font-bold hover:text-slate-700"
                  aria-label="Clear searchQuery"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick badges category selections */}
            <div className="space-y-4">
              {/* Level Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Filter className="w-3 h-3 text-indigo-600" />
                  <span>Level Filter</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["ALL", "A", "AA", "AAA"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                        selectedLevel === lvl 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {lvl === "ALL" ? "All Levels" : `Level ${lvl}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Version Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-indigo-600" />
                  <span>WCAG Version</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["ALL", "2.0", "2.1", "2.2"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVersion(v)}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded-md cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                        selectedVersion === v 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {v === "ALL" ? "All Specs" : `v${v}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-5" />

          {/* Overall Audit Progress Widget */}
          <div className="premium-surface-strong rounded-[24px] p-4 mb-6 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-extrabold text-indigo-950 uppercase tracking-wide">
                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Overall Audit Progress</span>
              </span>
              <span className="shrink-0 rounded-full border border-indigo-100/50 bg-white px-2 py-0.5 font-mono text-xs font-black text-indigo-700 shadow-sm">
                {progressStats.percentComplete}%
              </span>
            </div>

            {/* Progress bar wrapper */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressStats.percentComplete}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="rounded-lg border border-slate-100 bg-white/90 p-2 text-center shadow-sm">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Checkpoints</span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {progressStats.checkedCheckpoints} <span className="text-slate-400 font-normal">/</span> {progressStats.totalCheckpoints}
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white/90 p-2 text-center shadow-sm">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Standards</span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {progressStats.completedCriteriaCount} <span className="text-slate-400 font-normal">/</span> {progressStats.totalCriteriaCount}
                </span>
              </div>
            </div>

            {progressStats.checkedCheckpoints > 0 && (
              <button
                onClick={handleResetAllProgress}
                className={`w-full text-center inline-flex items-center justify-center gap-1.5 text-[10px] font-black py-1.5 px-2.5 rounded-lg transition-all focus:outline-none focus:ring-1 cursor-pointer ${
                  resetConfirm 
                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                    : "text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 focus:ring-red-500"
                }`}
                aria-label="Reset study checksheet data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {resetConfirm ? "Click Again to Confirm Reset" : "Reset Audit Progress"}
              </button>
            )}
          </div>

          <hr className="border-slate-100 mb-5" />

          {/* Grouped Criteria Accordion/List Navigation */}
          <nav aria-label="Secondary Sidebar Navigation" className="flex-1 space-y-6">
            {principles.map((pr) => {
              const items = filteredCriteria.filter(c => c.principle === pr);
              if (items.length === 0) return null;
              const principleId = `sidebar-principle-${pr.toLowerCase()}`;
              const principleDescriptionId = `${principleId}-description`;

              return (
                <section
                  key={pr}
                  className="space-y-3.5"
                  aria-labelledby={principleId}
                >
                  <h2
                    id={principleId}
                    className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 pb-1 border-b border-slate-100 flex items-center justify-between"
                  >
                    <span>{pr}</span>
                    <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      {items.length}
                    </span>
                  </h2>
                  <p id={principleDescriptionId} className="sr-only">
                    Belongs to the WCAG {pr} principle.
                  </p>
                  <ul className="space-y-1" aria-labelledby={principleId}>
                    {items.map((criterion) => {
                      const isActive = location.pathname === `/app/criterion/${criterion.id}`;

                      // Calculate checked count for this specific criterion dynamically
                      const parsed = readLocalProgress(criterion.id);
                      const bestPracticesCount = criterion.bestPractices?.length || 4;
                      let checkedCount = 0;
                      for (let i = 0; i < bestPracticesCount; i++) {
                        if (parsed[`practice-${i}`]) {
                          checkedCount++;
                        }
                      }
                      const isCompleted = checkedCount === bestPracticesCount;

                      return (
                        <li key={criterion.id}>
                          <Link
                            to={`/app/criterion/${criterion.id}`}
                            data-current-criterion-link={isActive ? "true" : undefined}
                            className={`group flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                              isActive
                                ? "bg-indigo-50 text-indigo-900 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                            aria-describedby={principleDescriptionId}
                          >
                            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 font-bold tracking-tight transition-colors ${
                              isCompleted
                                ? "bg-emerald-600 text-white font-mono"
                                : isActive
                                  ? "bg-indigo-200 text-indigo-900"
                                  : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                            }`}>
                              {isCompleted ? "✓" : criterion.id}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="block font-medium leading-5">
                                {criterion.title}
                                <span className="sr-only">, {pr} principle</span>
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className={`inline-block text-[9px] font-bold ${
                                  criterion.level === "A" ? "text-blue-600" : "text-indigo-600"
                                }`}>
                                  Level {criterion.level}
                                </span>
                                {checkedCount > 0 && (
                                  <span className={`text-[9px] font-bold font-mono px-1 rounded-sm ${
                                    isCompleted 
                                      ? "bg-emerald-100 text-emerald-800" 
                                      : "bg-indigo-100 text-indigo-800"
                                  }`}>
                                    {checkedCount}/{bestPracticesCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            {filteredCriteria.length === 0 && (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Info className="w-5 h-5 mx-auto" />
                <p className="text-xs">No criteria match your current filter query.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLevel("ALL");
                    setSelectedPrinciple("ALL");
                    setSelectedVersion("ALL");
                  }}
                  className="text-xs font-semibold text-slate-900 underline mt-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded"
                >
                  Reset filters
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Backdrop for mobile hamburger menu */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/30 z-15 backdrop-blur-xs top-16"
            aria-hidden="true"
          />
        )}

        {/* Main Workspace Frame */}
        <main 
          id="main-content" 
          tabIndex={-1} 
          className="min-w-0 flex-1 overflow-y-auto p-3 focus:outline-none sm:p-5 lg:p-8"
        >
          {children}
        </main>
      </div>

      <footer className="border-t border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">A11yPlay Platform</p>
            <p>Accessibility-first learning, progress tracking, and audit practice in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end md:pr-20">
              <span className="footer-status-pill footer-status-pill-success">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              WCAG 2.2 Compliant
            </span>
              <span className="footer-status-pill footer-status-pill-neutral">
              Learning workspace
            </span>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}


