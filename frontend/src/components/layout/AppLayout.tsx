/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  CheckCircle, 
  BookOpen, 
  Layers, 
  Search,
  Filter,
  Keyboard,
  Info,
  Trophy,
  Trash2,
  Eye,
  Type
} from "lucide-react";
import { wcagCriteria } from "../../data/wcag/criteria";
import AuthPanel from "../auth/AuthPanel";
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
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans ${textSpacingEnabled ? "a11y-text-spacing" : ""}`}>
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
        className="absolute top-4 left-4 z-100 bg-slate-900 text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-xl tracking-wide opacity-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-slate-900 transition-opacity"
      >
        Skip to main content
      </a>

      {/* Top Banner Landmarks */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100 focus:outline focus:outline-2 focus:outline-slate-800 focus:ring-slate-850 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close side menu" : "Open side menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Core branding */}
            <Link 
              to="/" 
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-lg"
              aria-label="A11yPlay Home Screen"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform hover:scale-105">
                A
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight block text-sm sm:text-base">
                  A11yPlay
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold block leading-none mt-0.5">
                  WCAG Learning Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Quick top bar elements */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Focus highlight trigger */}
            <button
              onClick={() => setFocusHighlightEnabled(!focusHighlightEnabled)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                focusHighlightEnabled
                  ? "bg-amber-100 border-amber-300 text-amber-900 font-black"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-105"
              }`}
              aria-pressed={focusHighlightEnabled}
              title="Toggle High Contrast Keyboard Focus Outlines (WCAG 2.4.7)"
              aria-label="Toggle High Outline Visible Focus Mode"
            >
              <Eye className="w-3.5 h-3.5 text-amber-650" />
              <span className="hidden sm:inline">Focus Guide</span>
            </button>

            {/* Space trigger */}
            <button
              onClick={() => setTextSpacingEnabled(!textSpacingEnabled)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                textSpacingEnabled
                  ? "bg-indigo-100 border-indigo-300 text-indigo-900 font-black"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-105"
              }`}
              aria-pressed={textSpacingEnabled}
              title="Toggle WCAG 1.4.12 Text Spacing Override (verify responsive flows without text truncation)"
              aria-label="Toggle Text Spacing Adaptability"
            >
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Spacing Check</span>
            </button>

            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 bg-indigo-50/50 px-2.5 py-1 rounded-md border border-indigo-100 font-bold">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Testable
            </span>
            <AuthPanel />
            <Link
              to="/"
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                location.pathname === "/" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Structural Boundary */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative">
        {/* Desktop Sidebar Landmarks */}
        <aside 
          className={`lg:w-76 lg:border-r border-slate-200 bg-white shrink-0 lg:static fixed inset-y-16 left-0 w-80 transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } transition-transform duration-200 z-20 flex flex-col overflow-y-auto max-h-[calc(100vh-4rem)] p-4 sm:p-5`}
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
                  className="absolute right-2 top-2.5 text-slate-450 text-xs hover:text-slate-700 font-bold"
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
                          ? "bg-indigo-600 text-white shadow-xs" 
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
                          ? "bg-slate-900 text-white shadow-xs" 
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
          <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl p-4 mb-6 space-y-3.5 shadow-xxs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-950 uppercase tracking-wide">
                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Overall Audit Progress</span>
              </span>
              <span className="font-mono text-xs font-black text-indigo-700 bg-white border border-indigo-100/50 px-2 py-0.5 rounded-full shadow-xxs">
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
              <div className="bg-white/90 rounded-lg p-2 border border-slate-100 text-center shadow-xxs">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Checkpoints</span>
                <span className="font-mono text-xs font-black text-slate-800">
                  {progressStats.checkedCheckpoints} <span className="text-slate-400 font-normal">/</span> {progressStats.totalCheckpoints}
                </span>
              </div>
              <div className="bg-white/90 rounded-lg p-2 border border-slate-100 text-center shadow-xxs">
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
                    ? "bg-red-650 text-white hover:bg-red-700 focus:ring-red-650"
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

              return (
                <div key={pr} className="space-y-3.5">
                  <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>{pr}</span>
                    <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      {items.length}
                    </span>
                  </h3>
                  <ul className="space-y-1">
                    {items.map((criterion) => {
                      const isActive = location.pathname === `/criterion/${criterion.id}`;

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
                            to={`/criterion/${criterion.id}`}
                            className={`group flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                              isActive
                                ? "bg-indigo-50 text-indigo-900 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                            aria-current={isActive ? "page" : undefined}
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
                              <span className="block truncate font-medium">{criterion.title}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
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
                </div>
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
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto focus:outline-none min-w-0"
        >
          {children}
        </main>
      </div>

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 A11yPlay Platform. Built for certified accessibility engineering training.</p>
          <div className="flex gap-4">
            <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              WCAG 2.2 Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
