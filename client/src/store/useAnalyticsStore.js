import { create } from "zustand";
import { getAnalytics } from "../api/analyticsApi";

const useAnalyticsStore = create((set) => ({
  analytics: null,
  loading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ loading: true, error: null });

    try {
      const data = await getAnalytics();
      set({ analytics: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load analytics",
      });
    }
  },
}));

export default useAnalyticsStore;