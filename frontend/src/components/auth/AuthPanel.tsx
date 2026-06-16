import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function AuthPanel() {
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const nodes = menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']");
    const items: HTMLButtonElement[] = nodes ? Array.from<HTMLButtonElement>(nodes) : [];
    const activeIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? (activeIndex + 1) % items.length
        : (activeIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  if (!token || !user) {
    return (
      <Link
        to="/login"
        className="topbar-button"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Link>
    );
  }

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
        className={`topbar-button py-0.5 pl-1.5 pr-1.5 ${
          open ? "topbar-button-primary" : ""
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.full_name} profile menu`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#4f46e5_100%)] text-[10px] font-black text-white">
          {initials || "A"}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile actions"
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-xs font-extrabold text-slate-900">{user.full_name}</p>
            <p className="truncate text-[11px] font-medium text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-indigo-50 focus:text-indigo-700 focus:outline-none"
            onClick={() => {
              setOpen(false);
              navigate("/app");
            }}
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-indigo-50 focus:text-indigo-700 focus:outline-none"
            onClick={() => {
              setOpen(false);
              navigate("/app");
            }}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/login", { replace: true });
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
