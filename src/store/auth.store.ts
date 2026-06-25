import { create } from "zustand";
import type { User } from "../features/auth/types";

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem("auth_user");
  },
}));
