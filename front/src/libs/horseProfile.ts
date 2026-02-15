const SELECTED_HORSE_ID_KEY = "selectedHorseId";
const SELECTED_HORSE_PHOTO_KEY = "selectedHorsePhoto";

export const getStoredHorseId = () => {
    try {
        return localStorage.getItem(SELECTED_HORSE_ID_KEY)
    } catch (error) {
        console.warn("Unable to read selected horse from storage:", error);
        return null;
    }
};

export const getActiveHorseId = (horseId?: string) =>
    horseId || getStoredHorseId() || undefined;

export const setStoredHorseId = (id: string) => {
    try {
        localStorage.setItem(SELECTED_HORSE_ID_KEY, id);
    } catch (error) {
        console.warn("Unable to set horse from storage:", error);
     
    }
}

export const getStoredHorsePhoto = () => {
    try {
        return localStorage.getItem(SELECTED_HORSE_PHOTO_KEY);
    } catch (error) {
        console.warn("Unable to read horse photo from storage:", error);
        return null;
    }
};

export const setStoredHorsePhoto = (photoBase64: string | null) => {
    try {
        if (photoBase64) {
            localStorage.setItem(SELECTED_HORSE_PHOTO_KEY, photoBase64);
        } else {
            localStorage.removeItem(SELECTED_HORSE_PHOTO_KEY);
        }
    } catch (error) {
        console.warn("Unable to set horse photo in storage:", error);
    }
};


