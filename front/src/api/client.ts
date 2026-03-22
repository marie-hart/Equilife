import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const filesBaseOverride = import.meta.env.VITE_API_PROXY_TARGET || "";
const baseURL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
export const apiBaseUrl = baseURL;
export const filesBaseUrl = filesBaseOverride || apiBaseUrl;

const TOKEN_KEY = "equilife_token";

const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            sessionStorage.removeItem(TOKEN_KEY);
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
            }
        }
        return Promise.reject(err);
    }
);

export default apiClient;
