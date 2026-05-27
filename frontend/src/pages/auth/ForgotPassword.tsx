import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { forgotPassword } from "../../lib/api";
import { useToast } from "../../components/toast/ToastProvider";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.push({
        kind: "success",
        title: "Check your email",
        message: "If an account exists, you will receive a reset link shortly.",
      });
    } catch (error) {
      toast.push({
        kind: "error",
        title: "Reset request failed",
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
          <h1 className="text-lg font-extrabold tracking-tight">Reset password</h1>
          <p className="text-xs font-medium text-slate-600">We’ll email you a link to reset your password.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-xs font-bold text-indigo-700 hover:text-indigo-800">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

