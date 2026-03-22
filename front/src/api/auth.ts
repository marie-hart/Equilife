import apiClient from "./client";

export type AuthStatus = {
    authRequired: boolean;
};

export type LoginResponse = {
    token: string;
};

export const authApi = {
    getStatus: async () => {
        const response = await apiClient.get<AuthStatus>("/auth/status");
        return response.data;
    },
    login: async (pin: string) => {
        const response = await apiClient.post<LoginResponse>("/auth/login", {
            pin: pin.trim(),
        });
        return response.data;
    },
};
