import { create } from "zustand";
import {
  getDailyEntryByDate,
  updateDailyTaskStatus,
  addExtraTask,
  updateExtraTask,
  deleteExtraTask,
  updateDailySummary,
  reopenDailyEntry,
  processEndOfDay,
} from "../api/dailyApi";

const useDailyStore = create((set, get) => ({
  entry: null,
  loading: false,
  error: null,

  fetchDailyEntry: async (date) => {
    set({ loading: true, error: null });

    try {
      const data = await getDailyEntryByDate(date);
      set({ entry: data, loading: false });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch daily entry",
      });
      return null;
    }
  },

  toggleTask: async (taskId, done) => {
    const { entry } = get();
    if (!entry) return;

    try {
      const updated = await updateDailyTaskStatus(entry._id, taskId, done);
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update task",
      });
      return null;
    }
  },

  createExtraTask: async ({ text, scheduledTime, estimatedDuration }) => {
    const { entry } = get();
    if (!entry) return;

    try {
      const updated = await addExtraTask(entry._id, { text, scheduledTime, estimatedDuration });
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add extra task",
      });
      return null;
    }
  },

  editExtraTask: async (taskId, { text, scheduledTime, estimatedDuration }) => {
    const { entry } = get();
    if (!entry) return;

    try {
      const updated = await updateExtraTask(entry._id, taskId, { text, scheduledTime, estimatedDuration });
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to edit extra task",
      });
      return null;
    }
  },

  removeExtraTask: async (taskId) => {
    const { entry } = get();
    if (!entry) return;

    try {
      const updated = await deleteExtraTask(entry._id, taskId);
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete extra task",
      });
      return null;
    }
  },

  saveSummary: async (summary) => {
    const { entry } = get();
    if (!entry) return null;

    try {
      const updated = await updateDailySummary(entry._id, summary);
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to save daily summary",
      });
      return null;
    }
  },

  reopenDay: async () => {
    const { entry } = get();
    if (!entry) return null;

    try {
      const updated = await reopenDailyEntry(entry._id);
      set({ entry: updated });
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to reopen day",
      });
      return null;
    }
  },

  runEndOfDay: async (date, action, summary = "") => {
    try {
      const result = await processEndOfDay(date, action, summary);
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to process end of day",
      });
      return null;
    }
  },
}));

export default useDailyStore;