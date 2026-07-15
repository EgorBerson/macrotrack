import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    let active = true;

    const applySession = nextSession => {
      if (!active) return;
      setSession(previous => previous?.access_token === nextSession?.access_token ? previous : nextSession);
    };

    const restoreSession = async ({ initial = false } = {}) => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        let nextSession = data.session;
        const expiresSoon = nextSession?.expires_at && nextSession.expires_at * 1000 <= Date.now() + 60_000;
        if (expiresSoon) {
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          nextSession = refreshed.session;
        }
        applySession(nextSession);
      } catch (error) {
        // A laptop waking up can briefly report no network. Keep the current UI
        // alive and let Supabase retry instead of treating that as a sign-out.
        console.error("Failed to restore auth session:", error);
      } finally {
        if (initial && active) setAuthLoading(false);
      }
    };

    restoreSession({ initial: true });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      if (active) setAuthLoading(false);
    });
    const handleResume = () => {
      if (document.visibilityState === "visible") restoreSession();
    };
    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("online", handleResume);

    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("online", handleResume);
    };
  }, []);

  return { session, setSession, authLoading };
}
