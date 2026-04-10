import http from "./http";

export const getGoals = async () => {
  const response = await http.get("/goals");
  return response.data;
};

export const createGoal = async (payload) => {
  const response = await http.post("/goals", payload);
  return response.data;
};

export const updateGoal = async (goalId, payload) => {
  const response = await http.patch(`/goals/${goalId}`, payload);
  return response.data;
};

export const getGoalHistory = async (goalId) => {
  const response = await http.get(`/goals/${goalId}/history`);
  return response.data;
};