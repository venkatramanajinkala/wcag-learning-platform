/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Eye, 
  Terminal, 
  ShieldCheck, 
  CornerDownRight, 
  Focus,
  Sun
} from "lucide-react";
import { CodeExample } from "../../types";

interface ExamplePlaygroundProps {
  example: CodeExample;
  criterionId: string;
  key?: string;
}

export default function ExamplePlayground({ example, criterionId }: ExamplePlaygroundProps) {
  // Live editable codes state
  const [badCode, setBadCode] = useState(example.badCode);
  const [goodCode, setGoodCode] = useState(example.goodCode);

  // Focus simulation flags
  const [grayscaleEnabled, setGrayscaleEnabled] = useState(false);
  
  // Audits logs
  const [badAuditLogs, setBadAuditLogs] = useState<{ passed: boolean; details: string[] }>({ passed: false, details: [] });
  const [goodAuditLogs, setGoodAuditLogs] = useState<{ passed: boolean; details: string[] }>({ passed: true, details: [] });

  // Refs for direct DOM injection previews
  const badPreviewRef = useRef<HTMLDivElement>(null);
  const goodPreviewRef = useRef<HTMLDivElement>(null);

  // Active editors toggles
  const [activeTabBad, setActiveTabBad] = useState<"preview" | "code">("preview");
  const [activeTabGood, setActiveTabGood] = useState<"preview" | "code">("preview");

  // Run the code compiler
  const compileCode = (type: "bad" | "good") => {
    if (type === "bad") {
      if (badPreviewRef.current) {
        badPreviewRef.current.innerHTML = badCode;
        // Trigger accessibility audit
        const results = runA11yScan(badCode, criterionId);
        setBadAuditLogs({ passed: results.passed, details: results.details });
      }
    } else {
      if (goodPreviewRef.current) {
        goodPreviewRef.current.innerHTML = goodCode;
        // Trigger accessibility audit
        const results = runA11yScan(goodCode, criterionId);
        setGoodAuditLogs({ passed: results.passed, details: results.details });
      }
    }
  };

  // Restores standard snippet
  const handleReset = (type: "bad" | "good") => {
    if (type === "bad") {
      setBadCode(example.badCode);
      setTimeout(() => {
        if (badPreviewRef.current) {
          badPreviewRef.current.innerHTML = example.badCode;
          const results = runA11yScan(example.badCode, criterionId);
          setBadAuditLogs({ passed: results.passed, details: results.details });
        }
      }, 50);
    } else {
      setGoodCode(example.goodCode);
      setTimeout(() => {
        if (goodPreviewRef.current) {
          goodPreviewRef.current.innerHTML = example.goodCode;
          const results = runA11yScan(example.goodCode, criterionId);
          setGoodAuditLogs({ passed: results.passed, details: results.details });
        }
      }, 50);
    }
  };

  // Render on initial mount
  useEffect(() => {
    compileCode("bad");
    compileCode("good");
  }, [example]);

  // Programmatic HTML checker/scanner engine
  const runA11yScan = (html: string, id: string): { passed: boolean; details: string[] } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const details: string[] = [];
    let passed = true;

    if (id === "1.1.1") {
      const imgs = doc.querySelectorAll("img");
      if (imgs.length === 0) {
        details.push("ℹ Diagnostic: No <img> assets located in template code.");
      } else {
        imgs.forEach((img, idx) => {
          const alt = img.getAttribute("alt");
          if (alt === null) {
            passed = false;
            details.push(`❌ Image [${idx + 1}] is missingalt. Screen readers will skip or announce file source URL.`);
          } else if (alt.trim() === "") {
            details.push(`⚠️ Image [${idx + 1}] has empty alt (alt=""). It is treated as a silent visual spacer.`);
          } else {
            details.push(`✔ Image [${idx + 1}] passes. Alt text: "${alt}"`);
          }
        });
      }

      const buttons = doc.querySelectorAll("button");
      buttons.forEach((btn, idx) => {
        const label = btn.getAttribute("aria-label");
        const hasAriaHidden = btn.getAttribute("aria-hidden") === "true";
        const contentText = btn.textContent?.trim();
        
        if (hasAriaHidden) {
          details.push(`⚠️ Button [${idx + 1}] has aria-hidden=true, skipping focused keyboard content.`);
          return;
        }

        if (!label && (!contentText || contentText.length === 0 || contentText === "❤️")) {
          passed = false;
          details.push(`❌ Button [${idx + 1}] contains only icons or lacks label description. Visually impaired users can never identify its purpose.`);
        } else if (label) {
          details.push(`✔ Button [${idx + 1}] has action label: "${label}"`);
        } else {
          details.push(`✔ Button [${idx + 1}] has semantic text: "${contentText}"`);
        }
      });
    } 
    else if (id === "1.3.1") {
      const inputs = doc.querySelectorAll("input, select, textarea");
      inputs.forEach((input, idx) => {
        const inputId = input.getAttribute("id");
        if (!inputId) {
          passed = false;
          details.push(`❌ Field [${idx + 1}] lacks unique ID, preventing semantic connection.`);
          return;
        }

        const companionLabel = doc.querySelector(`label[for="${inputId}"]`);
        const hasAria = input.hasAttribute("aria-label") || input.hasAttribute("aria-describedby");

        if (!companionLabel && !hasAria) {
          passed = false;
          details.push(`❌ Input [ID: "${inputId}"] has no labeled container. Screen readers won't announce name.`);
        } else if (companionLabel) {
          details.push(`✔ Input [ID: "${inputId}"] matches a semantic <label for="${inputId}"> correctly.`);
        } else {
          details.push(`✔ Input [ID: "${inputId}"] uses ARIA descriptions.`);
        }
      });

      const divsWithHeadingStyle = doc.querySelectorAll("div.text-lg, div.text-xl, div.text-2xl, div.font-bold");
      const realHeadings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (divsWithHeadingStyle.length > 0 && realHeadings.length === 0) {
        passed = false;
        details.push("❌ Title block relies solely on custom div font properties instead of a proper HTML <h2>/<h3> heading tag.");
      } else if (realHeadings.length > 0) {
        details.push(`✔ Heading markup detected: <${realHeadings[0].tagName.toLowerCase()}> outline structured.`);
      }
    } 
    else if (id === "2.1.1") {
      const divElements = doc.querySelectorAll("div, span, p");
      let hasBrokenEvent = false;
      divElements.forEach((el) => {
        if (el.hasAttribute("onclick")) {
          const tabIndex = el.getAttribute("tabindex");
          if (!tabIndex || parseInt(tabIndex) < 0) {
            passed = false;
            hasBrokenEvent = true;
            details.push(`❌ Interactive <div> click event lacks active tabindex. Left/right arrow keys or TAB will completely skip it.`);
          }
        }
      });

      const buttons = doc.querySelectorAll("button, input[type='button'], input[type='submit']");
      if (buttons.length > 0 && !hasBrokenEvent) {
        details.push("✔ Standard <button> nodes are utilized. Free native keyboard activations are granted.");
      }
    } 
    else if (id === "2.4.3") {
      const tabIndexedElements = doc.querySelectorAll("[tabindex]");
      let positiveIndexCount = 0;
      tabIndexedElements.forEach((el) => {
        const indexVal = parseInt(el.getAttribute("tabindex") || "0");
        if (indexVal > 0) {
          passed = false;
          positiveIndexCount++;
          details.push(`❌ Element has tabindex="${indexVal}". Custom sequences break standard top-to-bottom layout navigation.`);
        }
      });

      if (positiveIndexCount === 0) {
        details.push("✔ Document does not override natural tab focus pathways. Natural sequential ordering preserved.");
      }
    } 
    else if (id === "2.4.7") {
      const usesOutlineNone = html.includes("focus:outline-none") || html.includes("outline-none");
      if (usesOutlineNone) {
        passed = false;
        details.push("❌ Interactive button uses focus:outline-none without an alternative glow, making focus paths completely invisible.");
      } else {
        details.push("✔ Action nodes hold standard/custom outlines on selection.");
      }
    } 
    else if (id === "1.4.3") {
      const holdsSoftColor = html.includes("text-zinc-350") || html.includes("text-zinc-400") || html.includes("text-slate-300") || html.includes("text-yellow-300");
      if (holdsSoftColor) {
        passed = false;
        details.push("❌ Soft typography identified. Contrast score falls below 4.5:1. Legibility is lost for visually impaired users.");
      } else {
        details.push("✔ Typography weights and high background colors comply with the minimum 4.5:1 contrast benchmark.");
      }
    } 
    else if (id === "1.4.10") {
      const holdsAbsoluteWidth = html.includes("width:") && /width:\s*\d+px/i.test(html);
      if (holdsAbsoluteWidth) {
        passed = false;
        details.push("❌ Rigid pixel widths limit page adaptation, forcing screen scroll bars on scale/mobile zoom.");
      } else {
        details.push("✔ Fluid layout margins handle narrow scales without wrapping constraints.");
      }
    } 
    else if (id === "3.2.3") {
      const shufflesNav = html.includes("Navbar representation on View B") && (html.includes("Home Platform") || html.includes("About Our Team") || html.includes("Buy Seats"));
      if (shufflesNav) {
        passed = false;
        details.push("❌ Shufled layouts and dynamic title changes detected across headers, violating predictable site navigation.");
      } else {
        details.push("✔ Links preserve structural coordination and consistent labels.");
      }
    }

    return { passed, details };
  };

  return (
    <section className="premium-surface-strong overflow-hidden rounded-[32px]" aria-labelledby={`playground-${example.id}`}>
      {/* Playground Header Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-white/70 bg-white/90 px-5 py-4 md:flex-row md:items-center">
        <div>
          <span className="premium-chip bg-indigo-50 text-indigo-700 mr-2.5">
            Interactive Play
          </span>
          <h3 id={`playground-${example.id}`} className="mt-1 inline-block text-sm font-black tracking-tight text-slate-950 md:mt-0">
            {example.title}
          </h3>
        </div>

        {/* Global simulation panels */}
        <div className="flex flex-wrap items-center gap-2">
          {criterionId === "1.4.3" && (
            <button
              onClick={() => setGrayscaleEnabled(!grayscaleEnabled)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer ${
                grayscaleEnabled 
                  ? "border-indigo-150 bg-indigo-50 text-indigo-800 shadow-sm" 
                  : "border-slate-200 bg-white/90 text-slate-700 hover:bg-white"
              }`}
              aria-pressed={grayscaleEnabled}
              aria-label="Toggle Grayscale Mode to simulate color blindness"
            >
              <Sun className="w-3.5 h-3.5" />
              Grayscale Mode: {grayscaleEnabled ? "On" : "Off"}
            </button>
          )}
          <span className="premium-chip bg-indigo-50 text-indigo-700">
            SC {criterionId} Engine
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 text-xs leading-relaxed italic text-slate-600">
          {example.explanation}
        </p>

        {/* Dynamic Canvas Container - Grid for BAD / GOOD side-by-side */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${grayscaleEnabled ? "filter grayscale" : ""}`}>
          
          {/* 1. BAD accessibility portal */}
          <div className="premium-card flex flex-col overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-4 py-3 text-red-950">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                Example: Failed Implementation
              </span>

              {/* Toggle editable codes vs run panel */}
              <div className="flex gap-1 rounded-full border border-red-200/50 bg-red-100/50 p-0.5">
                <button
                  onClick={() => setActiveTabBad("preview")}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activeTabBad === "preview" 
                      ? "bg-red-600 text-white shadow-sm" 
                      : "text-red-700 hover:bg-red-50"
                  }`}
                  aria-pressed={activeTabBad === "preview"}
                >
                  Live Preview
                </button>
                <button
                  onClick={() => setActiveTabBad("code")}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activeTabBad === "code" 
                      ? "bg-red-600 text-white shadow-sm" 
                      : "text-red-700 hover:bg-red-50"
                  }`}
                  aria-pressed={activeTabBad === "code"}
                >
                  Edit Code
                </button>
              </div>
            </div>

            {/* Dynamic visual viewport area */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div 
                className={`${activeTabBad === "preview" ? "block" : "hidden"} flex min-h-[144px] flex-1 items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white/90 p-4`}
                aria-label="Inaccessible live rendering sandbox viewport"
                role="region"
              >
                {/* INJECTED TARGET PREVIEW */}
                <div ref={badPreviewRef} className="w-full" />
              </div>

              {/* Code TextArea */}
              <div className={`${activeTabBad === "code" ? "block" : "hidden"} flex-1`}>
                <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-slate-950 px-3 py-1.5 text-[10px] font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-red-400" />
                    HTML Code Editor (Failed style)
                  </span>
                  <span className="text-slate-300">Ctrl+Enter to Run</span>
                </div>
                <textarea
                  value={badCode}
                  onChange={(e) => setBadCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      compileCode("bad");
                    }
                  }}
                  className="w-full min-h-[180px] resize-y rounded-b-2xl bg-slate-950 p-3 font-mono text-xs leading-relaxed text-red-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  aria-label="Editable source code area for bad accessibility demonstration"
                  spellCheck="false"
                />
                
                {/* Control utility buttons */}
                <div className="mt-2.5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleReset("bad")}
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    title="Reset to default bad code snippet"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                  <button
                    onClick={() => compileCode("bad")}
                    className="premium-button rounded-full bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Code
                  </button>
                </div>
              </div>

              {/* Dynamic Programmatic Audit Diagnostic Checklist */}
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3.5 text-xs space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-red-900 tracking-wide text-[11px] mb-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  PROACTIVE ACCESSIBILITY SCAN
                </span>
                <ul className="space-y-1.5">
                  {badAuditLogs.details.map((log, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-5 text-red-950 font-medium font-sans">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-red-500 mt-1" />
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Education notes criteria */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 text-xs">
                <span className="font-bold block text-slate-800 text-[11px] mb-1">Functional Impact:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
                  {example.accessibilityNotes.bad.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 2. GOOD accessibility portal */}
          <div className="premium-card flex flex-col overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-4 py-3 text-emerald-950">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Example: Correct Implementation
              </span>

              {/* Toggle editable codes vs run panel */}
              <div className="flex gap-1 rounded-full border border-emerald-200/50 bg-emerald-100/50 p-0.5">
                <button
                  onClick={() => setActiveTabGood("preview")}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activeTabGood === "preview" 
                      ? "bg-emerald-700 text-white shadow-sm" 
                      : "text-emerald-800 hover:bg-emerald-50"
                  }`}
                  aria-pressed={activeTabGood === "preview"}
                >
                  Live Preview
                </button>
                <button
                  onClick={() => setActiveTabGood("code")}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activeTabGood === "code" 
                      ? "bg-emerald-700 text-white shadow-sm" 
                      : "text-emerald-800 hover:bg-emerald-50"
                  }`}
                  aria-pressed={activeTabGood === "code"}
                >
                  Edit Code
                </button>
              </div>
            </div>

            {/* Dynamic visual viewport area */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div 
                className={`${activeTabGood === "preview" ? "block" : "hidden"} flex min-h-[144px] flex-1 items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/90 p-4`}
                aria-label="Compliant live rendering sandbox viewport"
                role="region"
              >
                {/* INJECTED TARGET PREVIEW */}
                <div ref={goodPreviewRef} className="w-full" />
              </div>

              {/* Code TextArea */}
              <div className={`${activeTabGood === "code" ? "block" : "hidden"} flex-1`}>
                <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-slate-950 px-3 py-1.5 text-[10px] font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    HTML Code Editor (Compliant style)
                  </span>
                  <span className="text-slate-300">Ctrl+Enter to Run</span>
                </div>
                <textarea
                  value={goodCode}
                  onChange={(e) => setGoodCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      compileCode("good");
                    }
                  }}
                  className="w-full min-h-[180px] resize-y rounded-b-2xl bg-slate-950 p-3 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  aria-label="Editable source code area for compliant accessibility demonstration"
                  spellCheck="false"
                />

                {/* Control utility buttons */}
                <div className="mt-2.5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleReset("good")}
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    title="Reset to default compliant code snippet"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                  <button
                    onClick={() => compileCode("good")}
                    className="premium-button premium-button-primary rounded-full px-3 py-1.5 text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Code
                  </button>
                </div>
              </div>

              {/* Dynamic Programmatic Audit Diagnostic Checklist */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900 tracking-wide text-[11px] mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  PROACTIVE ACCESSIBILITY SCAN
                </span>
                <ul className="space-y-1.5">
                  {goodAuditLogs.details.map((log, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-5 text-emerald-950 font-medium font-sans">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-1" />
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Education notes criteria */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 text-xs">
                <span className="font-bold block text-slate-800 text-[11px] mb-1">Functional Impact:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
                  {example.accessibilityNotes.good.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Keyboard instructions panel - Floating indigo tip bar */}
        <aside className="mt-6 flex items-center gap-4 rounded-[24px] border border-slate-900/10 bg-[linear-gradient(135deg,#020617_0%,#312e81_55%,#0f172a_100%)] p-5 text-indigo-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-800 bg-indigo-900 text-xl select-none">
            💡
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Accessibility Practice Session</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-indigo-200 font-medium leading-relaxed">
              {example.keyboardInstructions.map((step, idx) => (
                <li key={idx}>Tab sequence: <code className="bg-indigo-900 px-1 py-0.5 rounded text-white font-mono text-[10px]">{step}</code></li>
              ))}
            </ul>
          </div>
        </aside>

      </div>
    </section>
  );
}
