import axios from "axios";

const api = axios.create({
  baseURL: "https://meetmind-production.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isDemo =
      typeof window !== "undefined" &&
      (localStorage.getItem("token") === "demo_token" ||
        document.cookie.includes("demo_session=true"));

    if (err.response?.status === 401 && !isDemo) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;