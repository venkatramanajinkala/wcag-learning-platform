import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAuth,
  fetchMe,
  getStoredToken,
  getStoredUser,
  storeAuth,
  type ApiUser,
  type AuthResponse,
} from "../../lib/api";

type AuthState = {
  user: ApiUser | null;
  token: string | null;
  ready: boolean;
};

type AuthContextValue = AuthState & {
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: getStoredUser(),
    token: getStoredToken(),
    ready: false,
  }));

  const logout = useCallback(() => {
    clearAuth();
    setState({ user: null, token: null, ready: true });
  }, []);

  const setAuth = useCallback((auth: AuthResponse) => {
    storeAuth(auth);
    setState({ user: auth.user, token: auth.access_token, ready: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setState((prev) => ({ ...prev, ready: true, user: null, token: null }));
        return;
      }

      try {
        const user = await fetchMe();
        if (!cancelled) setState({ user, token, ready: true });
      } catch {
        if (!cancelled) logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({ ...state, logout, setAuth }), [state, logout, setAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

