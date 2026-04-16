import http from "./http";

export const getDailyEntryByDate = async (date) => {
  const response = await http.get(`/daily/${date}`);
  return response.data;
};

export const createDailyEntry = async (payload) => {
  const response = await http.post("/daily", payload);
  return response.data;
};

export const updateDailyTaskStatus = async (entryId, taskId, done) => {
  const response = await http.patch(`/daily/task/${entryId}/${taskId}`, {
    done,
  });
  return response.data;
};

export const addExtraTask = async (entryId, { text, scheduledTime, estimatedDuration }) => {
  const response = await http.post(`/daily/${entryId}/tasks`, { text, scheduledTime, estimatedDuration });
  return response.data;
};

export const updateExtraTask = async (entryId, taskId, { text, scheduledTime, estimatedDuration }) => {
  const response = await http.patch(`/daily/${entryId}/tasks/${taskId}`, {
    text, scheduledTime, estimatedDuration,
  });
  return response.data;
};

export const deleteExtraTask = async (entryId, taskId) => {
  const response = await http.delete(`/daily/${entryId}/tasks/${taskId}`);
  return response.data;
};

export const updateDailySummary = async (entryId, summary) => {
  const response = await http.patch(`/daily/${entryId}/summary`, {
    summary,
  });
  return response.data;
};

export const updateTaskTime = async (entryId, taskId, data) => {
  const response = await http.patch(`/daily/${entryId}/tasks/${taskId}/time`, data);
  return response.data;
};

export const reopenDailyEntry = async (entryId) => {
  const response = await http.patch(`/daily/${entryId}/reopen`);
  return response.data;
};

export const processEndOfDay = async (date, action, summary = "") => {
  const response = await http.post("/daily/end-of-day", {
    date,
    action,
    summary,
  });
  return response.data;
};