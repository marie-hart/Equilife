<template>
    <v-container fluid class="pa-4">
        <div class="d-flex align-center justify-space-between ga-4 mb-6">
            <v-card-title class="ma-0 d-flex align-center ga-2 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                <font-awesome-icon icon="horse" class="fa-icon me-2" />
                {{ isEdit ? "Modifier un cheval" : "Ajouter un cheval" }}
            </v-card-title>
        </div>

        <v-card 
            class="w-100 pa-2" 
            variant="flat" 
            rounded="lg" 
            :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
        >
            <v-divider :style="{ borderColor: '#efe5d9' }" />
            <v-card-text class="mt-4">
                <v-skeleton-loader
                    v-if="isLoading"
                    type="card, list-item-two-line"
                />
                <v-row v-else dense>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="form.name"
                            label="Nom *"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                            required
                            :error-messages="
                                fieldErrors.name
                                    ? [fieldErrors.name]
                                    : undefined
                            "
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-file-input
                            label="Photo"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            accept="image/*"
                            :multiple="false"
                            @update:model-value="handleFileChange"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="form.sex"
                            :items="sexOptions"
                            label="Sexe"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            clearable
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <DatePickerField
                            v-model="form.birth_date"
                            label="Date de naissance"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="form.breed"
                            :items="breedOptions"
                            label="Race"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            clearable
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="form.coat"
                            :items="coatOptions"
                            label="Robe"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            clearable
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="form.stable_location"
                            label="Écurie / Lieu"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="form.feed"
                            label="Alimentation"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            rows="2"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="form.additional_info"
                            label="Note libre"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            rounded="lg"
                            rows="3"
                        />
                    </v-col>
                </v-row>
                <div class="d-flex align-center justify-end ga-3 mt-6 flex-wrap">
                      <v-btn 
                        variant="outlined" 
                        :to="{ name: 'Horses'}"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        Annuler
                    </v-btn>
                    <v-btn
                        class="text-none"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                        variant="flat"
                        rounded="lg"
                        :loading="isSubmitting"
                        type="button"
                        @click="handleSubmit"
                    >
                        {{
                            isSubmitting
                                ? "Enregistrement..."
                                : isEdit
                                  ? "Mettre à jour"
                                  : "Créer"
                        }}
                    </v-btn>
                    <span v-if="formError" class="text-error text-caption">{{
                        formError
                    }}</span>
                </div>
            </v-card-text>
        </v-card>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="2500"
        >
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"; 
import { useRouter } from "vue-router";
import { useHorsesStore } from "@/stores/HorsesStore";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { CreateHorseDto } from "@/types";
import { setStoredHorsePhoto } from "@/libs/horseProfile";

const props = defineProps<{
    horseId?: string; 
}>();

const router = useRouter();
const horsesStore = useHorsesStore();
const isSubmitting = ref(false);
const isLoading = ref(true);
const formError = ref("");
const selectedPhoto = ref<File | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const isEdit = computed(() => Boolean(props.horseId));

const form = ref<CreateHorseDto>({
    name: "",
    sex: undefined,
    breed: "",
    coat: "",
    birth_date: "",
    stable_location: "",
    feed: "",
    additional_info: "",
});

const sexOptions = ["Jument", "Hongre", "Etalon"];

const breedOptions = [
    "Pur-sang",
    "Pur-sang arabe",
    "Anglo-arabe",
    "Selle Français",
    "Trotteur français",
    "Haflinger",
    "Frison",
    "Quarter Horse",
    "Paint Horse",
    "Appaloosa",
    "Connemara",
    "Irish Cob",
    "Poney français de selle",
    "Lusitanien",
    "Andalou",
    "Autre",
];

const coatOptions = [
    "Alezan",
    "Bai",
    "Noir",
    "Gris",
    "Isabelle",
    "Palomino",
    "Souris",
    "Cremello",
    "Pie",
    "Rouan",
    "Autre",
];

const handleFileChange = async (files: File[] | File | null) => {
    let file = null;
    if (Array.isArray(files)) {
        file = files[0] || null;
    } else {
        file = files || null;
    }

    if (file) {
        selectedPhoto.value = file;
        // 2. Convertir et stocker dans localStorage ici
        try {
            const base64 = await fileToBase64(file);
            // On peut stocker temporairement ici ou attendre la soumission
            // Pour être sûr d'avoir le bon ID, attendons la soumission (handleSubmit)
        } catch (error) {
            console.error("Error converting file to base64", error);
        }
    } else {
        selectedPhoto.value = null;
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const loadHorse = async () => {
    isLoading.value = true;
    
    if (!props.horseId) {
        isLoading.value = false;
        return;
    }
    try {
        const horse = await horsesStore.loadHorseById(props.horseId);
        if (horse) {
            form.value = {
                name: horse.name,
                sex: horse.sex,
                breed: horse.breed || "",
                coat: horse.coat || "",
                birth_date: horse.birth_date || "",
                stable_location: horse.stable_location || "",
                feed: horse.feed || "",
                additional_info: horse.additional_info || "",
            };
            
            horsesStore.sethorseId(props.horseId);
        }
    } catch (error) {
        console.error("Error loading horse:", error);
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    formError.value = "";
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "name", label: "un nom", value: form.value.name.trim() },
    ]);
    fieldErrors.value = errors;
    if (firstError) {
        formError.value = firstError;
        return;
    }

    try {
        isSubmitting.value = true;
        
        const payload = {
            name: form.value.name.trim(),
            sex: form.value.sex || undefined,
            breed: form.value.breed?.trim() || undefined,
            coat: form.value.coat?.trim() || undefined,
            birth_date: form.value.birth_date || undefined,
            stable_location: form.value.stable_location?.trim() || undefined,
            feed: form.value.feed?.trim() || undefined,
            additional_info: form.value.additional_info?.trim() || undefined,
        };

        let savedHorseId: string;

       if (props.horseId) {
            // Mode Modification
            await horsesStore.updateHorse(props.horseId, payload);
            savedHorseId = props.horseId; // 2. Assignation
        } else {
            // Mode Création
            const newHorse = await horsesStore.createHorse(payload);
            savedHorseId = newHorse.id; // 2. Assignation
        }

        // 3. Utilisation de savedHorseId ici
        if (selectedPhoto.value) {
            // Uploadez et gérez le localStorage via le store
            await horsesStore.uploadHorsePhoto(savedHorseId, selectedPhoto.value);
        }
        
        snackbar.value = {
            show: true,
            message: isEdit.value ? "Cheval mis à jour." : "Cheval créé.",
            color: "success",
        };

        setTimeout(() => {
            router.push({ name: "HorseDetails", params: { id: savedHorseId } });
        }, 800);
    } catch (error) {
        console.error("Error saving horse:", error);
        formError.value = "Impossible d'enregistrer le cheval.";
        snackbar.value = {
            show: true,
            message: "Enregistrement impossible.",
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
   
        router.push("/horses");
    
};

onMounted(async () => {
    await loadHorse();
});

watch(() => props.horseId, () => {
    loadHorse();
});
</script>