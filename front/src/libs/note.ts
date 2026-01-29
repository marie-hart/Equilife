import type { DashboardNote } from "@/types/note";

const NOTES_STORAGE_KEY = "dashboardNotes";

export const loadNotes = (): DashboardNote[] => {
    try {
        const raw = localStorage.getItem(NOTES_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as DashboardNote[]) : [];
    } catch (error) {
        console.warn("Unable to load dashboard notes:", error);
        return [];
    }
};

export const saveNotes = (nextNotes: DashboardNote[]) => {
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextNotes));
    } catch (error) {
        console.warn("Unable to save dashboard notes:", error);
    }
};
