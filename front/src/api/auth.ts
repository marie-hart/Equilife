import apiClient from "./client";

export type AuthMode = "none" | "user";

export type AuthStatus = {
    authRequired: boolean;
    authMode: AuthMode;
};

export type AuthUser = { id: string; email: string };

export type LoginResponse = {
    token: string;
    user: AuthUser;
};

export type RegisterResponse = {
    token: string;
    user: AuthUser;
};

export const authApi = {
    getStatus: async () => {
        const response = await apiClient.get<AuthStatus>("/auth/status");
        return response.data;
    },
    getMe: async () => {
        const response = await apiClient.get<AuthUser>("/auth/me");
        return response.data;
    },
    loginWithPassword: async (email: string, password: string) => {
        const response = await apiClient.post<LoginResponse>("/auth/login", {
            email: email.trim(),
            password,
        });
        return response.data;
    },
    register: async (email: string, password: string) => {
        const response = await apiClient.post<RegisterResponse>("/auth/register", {
            email: email.trim(),
            password,
        });
        return response.data;
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        await apiClient.post("/auth/change-password", {
            currentPassword,
            newPassword,
        });
    },
};
