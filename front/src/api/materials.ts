import apiClient from "./client";
import type { Material, CreateMaterialDto } from "../types";

export const materialsApi = {
    getAll: async (includeInactive = false, horseId?: string) => {
        const params: Record<string, string | boolean> = { includeInactive };
        if (horseId) {
            params.horseId = horseId;
        }
        const response = await apiClient.get<Material[]>("/materials", {
            params,
        });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Material>(`/materials/${id}`);
        return response.data;
    },
    getDueForPurchase: async (horseId?: string) => {
        const response = await apiClient.get<Material[]>(
            "/materials/due-for-purchase",
            {
                params: horseId ? { horseId } : undefined,
            },
        );
        return response.data;
    },
    create: async (data: CreateMaterialDto) => {
        const response = await apiClient.post<Material>("/materials", data);
        return response.data;
    },
    update: async (
        id: string,
        data: Partial<CreateMaterialDto & { is_active?: boolean }>,
    ) => {
        const response = await apiClient.put<Material>(
            `/materials/${id}`,
            data,
        );
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/materials/${id}`);
    },
    markAsPurchased: async (id: string, purchaseDate?: string) => {
        const response = await apiClient.post<Material>(
            `/materials/${id}/purchase`,
            {
                purchaseDate,
            },
        );
        return response.data;
    },
};
