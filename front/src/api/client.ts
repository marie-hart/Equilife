import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const baseURL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
