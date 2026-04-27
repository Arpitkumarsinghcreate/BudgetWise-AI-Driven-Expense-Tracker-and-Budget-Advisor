import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://budgetwise-ai-production.up.railway.app"
});

client.interceptors.request.use((config) => {
  const url = config.url || "";
  if (url.startsWith("/api/auth")) return config;
  const token = localStorage.getItem("authToken");
  if (!token) {
    return Promise.reject(new Error("Missing auth token"));
  }
  config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Do not auto-redirect on 401; let pages handle and show error banners
    return Promise.reject(err);
  }
);

export default client;
