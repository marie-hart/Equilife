import axios from "axios";

/**
 * Le backend monte les routes sous `/api/*`. Si `VITE_API_BASE_URL` est une origine
 * seule (ex. `https://api.equilife.ovh`), on ajoute `/api` pour éviter les 404.
 */
function normalizeApiBaseUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "/api";
    const noTrailingSlash = trimmed.replace(/\/+$/, "");
    if (noTrailingSlash.startsWith("/")) {
        return noTrailingSlash;
    }
    try {
        const u = new URL(noTrailingSlash);
        const pathOnly = (u.pathname.replace(/\/+$/, "") || "/") as string;
        if (pathOnly === "/") {
            return `${noTrailingSlash}/api`;
        }
        return noTrailingSlash;
    } catch {
        return noTrailingSlash;
    }
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const filesBaseOverride = import.meta.env.VITE_API_PROXY_TARGET || "";
const baseURL = normalizeApiBaseUrl(rawBaseUrl);
export const apiBaseUrl = baseURL;

/** Origine de l’API pour `/uploads/...` (hors préfixe `/api`). */
function apiOriginForUploads(apiBase: string): string {
    if (apiBase.startsWith("http")) {
        try {
            return new URL(apiBase).origin;
        } catch {
            return apiBase;
        }
    }
    return apiBase;
}

export const filesBaseUrl = filesBaseOverride || apiOriginForUploads(baseURL);

const TOKEN_KEY = "equilife_token";
const USER_EMAIL_KEY = "equilife_user_email";

const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_EMAIL_KEY);
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/login") &&
                !window.location.pathname.includes("/register")
            ) {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
            }
        }
        return Promise.reject(err);
    }
);

export default apiClient;
