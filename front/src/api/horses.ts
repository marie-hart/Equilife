import apiClient from "./client";
import type { Horse, CreateHorseDto, UpdateHorseDto } from "../types";

export const horsesApi = {
    getAll: async () => {
        const response = await apiClient.get<Horse[]>("/horses");
        return response.data;
    },
    getFirst: async () => {
        const response = await apiClient.get<Horse>("/horses/first");
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Horse>(`/horses/${id}`);
        return response.data;
    },
    create: async (data: CreateHorseDto) => {
        const response = await apiClient.post<Horse>("/horses", data);
        return response.data;
    },
    update: async (id: string, data: UpdateHorseDto) => {
        const response = await apiClient.put<Horse>(`/horses/${id}`, data);
        return response.data;
    },
    uploadPhoto: async (id: string, photo: File) => {
        const formData = new FormData();
        formData.append("photo", photo);
        const response = await apiClient.post<Horse>(
            `/horses/${id}/photo`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/horses/${id}`);
    },
};
