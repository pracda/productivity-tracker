import { create } from "zustand";
import {
  getPersonalTasks,
  updatePersonalTasks,
} from "../api/settingsApi";
import { getRoutine, updateRoutine } from "../api/routineApi";

const useSettingsStore = create((set) => ({
  personalTasks: [],
  morningRoutine: [],
  nightRoutine: [],
  loading: false,
  error: null,

  fetchPersonalTasks: async () => {
    try {
      const data = await getPersonalTasks();
      set({ personalTasks: data.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load personal tasks",
      });
    }
  },

  savePersonalTasks: async (tasks) => {
    try {
      const updated = await updatePersonalTasks(tasks);
      set({ personalTasks: updated.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to save personal tasks",
      });
    }
  },

  fetchRoutine: async (type) => {
    try {
      const data = await getRoutine(type);
      if (type === "morning") set({ morningRoutine: data.tasks || [] });
      else set({ nightRoutine: data.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || `Failed to load ${type} routine`,
      });
    }
  },

  saveRoutine: async (type, tasks) => {
    try {
      const updated = await updateRoutine(type, tasks);
      if (type === "morning") set({ morningRoutine: updated.tasks || [] });
      else set({ nightRoutine: updated.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || `Failed to save ${type} routine`,
      });
    }
  },
}));

export default useSettingsStore;
