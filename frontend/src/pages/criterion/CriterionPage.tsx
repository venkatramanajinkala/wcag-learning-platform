/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  BookOpen, 
  AlertTriangle, 
  ArrowLeft, 
  Lightbulb, 
  Star, 
  Shield, 
  HelpCircle,
  CheckCircle,
  XCircle,
  ListTodo,
  AlertCircle,
  Terminal,
  FileCode,
  BookmarkCheck
} from "lucide-react";
import { wcagCriteria } from "../../data/wcag/criteria";
import ExamplePlayground from "../../components/playground/ExamplePlayground";
import { readLocalProgress, saveProgress } from "../../lib/progress";

export default function CriterionPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch matched criterion item
  const criterion = wcagCriteria.find((c) => c.id === id);

  // Maintain local state for checkboxes specific to this criterion
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const articleRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedCriterionIdRef = useRef<string | null>(null);

  // Load checklist state from localStorage on mount & when notified of updates
  useEffect(() => {
    const loadProgress = () => {
      if (criterion) {
        setCheckedItems(readLocalProgress(criterion.id));
      }
    };

    loadProgress();

    window.addEventListener("a11y-progress-update", loadProgress);
    window.addEventListener("storage", loadProgress);

    return () => {
      window.removeEventListener("a11y-progress-update", loadProgress);
      window.removeEventListener("storage", loadProgress);
    };
  }, [id, criterion]);

  useEffect(() => {
    const criterionId = criterion?.id;
    if (!criterionId || focusedCriterionIdRef.current === criterionId) return;

    const frame = window.requestAnimationFrame(() => {
      if (focusedCriterionIdRef.current === criterionId) return;
      headingRef.current?.focus();
      focusedCriterionIdRef.current = criterionId;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [criterion?.id]);

  // Toggle item in audit checklist
  const toggleAuditItem = (key: string) => {
    if (!criterion) return;
    const completed = !checkedItems[key];
    const updated = { ...checkedItems, [key]: completed };
    setCheckedItems(updated);
    saveProgress(criterion.id, key, completed);
  };

  const handleArticleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || event.shiftKey || !articleRef.current) return;

    const tabbableElements = (
      Array.from(articleRef.current.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(", "),
      )) as HTMLElement[]
    ).filter((element) => {
      const isVisible =
        element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element.getClientRects().length > 0;
      return isVisible && element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true";
    });

    const lastTabbable = tabbableElements[tabbableElements.length - 1];
    if (document.activeElement !== lastTabbable) return;

    const activeSidebarLink = document.querySelector<HTMLElement>(
      '[data-current-criterion-link="true"]',
    );
    if (!activeSidebarLink) return;

    event.preventDefault();
    activeSidebarLink.focus();
  };

  if (!criterion) {
    return (
      <div className="text-center py-12 max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">WCAG Criterion Not Found</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The requested accessibility standard ID (<span className="font-mono font-bold text-slate-800">{id}</span>) does not exist in the initial MVP list.
        </p>
        <Link 
          to="/app" 
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-4 py-2.5 rounded-lg shadow hover:bg-slate-850 focus:outline-2 focus:outline-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <article
      ref={articleRef}
      className="space-y-8"
      aria-labelledby="criterion-headline"
      onKeyDown={handleArticleKeyDown}
    >
      
      {/* Visual Navigation Breadcrumbs */}
      <nav aria-label="Breadcrumb Navigation" className="flex items-center gap-2 text-xs text-slate-450 font-bold">
        <Link to="/app" className="hover:text-indigo-600 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded">
          A11yPlay Home
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-550">WCAG Criterion {criterion.id}</span>
      </nav>

      {/* Dynamic Jumbotron Header */}
      <header className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 py-1 px-2.5 rounded-md font-mono font-extrabold tracking-wide uppercase">
            Principle {criterion.principle}
          </span>
          <span className="text-[10px] bg-indigo-600 text-white py-1 px-2.5 rounded-md font-mono font-extrabold tracking-wide uppercase shadow-xs">
            Level {criterion.level}
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 py-1 px-2.5 rounded-md font-mono font-extrabold tracking-wide uppercase">
            Success Criterion {criterion.id}
          </span>
        </div>

        <div className="space-y-2">
          <h1
            ref={headingRef}
            id="criterion-headline"
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight focus:outline-none"
          >
            WCAG {criterion.id}: {criterion.title}
          </h1>
          <p className="text-slate-600 text-sm font-medium max-w-4xl leading-relaxed">
            {criterion.summary}
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Informative Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1.5">
          {/* Objective Explainer */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Criterion Objective
            </span>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {criterion.description}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="space-y-2 bg-indigo-50/30 border border-indigo-100/40 p-4 rounded-xl">
            <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-700" />
              Why This Matters to Real Users
            </span>
            <p className="text-slate-600 text-xs leading-relaxed font-sans font-medium">
              {criterion.whyItMatters}
            </p>
          </div>
        </div>
      </header>

      {/* Interactive Playgrounds if available */}
      {criterion.examples && criterion.examples.length > 0 && (
        <section className="space-y-6" aria-label="Interactive Playgrounds">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Interactive Web Sandboxes (Identify & Rectify Failures)
          </h2>
          
          <div className="space-y-8">
            {criterion.examples.map((ex) => (
              <ExamplePlayground 
                key={ex.id} 
                example={ex} 
                criterionId={criterion.id} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Educational Compliance Workbook - Rendered for EVERY item! */}
      <section className="space-y-8" aria-label="Educational Compliance Workbook">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Standard Compliance Study Workbook & Audit Deck
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Interactive Audit Checklist and Best Practices */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold tracking-wider font-mono uppercase px-2.5 py-1 rounded-md">
                    <ListTodo className="w-3.5 h-3.5" />
                    Interactive Study Checksheet
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold font-mono">
                    {Object.values(checkedItems).filter(Boolean).length} / {Math.max((criterion.bestPractices?.length || 4), 4)} Complete
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Verify compliance for Success Criterion {criterion.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tick standard checkpoints as you audit your projects. Your progress is saved dynamically to local cache.
                  </p>
                </div>

                <ul className="space-y-3.5 pt-2">
                  {criterion.bestPractices && criterion.bestPractices.length > 0 ? (
                    criterion.bestPractices.map((practice, index) => {
                      const itemKey = `practice-${index}`;
                      const isChecked = !!checkedItems[itemKey];
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <button
                            onClick={() => toggleAuditItem(itemKey)}
                            className="mt-0.5 relative flex items-center justify-center shrink-0 w-4 h-4 rounded border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 bg-white border-slate-300 hover:border-indigo-400"
                            aria-label={`Mark as completed: ${practice}`}
                          >
                            {isChecked && (
                              <div className="absolute inset-0 bg-indigo-600 rounded-xs flex items-center justify-center text-white text-[10px] font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                          <span className={`text-xs leading-5 font-medium cursor-pointer select-none ${
                            isChecked ? "line-through text-slate-400 font-normal" : "text-slate-700"
                          }`} onClick={() => toggleAuditItem(itemKey)}>
                            {practice}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    // Default generic standard checklists for items with blank practices
                    [
                      `Analyze semantic HTML document node structures related to WCAG ${criterion.id}.`,
                      `Verify that dynamic status announcements are propagated correctly to screen reader engines.`,
                      `Verify custom visual margins are responsive and readable on viewport orientations.`,
                      `Provide alternative keyboard pathways matching standard physical gesture actions.`
                    ].map((practice, index) => {
                      const itemKey = `practice-${index}`;
                      const isChecked = !!checkedItems[itemKey];
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <button
                            onClick={() => toggleAuditItem(itemKey)}
                            className="mt-0.5 relative flex items-center justify-center shrink-0 w-4 h-4 rounded border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 bg-white border-slate-300 hover:border-indigo-400"
                            aria-label={`Mark as completed: ${practice}`}
                          >
                            {isChecked && (
                              <div className="absolute inset-0 bg-indigo-600 rounded-xs flex items-center justify-center text-white text-[10px] font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                          <span className={`text-xs leading-5 font-medium cursor-pointer select-none ${
                            isChecked ? "line-through text-slate-400 font-normal" : "text-slate-700"
                          }`} onClick={() => toggleAuditItem(itemKey)}>
                            {practice}
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              {/* Standard Testing Method instructions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold tracking-wider font-mono uppercase px-2.5 py-1 rounded-md">
                  <Terminal className="w-3.5 h-3.5" />
                  Testing Methodology & Evaluation
                </span>
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Step-by-Step Manual Auditing Instructions
                  </h3>
                  <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-600 leading-relaxed pl-1">
                    {criterion.testMethodology && criterion.testMethodology.length > 0 ? (
                      criterion.testMethodology.map((step, index) => (
                        <li key={index} className="pl-1">
                          <span className="font-medium text-slate-750">{step}</span>
                        </li>
                      ))
                    ) : (
                      // Fallback testing methods
                      [
                        "Inspect code architecture to identify target custom nodes.",
                        "Verify with developer consoles that all states are programmatically linked.",
                        "Unplug standard mice and check if tabs perform transitions naturally."
                      ].map((step, index) => (
                        <li key={index} className="pl-1">
                          <span className="font-medium text-slate-750">{step}</span>
                        </li>
                      ))
                    )}
                  </ol>
                </div>
              </div>
            </div>

            {/* Right side: Critical Failure Scenarios */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 sm:p-6 text-white space-y-5 shadow-xs">
                <div className="flex items-center gap-1 text-[10px] bg-red-950/80 border border-red-900/40 text-red-400 font-bold tracking-wider font-mono uppercase px-2 py-0.5 rounded-md self-start w-fit">
                  <XCircle className="w-3.5 h-3.5" />
                  Critical Failure Scenarios
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-extrabold text-white leading-tight">
                    Common Implementation Traps
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Avoid these standard design blockades that trigger immediate audits and failures inside WCAG diagnostics:
                  </p>
                </div>

                <ul className="space-y-4 pt-1">
                  {criterion.failureScenarios && criterion.failureScenarios.length > 0 ? (
                    criterion.failureScenarios.map((failure, index) => (
                      <li key={index} className="flex gap-2.5 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-200 leading-relaxed font-sans">
                          {failure}
                        </span>
                      </li>
                    ))
                  ) : (
                    [
                      "Hiding structural highlights and focus outlines entirely.",
                      "Exposing interactive links that are empty or vague (like 'Click Here').",
                      "Locking or forcing specific sensor properties."
                    ].map((failure, index) => (
                      <li key={index} className="flex gap-2.5 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-200 leading-relaxed font-sans">
                          {failure}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Pro Tips code helper card */}
              <div className="bg-amber-50/45 border border-amber-100 rounded-2xl p-5 shadow-xs space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 border border-amber-200 text-amber-800 font-extrabold tracking-wider font-mono uppercase px-2.5 py-1 rounded-md">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Study Pro-Tip
                </span>
                <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                  When auditing, always consult real screen reader software such as <strong>NVDA (Windows)</strong>, <strong>VoiceOver (Mac/iOS)</strong>, or <strong>TalkBack (Android)</strong>. True accessible compliance isn't just about scoring clean green on automated lighthouse calculators—it in truth means ensuring equivalent actual functional flow-rates!
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Extra Educational Resource segment */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 mt-10 space-y-3.5 shadow-xs" aria-labelledby="resources-heading">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 id="resources-heading" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Quick Study Tip: How to Audit Your Own Apps
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          To comply with WCAG {criterion.id}, try unplugging your mouse entirely. Can you navigate and perform every action on your template using only the <kbd className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono">TAB</kbd>, <kbd className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono">ENTER</kbd>, and <kbd className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono">SPACEBAR</kbd> keys? If focus disappears, or an alert pops up that you cannot dismiss, your site has accessible blockades!
        </p>
      </section>

    </article>
  );
}
