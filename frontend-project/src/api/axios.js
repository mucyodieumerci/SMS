import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true, // required for session cookies
  headers: { "Content-Type": "application/json" },
});

// Automatically redirect to /login on 401 responses
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default API;
