import { create } from "zustand";
import {
  getPersonalTasks,
  updatePersonalTasks,
  getDailyTemplate,
  updateDailyTemplate,
} from "../api/settingsApi";

const useSettingsStore = create((set, get) => ({
  personalTasks: [],
  currentTemplate: [],
  selectedWeekday: 1,
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

  fetchTemplate: async (weekday) => {
    set({ selectedWeekday: weekday });

    try {
      const data = await getDailyTemplate(weekday);
      set({ currentTemplate: data.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load template",
      });
    }
  },

  saveTemplate: async (weekday, tasks) => {
    try {
      const updated = await updateDailyTemplate(weekday, tasks);
      set({ currentTemplate: updated.tasks || [] });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to save template",
      });
    }
  },
}));

export default useSettingsStore;