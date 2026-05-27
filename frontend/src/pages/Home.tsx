/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Settings, 
  Layers, 
  HelpCircle, 
  CheckSquare, 
  ShieldCheck, 
  Terminal, 
  Play, 
  Sparkles,
  ArrowRight,
  Sparkle
} from "lucide-react";
import { wcagCriteria } from "../data/wcag/criteria";
import { readLocalProgress } from "../lib/progress";
import { isBackendConfigured, scanHtml } from "../lib/api";

export default function Home() {
  // Listen to progress updates to live-render progress ratios on each card
  const [progressTrigger, setProgressTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setProgressTrigger((prev) => prev + 1);
    };
    window.addEventListener("a11y-progress-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("a11y-progress-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Custom sandbox editor code
  const [customCode, setCustomCode] = useState(`<div class="p-6 bg-slate-50 border border-slate-200 rounded-xl">
  <!-- Paste your HTML code here to run a real-time accessibility check! -->
  <h2 class="text-lg font-bold text-slate-900 mb-2">User Feedback Form</h2>
  
  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150" class="w-12 h-12 rounded mb-3">
  
  <label class="block text-xs font-semibold mb-1">Your Name</label>
  <input type="text" class="w-full p-2 border border-slate-300 rounded mb-2">
  
  <button class="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800">
    Submit Feedback
  </button>
</div>`);
  
  const [sandboxReport, setSandboxReport] = useState<string[]>([
    "ℹ Diagnostic: Paste your code and hit Scan to verify elements."
  ]);
  const [sandboxPassed, setSandboxPassed] = useState<boolean | null>(null);

  // Quick state tracker for mini checkbox goals
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Provide alt text for all informative visual assets", done: false },
    { id: 2, text: "Link form controls strictly with explicit <label for='...'> parameters", done: false },
    { id: 3, text: "Ensure all custom button-like configurations use real <button> tags or define tabIndex='0'", done: false },
    { id: 4, text: "Never set positive indexes like tabindex='1' that hijack natural tab paths", done: false },
    { id: 5, text: "Never suppress the default focus outline ring without creating a crisp alternative", done: false },
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // Run Custom Playground Scanner
  const handleScanCustomCode = async () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(customCode, "text/html");
    const reports: string[] = [];
    let isFine = true;

    // Scan images
    const imgs = doc.querySelectorAll("img");
    imgs.forEach((img, idx) => {
      const alt = img.getAttribute("alt");
      if (alt === null) {
        isFine = false;
        reports.push(`❌ Alt attribute missing on image [src: "${img.getAttribute("src")?.substring(0, 30) || "unlabeled"}..."]`);
      } else if (alt.trim() === "") {
        reports.push(`⚠️ Decorative Image alert: Image ${idx + 1} uses an empty alt (alt=""), which silences screen readers.`);
      } else {
        reports.push(`✔ Accessible Asset: Image alt description is set: "${alt}"`);
      }
    });

    // Scan labels
    const inputs = doc.querySelectorAll("input, select, textarea");
    inputs.forEach((input, idx) => {
      const idVal = input.getAttribute("id");
      if (!idVal) {
        isFine = false;
        reports.push(`❌ Missing ID: Input field ${idx + 1} has no 'id' attribute, making label relational binding impossible.`);
        return;
      }
      const label = doc.querySelector(`label[for="${idVal}"]`);
      if (!label && !input.hasAttribute("aria-label")) {
        isFine = false;
        reports.push(`❌ Broken Association: Focusable input with ID "${idVal}" lacks any matching label or 'aria-label'.`);
      } else {
        reports.push(`✔ Semantic Form Control: Input "${idVal}" is labeled.`);
      }
    });

    // Scan tabindex
    const tabIndices = doc.querySelectorAll("[tabindex]");
    tabIndices.forEach((el) => {
      const val = parseInt(el.getAttribute("tabindex") || "0");
      if (val > 0) {
        isFine = false;
        reports.push(`❌ Dangerous Code: Detected tabindex="${val}". Custom focus ordering overrides logical tab sequences!`);
      }
    });

    // Scan buttons
    const buttons = doc.querySelectorAll("button");
    buttons.forEach((btn, idx) => {
      const label = btn.getAttribute("aria-label");
      const text = btn.textContent?.trim();
      if (!label && (!text || text.length === 0)) {
        isFine = false;
        reports.push(`❌ Silent Button: Button ${idx + 1} contains no text inside and has no aria-label.`);
      }
    });

    // Focus outline
    if (customCode.includes("outline-none") || customCode.includes("focus:outline-none")) {
      isFine = false;
      reports.push("❌ Barrier: Code uses 'outline-none' or 'focus:outline-none'. Ensure an alternative visible focus ring is provided.");
    }

    if (reports.length === 0) {
      reports.push("✔ No basic accessibility barriers found in this snippet code! Excellent job.");
    }

    if (isBackendConfigured()) {
      try {
        const remoteReport = await scanHtml(customCode, undefined, true);
        setSandboxReport(remoteReport.details);
        setSandboxPassed(remoteReport.passed);
        return;
      } catch (error) {
        console.warn("Backend scan failed; using browser scan fallback.", error);
      }
    }

    setSandboxReport(reports);
    setSandboxPassed(isFine);
  };

  // Group items by level
  const levelA = wcagCriteria.filter(c => c.level === "A");
  const levelAA = wcagCriteria.filter(c => c.level === "AA");
  const levelAAA = wcagCriteria.filter(c => c.level === "AAA");

  return (
    <div className="space-y-12">
      
      {/* Welcome Banner */}
      <section className="bg-white border border-slate-200 text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xs relative overflow-hidden" aria-labelledby="welcome-title">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Accessible Code
          </div>
          <h1 id="welcome-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900">
            Learn Accessibility, <br />
            By breaking it first.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
            Welcome to A11yPlay, the WCAG compliance study deck. Instead of dry theoretical manuals, we present you with real interactive codeplay blockades. Toggle between 'Bad' and 'Good' examples, modify the DOM in real-time, inspect automated scan feedback, and build muscle memory for semantic accessible engineering.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a 
              href="#coursework-bento" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-extrabold text-xs px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-xs"
            >
              Start Learning Path
              <ArrowRight className="w-4 h-4 font-extrabold" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Course bento grid */}
      <section id="coursework-bento" className="space-y-6" aria-labelledby="coursework-title">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-200 pb-3.5">
          <div>
            <h2 id="coursework-title" className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              WCAG Success Criterion Curriculum
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select a success criterion node to play inside its dedicated sandbox.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold">
            <span className="text-blue-600 flex items-center gap-1">
              <span className="w-2 rounded-full h-2 bg-blue-600 inline-block"></span>
              Level A ({levelA.length} Units)
            </span>
            <span className="text-indigo-650 flex items-center gap-1">
              <span className="w-2 rounded-full h-2 bg-indigo-600 inline-block"></span>
              Level AA ({levelAA.length} Units)
            </span>
            <span className="text-purple-600 flex items-center gap-1">
              <span className="w-2 rounded-full h-2 bg-purple-600 inline-block"></span>
              Level AAA ({levelAAA.length} Units)
            </span>
          </div>
        </div>

        {/* Bento Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {wcagCriteria.map((criterion) => {
            // Calculate progress stats for this specific card
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
              <div 
                key={criterion.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {/* SC Number badge */}
                    <span className="font-mono text-xs font-bold leading-none px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      SC {criterion.id}
                    </span>
                    
                    {/* Completed / Progress badges */}
                    {checkedCount > 0 ? (
                      <span className={`text-[10px] font-extrabold uppercase font-mono tracking-wider py-0.5 px-2.5 rounded-md ${
                        isCompleted 
                          ? "text-emerald-850 bg-emerald-50 border border-emerald-100" 
                          : "text-indigo-850 bg-indigo-50 border border-indigo-150"
                      }`}>
                        {isCompleted ? "✓ Done" : `${checkedCount}/${bestPracticesCount} Checked`}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold uppercase font-mono tracking-wider py-0.5 px-2.5 rounded-md ${
                        criterion.level === "A" 
                          ? "text-blue-700 bg-blue-50" 
                          : "text-indigo-700 bg-indigo-50"
                      }`}>
                        Level {criterion.level}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-650 transition-colors">
                      {criterion.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono">
                        Principle {criterion.principle}
                      </span>
                      {checkedCount > 0 && !isCompleted && (
                        <span className="text-[9px] font-mono text-slate-400 animate-pulse">
                          ({Math.round((checkedCount / bestPracticesCount) * 100)}% complete)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {criterion.summary}
                  </p>
                </div>

                {/* Action route button links */}
                <Link
                  to={`/app/criterion/${criterion.id}`}
                  className={`w-full text-center inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                    criterion.examples && criterion.examples.length > 0
                      ? isCompleted
                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white focus:ring-emerald-600"
                        : "text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white focus:ring-indigo-600"
                      : isCompleted
                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-800 hover:text-white focus:ring-emerald-800"
                        : "text-slate-700 bg-slate-100 hover:bg-slate-800 hover:text-white focus:ring-slate-850"
                  }`}
                  aria-label={`Enter educational study guides for Success Criterion ${criterion.id}: ${criterion.title}`}
                >
                  {criterion.examples && criterion.examples.length > 0 ? "Launch Sandbox Module" : "Open Study Checklist"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive custom validation block (W3Schools TryIt / Sandbox checker style!) */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-6 space-y-5 shadow-xs" aria-labelledby="custom-inspector-heading">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold tracking-wider font-mono uppercase px-2.5 py-1 rounded-md">
              <Terminal className="w-3.5 h-3.5" />
              Interactive Scanner Tool
            </span>
            <h2 id="custom-inspector-heading" className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-2.5">
              Custom Accessibility Code Auditor (Verify Your Own Code)
            </h2>
            <p className="text-xs text-slate-500">Paste raw HTML below to scan for alt, label form elements, and tabindex traps.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Custom Editor Area */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-t-lg text-[10px] font-mono text-slate-400">
              <span className="font-bold">Write or paste custom HTML:</span>
              <span className="text-slate-500 text-[9px]">Check live a11y parameters</span>
            </div>
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full flex-1 min-h-[220px] p-3 font-mono text-xs bg-slate-950 text-slate-200 rounded-b-lg border-0 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              placeholder="Paste HTML here..."
              spellCheck="false"
              aria-label="Editor area for custom accessibility checker code"
            />
            <button
              onClick={handleScanCustomCode}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Scan Code & Evaluate Report
            </button>
          </div>

          {/* Diagnostic outputs and preview */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50 flex-1 flex flex-col justify-between min-h-[200px]">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  AUTOMATED SCAN LOGS
                </span>
                
                <ul className="space-y-2 py-1.5">
                  {sandboxReport.map((rep, idx) => (
                    <li 
                      key={idx} 
                      className={`text-xs font-semibold font-sans flex items-start gap-1.5 leading-relaxed ${
                        rep.startsWith("❌") 
                          ? "text-red-700 font-bold" 
                          : rep.startsWith("⚠️") 
                            ? "text-amber-700 font-bold" 
                            : rep.startsWith("✔") 
                              ? "text-emerald-700 font-bold" 
                              : "text-slate-500"
                      }`}
                    >
                      <span className="shrink-0">•</span>
                      <span>{rep}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {sandboxPassed !== null && (
                <div className={`mt-4 p-3 rounded-lg text-xs font-bold font-sans text-center border ${
                  sandboxPassed 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                    : "bg-red-50 text-red-800 border-red-150"
                }`}>
                  {sandboxPassed 
                    ? "🎉 CONGRATULATIONS: No accessibility barriers discovered! Pass compliant score." 
                    : "⚠️ AUDIT ALERTS: Correct the specified critical errors before applying this template to production!"}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mini interactive checklist card */}
      <section className="bg-indigo-950 text-white border border-indigo-900 p-6 sm:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs" aria-labelledby="checklist-heading">
        <div className="md:col-span-1 space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-900 border border-indigo-800 text-indigo-100 text-[10px] font-bold font-mono uppercase">
            <CheckSquare className="w-3.5 h-3.5" />
            Checklist Task
          </span>
          <h2 id="checklist-heading" className="text-lg font-extrabold tracking-tight mt-1 text-white">
            Build Muscle Memory!
          </h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-sans">
            Make keyboard compliance second nature. Complete this diagnostic check sheet when designing form components. Tick the boxes as you audit your projects.
          </p>
        </div>
        
        <div className="md:col-span-2 bg-indigo-900/40 border border-indigo-800/80 p-5 rounded-xl space-y-3">
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <input
                  id={`check-item-${item.id}`}
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 bg-white border border-indigo-700 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <label 
                  htmlFor={`check-item-${item.id}`}
                  className={`text-xs font-bold cursor-pointer select-none leading-5 ${
                    item.done ? "line-through text-indigo-400" : "text-indigo-100/90"
                  }`}
                >
                  {item.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  );
}
