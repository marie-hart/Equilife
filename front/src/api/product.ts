import apiClient from "./client";
import type { Product, CreateProductDto } from "../types";

export const productApi = {
    getAll: async (includeInactive = false, horseId?: string) => {
        const params: Record<string, string | boolean> = { includeInactive };
        if (horseId) params.horseId = horseId;
        // Correction URL: /products
        const response = await apiClient.get<Product[]>("/products", { params });
        return response.data;
    },
    getById: async (id: string) => {
        // Correction URL: /products/${id}
        const response = await apiClient.get<Product>(`/products/${id}`);
        return response.data;
    },
    getDueForPurchase: async (horseId?: string) => {
        const response = await apiClient.get<Product[]>("/products/due-for-purchase", {
            params: horseId ? { horseId } : undefined,
        });
        return response.data;
    },
    create: async (data: CreateProductDto) => {
        // Correction URL: /products
        const response = await apiClient.post<Product>("/products", data);
        return response.data;
    },
    update: async (id: string, data: Partial<CreateProductDto & { is_active?: boolean }>) => {
        // Correction URL: /products/${id}
        const response = await apiClient.put<Product>(`/products/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        // Correction URL: /products/${id}
        await apiClient.delete(`/products/${id}`);
    },
    markAsPurchased: async (id: string, purchaseDate?: string) => {
        // Correction URL: /products/${id}/purchase
        const response = await apiClient.post<Product>(`/products/${id}/purchase`, {
            purchaseDate,
        });
        return response.data;
    },
};