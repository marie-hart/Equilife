import { horsesApi } from "@/api/horses";
import {
    cacheHorsePhotoFromUrl,
    getStoredHorseId,
    getStoredHorsePhoto,
    setStoredHorseId,
    setStoredHorsePhoto,
    clearStoredHorseId,
} from "@/libs/horseProfile";
import { logger } from "@/services/LoggerService";
import { CreateHorseDto, Horse } from "@/types";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface HorseWithPhoto extends Horse {
    photoBase64?: string | null;
}

export const useHorsesStore = defineStore('horses', () => {
    const horseId = ref(getStoredHorseId())
    const horses = ref<HorseWithPhoto[]>([]);

    const enrichHorseWithStoredPhoto = (horse: Horse): HorseWithPhoto => {
        const cachedPhoto = getStoredHorsePhoto(horse.id);
        return {
            ...horse,
            photoBase64: horse.photoBase64 ?? cachedPhoto,
        };
    };

    const warmHorsePhotoCache = (items: HorseWithPhoto[]) => {
        void Promise.all(
            items.map(async (horse) => {
                if (horse.photoBase64 || !horse.photo_path) return;
                const cached = await cacheHorsePhotoFromUrl(
                    horse.id,
                    horse.photo_path,
                );
                if (!cached) return;
                const index = horses.value.findIndex((h) => h.id === horse.id);
                if (index !== -1) {
                    horses.value[index] = {
                        ...horses.value[index],
                        photoBase64: cached,
                    };
                }
            }),
        );
    };

    const horseOptions = computed(() =>
        horses.value.map((h) => ({ title: h.name, value: h.id })),
    );
      const horseById = computed(
        () => new Map(horses.value.map((horse) => [horse.id, horse])),
    );

    const horseFilterOptions = computed(() => [
        { title: "Tous les chevaux", value: "all" },
        ...horseOptions.value,
    ]);

    const selectedHorse = computed(() => {
        if (!horseId.value) return null;
        return horses.value.find(h => h.id === horseId.value) || null;
    });

    return {
        horseId,
        horses,
        horseOptions,
        horseById,
        horseFilterOptions,
        selectedHorse,
        getHorseNameById,
        getHorseName,
        loadHorses,
        sethorseId,
        loadHorseById,
        updateHorse,
        uploadHorsePhoto,
        createHorse,
        deleteHorse,
        resetHorseContext,
    }

    function getHorseNameById(id?: string): string {
        if (!id) return "Cheval inconnu";
        return horseById.value.get(id)?.name ?? "Cheval inconnu";
    }
        

    function getHorseName() {
        if (!horseId.value) {
            return "Cheval inconnu";
        }
            return horseById.value.get(horseId.value)?.name ?? "Cheval inconnu";
    };

    async function loadHorses() {
            const data = await horsesApi.getAll();
            horses.value = data.map(enrichHorseWithStoredPhoto);
            warmHorsePhotoCache(horses.value);
            const validIds = new Set(data.map((h) => h.id));
            if (data.length === 0) {
                if (horseId.value) {
                    sethorseId(null);
                }
            } else if (!horseId.value || !validIds.has(horseId.value)) {
                sethorseId(data[0].id);
            }
            return horses.value;
    };

    async function loadHorseById(id: string): Promise<HorseWithPhoto | undefined> {
            let horse = horses.value.find(h => h.id === id);
            
            if (!horse) {
                const apiHorse = await horsesApi.getById(id);
                if (apiHorse) {
                    horse = enrichHorseWithStoredPhoto(apiHorse);
                    const index = horses.value.findIndex(h => h.id === id);
                    if (index !== -1) horses.value[index] = horse;
                    else horses.value.push(horse);
                    warmHorsePhotoCache([horse]);
                }
            } else {
                const index = horses.value.findIndex(h => h.id === id);
                horses.value[index] = enrichHorseWithStoredPhoto(horse);
            }
            
            return horse;
    }

    async function createHorse(data: CreateHorseDto): Promise<Horse> {
        const newHorse = await horsesApi.create(data);
        const enriched = enrichHorseWithStoredPhoto(newHorse);
        horses.value.push(enriched);
        warmHorsePhotoCache([enriched]);
        return newHorse;
    }

    async function updateHorse(id: string, data: CreateHorseDto): Promise<Horse> {
        const updatedHorse = await horsesApi.update(id, data);
        const index = horses.value.findIndex(h => h.id === id);
        const enriched = enrichHorseWithStoredPhoto(updatedHorse);
        if (index !== -1) horses.value[index] = enriched;
        warmHorsePhotoCache([enriched]);
        return updatedHorse;
    }

    async function deleteHorse(idToDelete: string) {
        await horsesApi.delete(idToDelete);

        horses.value = horses.value.filter((h) => h.id !== idToDelete);
        if (horseId.value === idToDelete) {
            sethorseId(horses.value.length > 0 ? horses.value[0].id : null);
        }
    }

    function sethorseId(id: string | null) {
        horseId.value = id;
        if (id) {
            setStoredHorseId(id);
        } else {
            clearStoredHorseId();
        }

        horses.value = horses.value.map(enrichHorseWithStoredPhoto);
    }

    function resetHorseContext() {
        horses.value = [];
        sethorseId(null);
    }

    async function uploadHorsePhoto(id: string, file: File): Promise<void> {
        try {
            const updatedHorse = await horsesApi.uploadPhoto(id, file);
            const base64String = await fileToDataUrl(file);
            setStoredHorsePhoto(id, base64String);

            const enriched = {
                ...enrichHorseWithStoredPhoto(updatedHorse),
                photoBase64: base64String,
            };
            const horseIndex = horses.value.findIndex((h) => h.id === id);
            if (horseIndex !== -1) {
                horses.value[horseIndex] = enriched;
            } else {
                horses.value.push(enriched);
            }
        } catch (error) {
            logger.error("Erreur upload photo:", error);
            throw error;
        }   
}

    function fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () =>
                reject(reader.error || new Error("Impossible de lire l'image"));
            reader.readAsDataURL(file);
        });
    }

})