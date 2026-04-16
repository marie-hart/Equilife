import apiClient from "./client";
import type { Event, CreateEventDto, CareHistoryEntry, CareType } from "../types";

export const eventsApi = {
    getAll: async (horseId?: string) => {
        const response = await apiClient.get<Event[]>("/events", {
            params: horseId ? { horseId } : undefined,
        });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Event>(`/events/${id}`);
        return response.data;
    },
    getReminders: async (horseId?: string) => {
        const response = await apiClient.get<Event[]>("/events/reminders", {
            params: horseId ? { horseId } : undefined,
        });
        return response.data;
    },
    getCareTypes: async () => {
        const response = await apiClient.get<CareType[]>("/events/care-types");
        return response.data;
    },
    createCareType: async (data: { name: string; category: string }) => {
        const response = await apiClient.post<CareType>("/events/care-types", data);
        return response.data;
    },
    toggleCareTypeFavorite: async (data: {
        name: string;
        category: string;
        is_favorite: boolean;
    }) => {
        const response = await apiClient.post<CareType>(
            "/events/care-types/favorite",
            data,
        );
        return response.data;
    },
    deleteCareType: async (name: string) => {
        await apiClient.delete(`/events/care-types/${encodeURIComponent(name)}`);
    },
    create: async (data: CreateEventDto) => {
        const response = await apiClient.post<Event>("/events", data);
        return response.data;
    },
    update: async (id: string, data: Partial<CreateEventDto>) => {
        const response = await apiClient.put<Event>(`/events/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/events/${id}`);
    },
    markCareDone: async (id: string, eventDate: string): Promise<CareHistoryEntry> => {
        const response = await apiClient.post<CareHistoryEntry>(
            `/events/${id}/mark-done`,
            { event_date: eventDate },
        );
        return response.data;
    },
    uploadAttachment: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post<Event>(
            `/events/${id}/attachment`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
        return response.data;
    },
    deleteAttachment: async (id: string) => {
        await apiClient.delete(`/events/${id}/attachment`);
    },
};

export const careHistoryApi = {
    getAll: async (horseId?: string): Promise<CareHistoryEntry[]> => {
        const response = await apiClient.get<CareHistoryEntry[]>("/care-history", {
            params: horseId ? { horseId } : undefined,
        });
        return response.data;
    },
};
