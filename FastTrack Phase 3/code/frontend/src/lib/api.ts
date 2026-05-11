import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Network/CORS errors get a friendlier message
    if (!err.response) {
      err.message = "Cannot reach the server. Is the backend running on " + baseURL + "?";
    }
    return Promise.reject(err);
  }
);
