import { FormEvent, useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
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

  useEffect(() => {
    const updateUser = () => setUser(getStoredUser());
    window.addEventListener("a11y-auth-update", updateUser);
    return () => window.removeEventListener("a11y-auth-update", updateUser);
  }, []);

  if (!isBackendConfigured()) {
    return (
      <span className="hidden md:inline-flex text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
        Local demo mode
      </span>
    );
  }

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
    return (
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[11px] font-bold text-slate-600">
          {user.full_name}
        </span>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            setUser(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
