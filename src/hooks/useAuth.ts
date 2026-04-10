import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | "user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      setRoles((data ?? []).map((r) => r.role));
    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Then listen for changes - DO NOT await inside callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change callback
          setTimeout(() => {
            fetchRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const isOwner = roles.includes("owner");
  const isAdmin = roles.includes("admin") || isOwner;

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, displayName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setRoles([]);
    }
    return { error };
  };

  return { user, loading, roles, isOwner, isAdmin, signIn, signUp, signOut };
}
