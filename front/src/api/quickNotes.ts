import apiClient from "./client";

export type QuickNoteDto = {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export const quickNotesApi = {
    list: async () => {
        const response = await apiClient.get<QuickNoteDto[]>("/quick-notes");
        return response.data;
    },
    create: async (content: string) => {
        const response = await apiClient.post<QuickNoteDto>("/quick-notes", {
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
