import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="text-xs font-bold text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

