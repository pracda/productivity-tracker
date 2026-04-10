import { create } from "zustand";
import {
  getCurrentWeeklyPlan,
  addWeeklyTask,
  updateWeeklyTaskStatus,
} from "../api/weeklyApi";

const useWeeklyStore = create((set) => ({
  weeklyPlan: null,
  loading: false,
  error: null,

  fetchWeeklyPlan: async () => {
    set({ loading: true, error: null });

    try {
      const data = await getCurrentWeeklyPlan();
      set({ weeklyPlan: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load weekly plan",
      });
    }
  },

  createWeeklyTask: async (text) => {
    try {
      const updated = await addWeeklyTask(text);
      set({ weeklyPlan: updated });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add weekly task",
      });
    }
  },

  toggleWeeklyTask: async (taskId, done) => {
    try {
      const updated = await updateWeeklyTaskStatus(taskId, done);
      set({ weeklyPlan: updated });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update weekly task",
      });
    }
  },
}));

export default useWeeklyStore;