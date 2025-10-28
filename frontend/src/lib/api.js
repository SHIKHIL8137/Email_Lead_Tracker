import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL , withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("lt_user");
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
