import { create } from "zustand";
import {
  getDailyEntryByDate,
  updateDailyTaskStatus,
  addExtraTask,
  updateExtraTask,
  deleteExtraTask,
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
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update task",
      });
    }
  },

  createExtraTask: async (text) => {
    const { entry } = get();
    if (!entry) return;

    try {
      const updated = await addExtraTask(entry._id, text);
      set({ entry: updated });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add extra task",
      });
    }
  },

  editExtraTask: async (taskId, text) => {
  const { entry } = get();
  if (!entry) return;

  try {
    const updated = await updateExtraTask(entry._id, taskId, text);
    console.log("editExtraTask success:", updated);
    set({ entry: updated });
  } catch (error) {
    console.error("editExtraTask error:", error);
    set({
      error: error.response?.data?.message || "Failed to edit extra task",
    });
  }
},

removeExtraTask: async (taskId) => {
  const { entry } = get();
  if (!entry) return;

  try {
    const updated = await deleteExtraTask(entry._id, taskId);
    console.log("removeExtraTask success:", updated);
    set({ entry: updated });
  } catch (error) {
    console.error("removeExtraTask error:", error);
    set({
      error: error.response?.data?.message || "Failed to delete extra task",
    });
  }
},

  runEndOfDay: async (date, action) => {
    try {
      const result = await processEndOfDay(date, action);
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