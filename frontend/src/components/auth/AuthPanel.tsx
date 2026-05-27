import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, Settings, User, UserPlus } from "lucide-react";
import {
  clearAuth,
  getStoredUser,
  isBackendConfigured,
  login,
  register,
  storeAuth,
  type ApiUser,
} from "../../lib/api";
import { hydrateProgressFromBackend, syncLocalProgressToBackend } from "../../lib/progress";

export default function AuthPanel() {
  const [user, setUser] = useState<ApiUser | null>(() => getStoredUser());
  const [mode, setMode] = useState<"login" | "register">("login");
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateUser = () => setUser(getStoredUser());
    window.addEventListener("a11y-auth-update", updateUser);
    return () => window.removeEventListener("a11y-auth-update", updateUser);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!isBackendConfigured()) {
    return (
      <span className="hidden md:inline-flex text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
        Local demo mode
      </span>
    );
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const itemNodes = menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']");
    const items: HTMLButtonElement[] = itemNodes ? Array.from<HTMLButtonElement>(itemNodes) : [];
    const activeIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? (activeIndex + 1) % items.length
        : (activeIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const auth =
        mode === "register"
          ? await register(fullName, email, password)
          : await login(email, password);
      storeAuth(auth);
      await syncLocalProgressToBackend();
      await hydrateProgressFromBackend();
      setUser(auth.user);
      setOpen(false);
      setPassword("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    const initials = user.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="relative" ref={menuRef} onKeyDown={handleMenuKeyDown}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex h-8 items-center gap-1 rounded-lg border py-1 pl-1 pr-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
            open
              ? "border-slate-300 bg-slate-50 text-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`${user.full_name} profile menu`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
            {initials || "A"}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Profile actions"
            className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="truncate text-xs font-extrabold text-slate-900">{user.full_name}</p>
              <p className="truncate text-[11px] font-medium text-slate-500">{user.email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-indigo-50 focus:text-indigo-700 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-indigo-50 focus:text-indigo-700 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                clearAuth();
                setUser(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-xs font-bold text-red-700 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
          open
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LogIn className="w-3.5 h-3.5" />
        Sync
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-10 z-50 w-72 bg-white border border-slate-200 rounded-xl p-4 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-900">
              {mode === "register" ? "Create account" : "Login"}
            </h2>
            <button
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700"
            >
              <UserPlus className="w-3 h-3" />
              {mode === "register" ? "Use login" : "Register"}
            </button>
          </div>

          {mode === "register" && (
            <label className="block text-xs font-bold text-slate-700">
              Name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
                minLength={2}
              />
            </label>
          )}

          <label className="block text-xs font-bold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              minLength={8}
            />
          </label>

          {status && <p className="text-xs font-bold text-red-700">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "register" ? "Create and sync" : "Login and sync"}
          </button>
        </form>
      )}
    </div>
  );
}
