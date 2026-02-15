import { horsesApi } from "@/api/horses";
import { getStoredHorseId, getStoredHorsePhoto, setStoredHorseId, setStoredHorsePhoto } from "@/libs/horseProfile";
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
        if (horse.id === horseId.value) {
            return {
                ...horse,
                photoBase64: getStoredHorsePhoto()
            };
        }
        return horse;
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
        // 4. Enrichir tous les chevaux chargés
        horses.value = data.map(enrichHorseWithStoredPhoto);
        return horses.value;
};

async function loadHorseById(id: string): Promise<HorseWithPhoto | undefined> {
        let horse = horses.value.find(h => h.id === id);
        
        // Si pas en mémoire, charger du back
        if (!horse) {
            const apiHorse = await horsesApi.getById(id);
            if (apiHorse) {
                horse = enrichHorseWithStoredPhoto(apiHorse);
                const index = horses.value.findIndex(h => h.id === id);
                if (index !== -1) horses.value[index] = horse;
                else horses.value.push(horse);
            }
        } else {
            // Si déjà en mémoire, s'assurer que le base64 est à jour
            const index = horses.value.findIndex(h => h.id === id);
            horses.value[index] = enrichHorseWithStoredPhoto(horse);
        }
        
        return horse;
}

async function createHorse(data: CreateHorseDto): Promise<Horse> {
    const newHorse = await horsesApi.create(data);
    horses.value.push(newHorse);
    return newHorse;
}

async function updateHorse(id: string, data: CreateHorseDto): Promise<Horse> {
    const updatedHorse = await horsesApi.update(id, data);
    const index = horses.value.findIndex(h => h.id === id);
    if (index !== -1) horses.value[index] = updatedHorse;
    return updatedHorse;
}

async function deleteHorse(horseId: string) {
    await horsesApi.delete(horseId);

    horses.value = horses.value.filter((h) => h.id !== horseId);
}

function sethorseId(id: string | null) {
    horseId.value = id;
    setStoredHorseId(id || '');
        
    // 6. Lors du changement d'ID, rafraîchir les photos
    horses.value = horses.value.map(enrichHorseWithStoredPhoto);
}

    // 4. Modifier l'action uploadHorsePhoto
    async function uploadHorsePhoto(id: string, file: File): Promise<void> {
        // Uploader vers le backend
        await horsesApi.uploadPhoto(id, file);

        // Convertir en Base64 pour le localStorage
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            setStoredHorsePhoto(base64String);
            
            // 5. Mettre à jour directement dans le store
            const horseIndex = horses.value.findIndex(h => h.id === id);
            if (horseIndex !== -1) {
                horses.value[horseIndex].photoBase64 = base64String;
            }
        };

        // Recharger les données pour avoir la nouvelle URL back
        await loadHorseById(id);
    }
    
})