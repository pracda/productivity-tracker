import http from "./http";

export const getCurrentWeeklyPlan = async () => {
  const response = await http.get("/weekly/current");
  return response.data;
};

export const addWeeklyTask = async (text) => {
  const response = await http.post("/weekly/tasks", { text });
  return response.data;
};

export const updateWeeklyTaskStatus = async (taskId, done) => {
  const response = await http.patch(`/weekly/task/${taskId}`, { done });
  return response.data;
};