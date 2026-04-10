import http from "./http";

export const getPersonalTasks = async () => {
  const response = await http.get("/personal-tasks");
  return response.data;
};

export const updatePersonalTasks = async (tasks) => {
  const response = await http.put("/personal-tasks", { tasks });
  return response.data;
};

export const getDailyTemplate = async (weekday) => {
  const response = await http.get(`/daily-templates/${weekday}`);
  return response.data;
};

export const updateDailyTemplate = async (weekday, tasks) => {
  const response = await http.put(`/daily-templates/${weekday}`, { tasks });
  return response.data;
};