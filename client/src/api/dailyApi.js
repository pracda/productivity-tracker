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

export const addExtraTask = async (entryId, text) => {
  const response = await http.post(`/daily/${entryId}/tasks`, { text });
  return response.data;
};

export const updateExtraTask = async (entryId, taskId, text) => {
  const response = await http.patch(`/daily/${entryId}/tasks/${taskId}`, {
    text,
  });
  return response.data;
};

export const deleteExtraTask = async (entryId, taskId) => {
  const response = await http.delete(`/daily/${entryId}/tasks/${taskId}`);
  return response.data;
};

export const processEndOfDay = async (date, action) => {
  const response = await http.post("/daily/end-of-day", { date, action });
  return response.data;
};