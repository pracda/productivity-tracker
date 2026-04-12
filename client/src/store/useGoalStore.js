import { create } from "zustand";
import {
  getGoals,
  createGoal,
  updateGoal,
  getGoalHistory,
} from "../api/goalApi";

const useGoalStore = create((set, get) => ({
  goals: [],
  historyByGoalId: {},
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });

    try {
      const data = await getGoals();
      set({ goals: data, loading: false });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load goals",
      });
      return null;
    }
  },

  createNewGoal: async (payload) => {
    try {
      const created = await createGoal(payload);
      set((state) => ({
        goals: [created, ...state.goals],
      }));
      return created;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create goal",
      });
      return null;
    }
  },

  updateExistingGoal: async (goalId, payload) => {
    try {
      const updated = await updateGoal(goalId, payload);

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal._id === goalId ? updated : goal
        ),
      }));

      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update goal",
      });
      return null;
    }
  },

  fetchGoalHistory: async (goalId) => {
    try {
      const history = await getGoalHistory(goalId);

      set((state) => ({
        historyByGoalId: {
          ...state.historyByGoalId,
          [goalId]: history,
        },
      }));

      return history;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load goal history",
      });
      return null;
    }
  },
}));

export default useGoalStore;