import apiClient from "./client";
import type { Event, CreateEventDto } from "../types";

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
};
