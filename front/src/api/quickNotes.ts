import apiClient from "./client";

export type QuickNoteDto = {
    id: string;
    horse_id: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export const quickNotesApi = {
    list: async (horseId: string) => {
        const response = await apiClient.get<QuickNoteDto[]>("/quick-notes", {
            params: { horseId },
        });
        return response.data;
    },
    create: async (horseId: string, content: string) => {
        const response = await apiClient.post<QuickNoteDto>("/quick-notes", {
            horse_id: horseId,
            content,
        });
        return response.data;
    },
    update: async (id: string, content: string) => {
        const response = await apiClient.patch<QuickNoteDto>(
            `/quick-notes/${id}`,
            { content },
        );
        return response.data;
    },
    remove: async (id: string) => {
        await apiClient.delete(`/quick-notes/${id}`);
    },
};
