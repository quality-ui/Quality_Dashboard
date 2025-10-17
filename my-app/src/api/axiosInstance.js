import axios from "axios";

// Automatically switch between local and deployed backend
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://checklist-backend-alpha.vercel.app");

// Create Axios instance without /api here
const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
