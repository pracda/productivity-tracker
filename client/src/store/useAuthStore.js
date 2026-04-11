import { create } from "zustand";
import { googleLogin, getAuthStatus } from "../api/authApi";

const STORAGE_KEY = "productivity_auth";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const stored = readStoredAuth();

const useAuthStore = create((set) => ({
  user: stored?.user || null,
  token: stored?.token || null,
  loading: false,
  error: null,

  loginWithGoogleCredential: async (credential) => {
    set({ loading: true, error: null });

    try {
      const data = await googleLogin(credential);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: data.token,
          user: data.user,
        })
      );

      set({
        user: data.user,
        token: data.token,
        loading: false,
      });

      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Google login failed",
      });
      return null;
    }
  },

  checkAuthStatus: async () => {
    try {
      const data = await getAuthStatus();

      if (data.authenticated && data.user) {
        const existing = readStoredAuth();

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token: existing?.token || null,
            user: data.user,
          })
        );

        set({
          user: data.user,
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        set({
          user: null,
          token: null,
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({
        user: null,
        token: null,
      });
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      user: null,
      token: null,
      error: null,
      loading: false,
    });
  },
}));

export default useAuthStore;