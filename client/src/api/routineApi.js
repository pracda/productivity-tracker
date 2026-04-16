import http from "./http";

export const getRoutine = async (type) => {
  const response = await http.get(`/daily-routines/${type}`);
  return response.data;
};

export const updateRoutine = async (type, tasks) => {
  const response = await http.put(`/daily-routines/${type}`, { tasks });
  return response.data;
};
