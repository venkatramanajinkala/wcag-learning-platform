const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "a11yplay-token";
const USER_KEY = "a11yplay-user";

export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: ApiUser;
}

export interface ProgressItem {
  criterion_id: string;
  item_key: string;
  completed: boolean;
  updated_at: string;
}

export interface AuditResponse {
  passed: boolean;
  details: string[];
  submission_id: number | null;
}

export interface ChatResponse {
  answer: string;
  wcag_context: string[];
}

export function isBackendConfigured() {
  return API_URL.length > 0;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  window.dispatchEvent(new Event("a11y-auth-update"));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("a11y-auth-update"));
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("Backend API is not configured. Set VITE_API_URL in frontend/.env.");
  }

  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function register(fullName: string, email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function googleLogin(credential: string) {
  return apiFetch<AuthResponse>("/api/oauth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function fetchMe() {
  return apiFetch<ApiUser>("/api/auth/me");
}

export function forgotPassword(email: string) {
  return apiFetch<{ status: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ status: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export function fetchProgress() {
  return apiFetch<ProgressItem[]>("/api/progress");
}

export function saveProgressItem(criterionId: string, itemKey: string, completed: boolean) {
  return apiFetch<ProgressItem>("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ criterion_id: criterionId, item_key: itemKey, completed }),
  });
}

export function saveProgressBulk(items: Array<{ criterion_id: string; item_key: string; completed: boolean }>) {
  return apiFetch<ProgressItem[]>("/api/progress/bulk", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export function resetRemoteProgress() {
  return apiFetch<void>("/api/progress", { method: "DELETE" });
}

export function scanHtml(html: string, criterionId?: string, saveSubmission = false) {
  return apiFetch<AuditResponse>("/api/audit/scan", {
    method: "POST",
    body: JSON.stringify({
      html,
      criterion_id: criterionId,
      save_submission: saveSubmission,
    }),
  });
}

export function sendChatMessage(message: string) {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
