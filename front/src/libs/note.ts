import { logger } from "@/services/LoggerService";
import type { DashboardNote } from "@/types/note";

const NOTES_STORAGE_KEY = "dashboardNotes";

const scopedNotesKey = (horseId?: string | null) =>
    horseId ? `${NOTES_STORAGE_KEY}:${horseId}` : NOTES_STORAGE_KEY;

export const loadNotes = (horseId?: string | null): DashboardNote[] => {
    try {
        const raw = localStorage.getItem(scopedNotesKey(horseId));
        return raw ? (JSON.parse(raw) as DashboardNote[]) : [];
    } catch (error) {
        logger.warn("Unable to load dashboard notes:", error);
        return [];
    }
};

export const saveNotes = (
    nextNotes: DashboardNote[],
    horseId?: string | null,
) => {
    try {
        localStorage.setItem(scopedNotesKey(horseId), JSON.stringify(nextNotes));
    } catch (error) {
        logger.warn("Unable to save dashboard notes:", error);
    }
};
