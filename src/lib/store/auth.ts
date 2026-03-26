import { create } from "zustand";
import { signIn, signOut } from "next-auth/react";

export type AuthUser = {
  id: string;
  username?: string;
  email?: string;
} | null;

type AuthState = {
  user: AuthUser;
  error?: string | null;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithUsername: (username: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  error: null,

  loginWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        set({ error: result.error });
      } else {
        await get().loadSession();
      }
    } catch {
      set({ error: "Login failed" });
    }
  },

  loginWithUsername: async (username, password) => {
    await get().loginWithEmail(username, password);
  },

  registerWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error || "Registration failed" });
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      await get().loadSession();
    } catch {
      set({ error: "Registration failed" });
    }
  },

  registerWithUsername: async (username, password) => {
    await get().registerWithEmail(username, password);
  },

  guestLogin: async () => {
    set({ error: null });
    try {
      const result = await signIn("credentials", { guest: "true", redirect: false });
      if (result?.error) {
        set({ error: result.error });
      } else {
        await get().loadSession();
      }
    } catch {
      set({ error: "Guest login failed" });
    }
  },

  logout: async () => {
    await signOut({ redirect: false });
    set({ user: null, error: null });
  },

  loadSession: async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user) {
        set({ user: { id: data.user.id, email: data.user.email } });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },
}));
