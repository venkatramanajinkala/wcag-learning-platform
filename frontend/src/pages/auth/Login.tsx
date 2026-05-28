import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import AuthLayout from "./AuthLayout";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { login } from "../../lib/api";
import { syncLocalProgressToBackend, hydrateProgressFromBackend } from "../../lib/progress";
import { useAuth } from "../../components/auth/AuthProvider";
import { useToast } from "../../components/toast/ToastProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from || "/app";

  useEffect(() => {
    if (auth.ready && auth.token) {
      navigate("/app", { replace: true });
    }
  }, [auth.ready, auth.token, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      auth.setAuth(res);
      await syncLocalProgressToBackend();
      await hydrateProgressFromBackend();
      toast.push({ kind: "success", title: "Signed in", message: "Welcome back." });
      navigate(from, { replace: true });
    } catch (error) {
      toast.push({
        kind: "error",
        title: "Sign in failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="overflow-hidden rounded-[28px] border border-indigo-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-lg shadow-indigo-100/40">
        <div className="h-1 bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Continue your WCAG training, keep your progress synced, and jump back into the assistant when you need a quick accessibility answer.
            </p>
          </div>

          <div className="mt-5">
            <GoogleSignInButton />
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">or use email</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign in form">
            <label className="block text-xs font-bold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-xs font-bold text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                required
                autoComplete="current-password"
                placeholder="Your password"
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-700 hover:text-indigo-800">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-xs font-bold text-slate-700 hover:text-slate-900">
                Create account
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
