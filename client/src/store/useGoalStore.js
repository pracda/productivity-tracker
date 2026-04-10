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
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load goals",
      });
    }
  },

  createNewGoal: async (payload) => {
    try {
      const goal = await createGoal(payload);
      set({ goals: [goal, ...get().goals] });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create goal",
      });
    }
  },

  updateExistingGoal: async (goalId, payload) => {
    try {
      const updatedGoal = await updateGoal(goalId, payload);

      set({
        goals: get().goals.map((goal) =>
          goal._id === goalId ? updatedGoal : goal
        ),
      });

      await get().fetchGoalHistory(goalId);
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update goal",
      });
    }
  },

  fetchGoalHistory: async (goalId) => {
    try {
      const history = await getGoalHistory(goalId);

      set({
        historyByGoalId: {
          ...get().historyByGoalId,
          [goalId]: history,
        },
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load goal history",
      });
    }
  },
}));

export default useGoalStore;