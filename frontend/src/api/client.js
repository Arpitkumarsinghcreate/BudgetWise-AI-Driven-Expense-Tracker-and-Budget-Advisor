import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080",
});

client.interceptors.request.use((config) => {
  const url = config.url || "";
  if (url.startsWith("/api/auth")) return config;
  const token = localStorage.getItem("authToken");
  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return Promise.reject(new axios.Cancel("Missing auth token"));
  }
  config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
