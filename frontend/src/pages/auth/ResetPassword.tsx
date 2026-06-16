import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { resetPassword } from "../../lib/api";
import { useToast } from "../../components/toast/ToastProvider";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.push({ kind: "success", title: "Password updated", message: "You can sign in now." });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.push({
        kind: "error",
        title: "Reset failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="premium-surface-strong space-y-4 rounded-[32px] p-6">
        <div className="space-y-1">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-950">Choose a new password</h1>
          <p className="text-xs font-medium text-slate-600">This link expires automatically.</p>
        </div>

        {!token ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
            Missing reset token. Please use the link from your email.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              New password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="premium-input mt-1 text-xs"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="premium-button premium-button-primary w-full text-xs disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs font-bold text-indigo-700 hover:text-indigo-800">
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
