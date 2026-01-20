import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const filesBaseOverride = import.meta.env.VITE_API_PROXY_TARGET || "";
const baseURL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
export const apiBaseUrl = baseURL;
export const filesBaseUrl = filesBaseOverride || apiBaseUrl;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
