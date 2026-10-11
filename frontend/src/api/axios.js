import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  timeout: 10000,
});

let accessToken = null;
try {
  const stored = JSON.parse(sessionStorage.getItem("expensio.session") || "null");
  accessToken = stored?.token || null;
} catch { accessToken = null; }

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;