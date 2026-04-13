import { logger } from "@/services/LoggerService";
import { filesBaseUrl } from "@/api/client";

const SELECTED_HORSE_ID_KEY = "selectedHorseId";
const photoCacheInflight = new Map<string, Promise<string | null>>();
export const DEFAULT_HORSE_AVATAR = "/avatar.png";

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
};

export const clearStoredHorseId = () => {
    try {
        localStorage.removeItem(SELECTED_HORSE_ID_KEY);
    } catch (error) {
        logger.warn("Unable to clear selected horse from storage:", error);
    }
};

export const resolveHorsePhotoUrl = (photoPath?: string | null): string | undefined => {
    if (!photoPath) return undefined;
    const trimmed = photoPath.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (/^https?:\/\//i.test(filesBaseUrl)) {
        return `${filesBaseUrl.replace(/\/+$/, "")}${normalizedPath}`;
    }
    return normalizedPath;
};


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

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () =>
            reject(reader.error || new Error("Unable to convert image to data URL"));
        reader.readAsDataURL(blob);
    });
}

/**
 * Cache localement la photo distante d'un cheval après 1er chargement réussi.
 * Retourne la photo base64 mise en cache ou déjà présente.
 */
export const cacheHorsePhotoFromUrl = async (
    horseId: string,
    photoUrl?: string | null,
): Promise<string | null> => {
    const existing = getStoredHorsePhoto(horseId);
    if (existing) return existing;
    if (!photoUrl) return null;

    const inflightKey = `${horseId}:${photoUrl}`;
    const inflight = photoCacheInflight.get(inflightKey);
    if (inflight) return inflight;

    const task = (async () => {
        try {
            const response = await fetch(photoUrl, { cache: "force-cache" });
            if (!response.ok) return null;
            const blob = await response.blob();
            if (!blob.size) return null;
            const dataUrl = await blobToDataUrl(blob);
            setStoredHorsePhoto(horseId, dataUrl);
            return dataUrl;
        } catch (error) {
            logger.warn(`Unable to cache horse photo for ID ${horseId}:`, error);
            return null;
        } finally {
            photoCacheInflight.delete(inflightKey);
        }
    })();

    photoCacheInflight.set(inflightKey, task);
    return task;
};


