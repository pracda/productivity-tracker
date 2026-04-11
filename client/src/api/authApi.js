import http from "./http";

export const googleLogin = async (credential) => {
  const response = await http.post("/auth/google", { credential });
  return response.data;
};

export const getAuthStatus = async () => {
  const response = await http.get("/auth/status");
  return response.data;
};