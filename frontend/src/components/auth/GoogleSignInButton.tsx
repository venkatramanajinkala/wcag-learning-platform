import { useEffect, useRef, useState } from "react";
import { googleLogin } from "../../lib/api";
import { useAuth } from "./AuthProvider";
import { useToast } from "../toast/ToastProvider";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { setAuth } = useAuth();
  const toast = useToast();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !ready || !containerRef.current) return;
    const google = window.google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        try {
          if (!response.credential) throw new Error("Missing Google credential");
          const auth = await googleLogin(response.credential);
          setAuth(auth);
          toast.push({ kind: "success", title: "Signed in", message: "Welcome back." });
        } catch (error) {
          toast.push({
            kind: "error",
            title: "Google sign-in failed",
            message: error instanceof Error ? error.message : "Please try again.",
          });
        }
      },
    });

    google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 380,
      text: "continue_with",
      shape: "pill",
    });
  }, [clientId, ready, setAuth, toast]);

  if (!clientId) return null;

  return <div ref={containerRef} className="w-full [&>div]:w-full" aria-label="Sign in with Google" />;
}

