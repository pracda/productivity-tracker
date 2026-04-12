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
  const response = await http.patch(`/weekly/tasks/${taskId}/status`, { done });
  return response.data;
};

export const updateWeeklyTaskText = async (taskId, text) => {
  const response = await http.patch(`/weekly/tasks/${taskId}`, { text });
  return response.data;
};

export const deleteWeeklyTask = async (taskId) => {
  const response = await http.delete(`/weekly/tasks/${taskId}`);
  return response.data;
};