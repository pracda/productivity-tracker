import http from "./http";

export const getAnalytics = async () => {
  const response = await http.get("/analytics");
  return response.data;
};