import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import AuthLayout from "./AuthLayout";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { register } from "../../lib/api";
import { syncLocalProgressToBackend, hydrateProgressFromBackend } from "../../lib/progress";
import { useAuth } from "../../components/auth/AuthProvider";
import { useToast } from "../../components/toast/ToastProvider";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.ready && auth.token) {
      navigate("/app", { replace: true });
    }
  }, [auth.ready, auth.token, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await register(fullName, email, password);
      auth.setAuth(res);
      await syncLocalProgressToBackend();
      await hydrateProgressFromBackend();
      toast.push({ kind: "success", title: "Account created", message: "Welcome to A11yPlay." });
      navigate("/app", { replace: true });
    } catch (error) {
      toast.push({
        kind: "error",
        title: "Sign up failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="premium-surface-strong min-w-0 overflow-hidden rounded-[32px]">
        <div className="h-1 bg-[linear-gradient(90deg,#020617_0%,#10b981_38%,#06b6d4_72%,#4f46e5_100%)]" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="min-w-0 space-y-2">
            <div className="premium-pill w-fit">
              <UserPlus className="h-3.5 w-3.5" />
              Create account
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Start your WCAG practice</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Create an account to save progress, keep audits tied to your profile, and use the assistant across sessions.
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
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">or use email</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign up form">
            <label className="block text-xs font-bold text-slate-700">
              Full name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="premium-input mt-1.5"
                required
                minLength={2}
                autoComplete="name"
                placeholder="Your name"
              />
            </label>

            <label className="block text-xs font-bold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input mt-1.5"
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
                className="premium-input mt-1.5"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-slate-900">
                Already have an account?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="premium-button premium-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
