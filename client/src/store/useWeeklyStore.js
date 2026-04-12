import { create } from "zustand";
import {
  getCurrentWeeklyPlan,
  addWeeklyTask,
  updateWeeklyTaskStatus,
  updateWeeklyTaskText,
  deleteWeeklyTask,
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
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load weekly plan",
      });
      return null;
    }
  },

  createWeeklyTask: async (text) => {
    try {
      const data = await addWeeklyTask(text);
      set({ weeklyPlan: data });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add weekly task",
      });
      return null;
    }
  },

  toggleWeeklyTask: async (taskId, done) => {
    try {
      const data = await updateWeeklyTaskStatus(taskId, done);
      set({ weeklyPlan: data });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update weekly task",
      });
      return null;
    }
  },

  editWeeklyTask: async (taskId, text) => {
    try {
      const data = await updateWeeklyTaskText(taskId, text);
      set({ weeklyPlan: data });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to edit weekly task",
      });
      return null;
    }
  },

  removeWeeklyTask: async (taskId) => {
    try {
      const data = await deleteWeeklyTask(taskId);
      set({ weeklyPlan: data });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete weekly task",
      });
      return null;
    }
  },
}));

export default useWeeklyStore;