import { create } from "zustand";

export type AuthUser = {
  id: string;
  username?: string;
  email?: string;
};

type AuthState = {
  user: AuthUser | null;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithUsername: (username: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  guestLogin: () => void;
  logout: () => void;
  error?: string | null;
};

const makeId = () => Math.random().toString(36).slice(2);

export const useAuth = create<AuthState>((set) => ({
  user: null,
  error: null,
  async loginWithUsername(username, password) {
    if (!username || !password) return set({ error: "Enter username and password" });
    set({ user: { id: makeId(), username }, error: null });
  },
  async loginWithEmail(email, password) {
    if (!email || !password) return set({ error: "Enter email and password" });
    set({ user: { id: makeId(), email }, error: null });
  },
  async registerWithUsername(username, password) {
    if (!username || !password) return set({ error: "Enter username and password" });
    set({ user: { id: makeId(), username }, error: null });
  },
  async registerWithEmail(email, password) {
    if (!email || !password) return set({ error: "Enter email and password" });
    set({ user: { id: makeId(), email }, error: null });
  },
  guestLogin() {
    set({ user: { id: makeId(), username: "guest" }, error: null });
  },
  logout() {
    set({ user: null, error: null });
  },
}));