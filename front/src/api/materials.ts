import apiClient from "./client";
import type { Product, CreateProductDto } from "../types";

export const materialsApi = {
    getAll: async (includeInactive = false, horseId?: string) => {
        const params: Record<string, string | boolean> = { includeInactive };
        if (horseId) {
            params.horseId = horseId;
        }
        const response = await apiClient.get<Product[]>("/materials", {
            params,
        });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Product>(`/materials/${id}`);
        return response.data;
    },
    getDueForPurchase: async (horseId?: string) => {
        const response = await apiClient.get<Product[]>(
            "/materials/due-for-purchase",
            {
                params: horseId ? { horseId } : undefined,
            },
        );
        return response.data;
    },
    create: async (data: CreateProductDto) => {
        const response = await apiClient.post<Product>("/materials", data);
        return response.data;
    },
    update: async (
        id: string,
        data: Partial<CreateProductDto & { is_active?: boolean }>,
    ) => {
        const response = await apiClient.put<Product>(
            `/materials/${id}`,
            data,
        );
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/materials/${id}`);
    },
    markAsPurchased: async (id: string, purchaseDate?: string) => {
        const response = await apiClient.post<Product>(
            `/materials/${id}/purchase`,
            {
                purchaseDate,
            },
        );
        return response.data;
    },
};
