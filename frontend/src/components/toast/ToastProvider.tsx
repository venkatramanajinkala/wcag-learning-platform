import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function colorClasses(kind: ToastKind) {
  switch (kind) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "error":
      return "border-red-200 bg-red-50 text-red-950";
    default:
      return "border-slate-200 bg-white text-slate-950";
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${colorClasses(toast.kind)}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs font-medium text-slate-600">{toast.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

