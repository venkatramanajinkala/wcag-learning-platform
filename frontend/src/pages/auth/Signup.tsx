import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-extrabold tracking-tight">Create account</h1>
          <p className="text-xs font-medium text-slate-600">Save your progress and unlock the learning workspace.</p>
        </div>

        <GoogleSignInButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-[11px] font-bold text-slate-500">or</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3" aria-label="Sign up form">
          <label className="block text-xs font-bold text-slate-700">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              minLength={2}
              autoComplete="name"
            />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              autoComplete="email"
            />
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-slate-900">
              Already have an account?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
