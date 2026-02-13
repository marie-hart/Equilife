import { horsesApi } from "@/api/horses";
import { getStoredHorseId, setStoredHorseId } from "@/libs/horseProfile";
import { CreateHorseDto, Horse } from "@/types";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useHorsesStore = defineStore('horses', () => {
    const horseId = ref(getStoredHorseId())
    const horses = ref<Horse[]>([]);

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
    return horses.value = await horsesApi.getAll();
};

async function loadHorseById(id: string): Promise<Horse | undefined> {
    let horse = horses.value.find(h => h.id === id);
    if (horse) return horse;

    horse = await horsesApi.getById(id);
        
    if (horse) {
        const index = horses.value.findIndex(h => h.id === id);
        if (index !== -1) horses.value[index] = horse;
        else horses.value.push(horse);
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

async function uploadHorsePhoto(id: string, file: File): Promise<void> {
    await horsesApi.uploadPhoto(id, file);
    // Recharger le cheval pour avoir la nouvelle URL de la photo
    await loadHorseById(id);
}

function sethorseId(id: string) {
    horseId.value = id
    setStoredHorseId(id)
}
    
})