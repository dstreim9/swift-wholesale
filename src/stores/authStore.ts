import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  user: { email: string; company: string } | null;
  login: (email: string, _password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,

  login: (email: string, _password: string) => {
    // Mock authenticatie — later te vervangen door echte Shopify Customer API
    set({
      isAuthenticated: true,
      user: { email, company: "Demo Wholesale B.V." },
    });
    return true;
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
