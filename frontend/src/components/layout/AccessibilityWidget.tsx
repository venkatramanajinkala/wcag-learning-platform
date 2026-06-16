import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Eye, Keyboard, Type } from "lucide-react";

type AccessibilityWidgetProps = {
  focusGuideEnabled: boolean;
  textSpacingEnabled: boolean;
  onToggleFocusGuide: () => void;
  onToggleTextSpacing: () => void;
};

export default function AccessibilityWidget({
  focusGuideEnabled,
  textSpacingEnabled,
  onToggleFocusGuide,
  onToggleTextSpacing,
}: AccessibilityWidgetProps) {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!widgetRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = widgetRef.current?.querySelectorAll("[role='menuitemcheckbox']");
    const items = nodes ? Array.from(nodes) as HTMLButtonElement[] : [];
    if (items.length === 0) return;

    const activeIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(activeIndex + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(activeIndex - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const items = [
    {
      id: "focus-guide",
      label: "Focus Guide",
      description: "Shows a stronger keyboard outline for testing focus visibility.",
      active: focusGuideEnabled,
      onClick: onToggleFocusGuide,
      icon: Eye,
    },
    {
      id: "spacing-check",
      label: "Spacing Check",
      description: "Simulates text spacing changes so layout issues show up early.",
      active: textSpacingEnabled,
      onClick: onToggleTextSpacing,
      icon: Type,
    },
  ];

  return (
    <div className="relative" ref={widgetRef} onKeyDown={handleMenuKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`topbar-button ${open ? "topbar-button-primary" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open accessibility options"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span>Accessibility</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Accessibility options"
          className="accessibility-widget-panel"
        >
          <div className="px-2 py-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Accessibility widget
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Tools stay together, aligned with the rest of the header actions.
            </p>
          </div>

          <div className="mt-2 space-y-1">
            {items.map(({ id, label, description, active, onClick, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={active}
                className={`accessibility-widget-item ${active ? "accessibility-widget-item-active" : ""}`}
                onClick={() => {
                  onClick();
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${active ? "border-white/20 bg-white/15 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold">{label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed opacity-80">
                    {description}
                  </span>
                </span>
                <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {active ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2 rounded-[18px] border border-white/70 bg-white/70 px-3 py-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Keyboard className="h-3.5 w-3.5 text-indigo-600" />
              Keyboard Testable
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Focus rings, tab order, and menu actions are kept visible for keyboard and screen reader checks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
