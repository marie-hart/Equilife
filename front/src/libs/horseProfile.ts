import { logger } from "@/services/LoggerService";

const SELECTED_HORSE_ID_KEY = "selectedHorseId";
const SELECTED_HORSE_PHOTO_KEY = "selectedHorsePhoto";

export const getStoredHorseId = () => {
    try {
        return localStorage.getItem(SELECTED_HORSE_ID_KEY)
    } catch (error) {
        logger.warn("Unable to read selected horse from storage:", error);
        return null;
    }
};

export const getActiveHorseId = (horseId?: string) =>
    horseId || getStoredHorseId() || undefined;

export const setStoredHorseId = (id: string) => {
    try {
        localStorage.setItem(SELECTED_HORSE_ID_KEY, id);
    } catch (error) {
        logger.warn("Unable to set horse from storage:", error);
    }
}


const getHorsePhotoKey = (horseId: string) => `horse_photo_${horseId}`;

export const setStoredHorsePhoto = (horseId: string, photoBase64: string | null) => {
    try {
        const key = getHorsePhotoKey(horseId);
        if (photoBase64) {
            localStorage.setItem(key, photoBase64);
        } else {
            localStorage.removeItem(key);
        }
    } catch (error) {
        logger.warn(`Unable to set horse photo for ID ${horseId} in storage:`, error);
    }
};

export const getStoredHorsePhoto = (horseId: string): string | null => {
    try {
        return localStorage.getItem(getHorsePhotoKey(horseId));
    } catch {
        return null;
    }
};


