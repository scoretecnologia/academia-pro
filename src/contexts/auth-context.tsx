import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { AppUser, Role } from "@/types";

type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem("academia-pro-user");
    return stored ? (JSON.parse(stored) as AppUser) : null;
  });

  async function login(email: string, password: string) {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user!.id)
      .single();

    if (profileError) throw profileError;

    const profile: AppUser = {
      id: profileData.id,
      name: profileData.nome,
      email: profileData.email,
      role: profileData.role,
      active: profileData.ativo,
      avatarUrl: profileData.avatar_url,
      createdAt: profileData.created_at,
    };

    localStorage.setItem("academia-pro-user", JSON.stringify(profile));
    setUser(profile);
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem("academia-pro-user");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      can: (roles: Role[]) => Boolean(user && roles.includes(user.role)),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
