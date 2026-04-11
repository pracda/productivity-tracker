import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("productivity_auth");

    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (error) {
    console.error("Failed to attach auth token", error);
  }

  return config;
});

export default http;