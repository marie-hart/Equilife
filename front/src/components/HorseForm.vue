<template>
    <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
        <v-container>
            <div class="d-flex align-center justify-space-between mb-6 mt-2">
                <div class="d-flex align-center">
                    <div>
                        <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                            {{ isEdit ? "Modifier" : "Nouveau compagnon" }}
                        </h1>
                        <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
                    </div>
                </div>
                <v-btn 
                    variant="text" 
                    icon="mdi-close"
                    color="#2E4B36"
                    @click="router.push({ name: 'Horses' })"
                ></v-btn>
            </div>

            <v-card variant="flat" rounded="xl" class="pa-6 pa-md-10 shadow-subtle border-light bg-white">
                <v-skeleton-loader v-if="isLoading" type="article, actions" />
                
                <v-form v-else ref="formRef" @submit.prevent="handleSubmit">
                    <v-row>
                        <v-col cols="12">
                            <div class="text-overline mb-4" style="color: #7B5B3E">Identité & Photo</div>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.name"
                                label="Nom du cheval *"
                                placeholder="Ex: Epona"
                                density="comfortable"
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                persistent-placeholder
                                :rules="[rules.required]"
                                :error-messages="fieldErrors.name ? [fieldErrors.name] : undefined"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-file-input
                                label="Photo de profil"
                                variant="outlined"
                                density="comfortable"
                                color="#2E4B36"
                                rounded="lg"
                                accept="image/*"
                                prepend-icon="mdi-camera"
                                @update:model-value="handleFileChange"
                            />
                            <p v-if="photoDisplayName" class="text-caption mt-2 mb-0" style="color: #7B5B3E;">
                                <v-icon size="14" class="me-1">mdi-check-circle</v-icon>
                                {{ photoDisplayName }}
                            </p>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select
                                v-model="form.sex"
                                :items="sexOptions"
                                label="Sexe"
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                :clearable="!!form.sex"
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <DatePickerField
                                v-model="form.birth_date"
                                label="Date de naissance"
                                color="#2E4B36"
                                rounded="lg"
                                :clearable="!!form.birth_date"
                                :rules="[rules.isPast]"
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select
                                v-model="form.breed"
                                :items="breedOptions"
                                label="Race"
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                :clearable="!!form.breed"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.coat"
                                :items="coatOptions"
                                label="Robe"
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                :clearable="!!form.coat"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.stable_location"
                                label="Lieu / Écurie"
                                placeholder="Où réside-t-il ?"
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="form.feed"
                                label="Régime alimentaire"
                                placeholder="Foin, granulés, compléments..."
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                rows="2"
                                auto-grow
                                @keydown.enter.prevent
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="form.additional_info"
                                label="Notes libres"
                                placeholder="Caractère, particularités physiques..."
                                variant="outlined"
                                color="#2E4B36"
                                rounded="lg"
                                rows="3"
                                @keydown.enter.prevent
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-8" />
                    
                    <div class="d-flex flex-column flex-sm-row align-center justify-end ga-4">
                        <v-btn 
                            variant="text" 
                            color="#554338"
                            class="text-none font-weight-bold order-2 order-sm-1"
                            @click="router.push({ name: 'Horses' })"
                        >
                            Annuler
                        </v-btn>
                        
                        <v-btn
                            type="submit"
                            color="#2E4B36"
                            variant="flat"
                            rounded="xl"
                            size="large"
                            class="text-none font-weight-bold px-10 shadow-subtle order-1 order-sm-2"
                            :loading="isSubmitting"
                        >
                            {{ isEdit ? "Mettre à jour la fiche" : "Enregistrer le cheval" }}
                        </v-btn>
                    </div>

                    <div v-if="formError" class="text-error text-caption text-center mt-4">
                        {{ formError }}
                    </div>
                </v-form>
            </v-card>
        </v-container>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg">
            {{ snackbar.message }}
        </v-snackbar>
    </v-sheet>
</template>

<style scoped>
.shadow-subtle {
    box-shadow: 0 10px 30px rgba(46, 75, 54, 0.08) !important;
}
.border-light {
    border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
.text-overline {
    letter-spacing: 2px !important;
    font-weight: 800 !important;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"; 
import { useRouter } from "vue-router";
import { logger } from "@/services/LoggerService";
import { useHorsesStore } from "@/stores/HorsesStore";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { CreateHorseDto } from "@/types";
import type { VForm } from "vuetify/components";

const props = defineProps<{
    horseId?: string; 
}>();

const router = useRouter();
const horsesStore = useHorsesStore();
const isSubmitting = ref(false);
const isLoading = ref(true);
const formError = ref("");
const selectedPhoto = ref<File | null>(null);
const existingPhotoPath = ref<string | undefined>(undefined);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const isEdit = computed(() => Boolean(props.horseId));

const photoDisplayName = computed(() => {
    if (selectedPhoto.value) {
        return `Nouvelle photo : ${selectedPhoto.value.name}`;
    }
    if (existingPhotoPath.value) {
        const filename = existingPhotoPath.value.split(/[/\\]/).pop() || existingPhotoPath.value;
        return `Photo actuelle : ${filename}`;
    }
    return "";
});

const rules = {
    required: (v: any) => !!v || "Ce champ est obligatoire",
    isPast: (v: string) => {
        if (!v) return true;
        const selected = new Date(v);
        const today = new Date();
        today.setHours(0,0,0,0);
        return selected <= today || "La date ne peut pas être dans le futur";
    }
};

const formRef = ref<VForm | null>(null);

const form = ref<CreateHorseDto>({
   name: "",
    sex: undefined as "Jument" | "Hongre" | "Etalon" | undefined,
    breed: "",
    coat: "",
    birth_date: "",
    stable_location: "",
    feed: "",
    additional_info: "",
});

const fillForm = (horse: any) => {
    form.value = {
        name: horse.name || "",
        sex: horse.sex || undefined,
        breed: horse.breed || "",
        coat: horse.coat || "",
        birth_date: horse.birth_date || "",
        stable_location: horse.stable_location || "",
        feed: horse.feed || "",
        additional_info: horse.additional_info || "",
    };
};

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

const handleFileChange = async (fileInput: File | File[] | null) => {
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;
    
    if (file) {
        selectedPhoto.value = file;
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
    if (!props.horseId) {
        existingPhotoPath.value = undefined;
        isLoading.value = false;
        return;
    }

    isLoading.value = true;
    try {
        let horse = horsesStore.horses.find(h => h.id === props.horseId);
        
        if (!horse) {
            horse = await horsesStore.loadHorseById(props.horseId);
        }

        if (horse) {
            fillForm(horse);
            existingPhotoPath.value = horse.photo_path;
        } else {
            existingPhotoPath.value = undefined;
        }
    } catch (error) {
        logger.error("Erreur chargement cheval dans le form:", error);
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    formError.value = "";
    
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "name", label: "un nom", value: form.value.name?.trim() },
    ]);
    
    fieldErrors.value = errors;
    if (firstError) {
        formError.value = firstError;
        return;
    }

    if (!formRef.value) return;

    const { valid } = await formRef.value.validate();
    
    if (!valid) return;

    try {
        isSubmitting.value = true;
        
        const payload = {
            name: form.value.name?.trim(),
            sex: form.value.sex,
            breed: form.value.breed,
            coat: form.value.coat,
            stable_location: form.value.stable_location,
            feed: form.value.feed,
            additional_info: form.value.additional_info,
            birth_date: form.value.birth_date
        };

        let savedHorseId: string;

        if (props.horseId) {
            await horsesStore.updateHorse(props.horseId, payload);
            savedHorseId = props.horseId;
        } else {
            const newHorse = await horsesStore.createHorse(payload);
            savedHorseId = newHorse.id;
        }

        if (selectedPhoto.value) {
            await horsesStore.uploadHorsePhoto(savedHorseId, selectedPhoto.value);
        }
        
        snackbar.value = {
            show: true,
            message: isEdit.value ? "Fiche mise à jour." : "Fiche créée.",
            color: "success",
        };

        setTimeout(() => {
            horsesStore.sethorseId(savedHorseId);
            router.push({ name: "HorseDetails" });
        }, 800);

    } catch (error: any) {
        logger.error("Save error:", error);
        const serverMsg = error.response?.data?.message || "";
        formError.value = `Erreur serveur (500): ${serverMsg || "Vérifiez les champs"}`;
        
        snackbar.value = {
            show: true,
            message: "Enregistrement impossible.",
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(async () => {
    await loadHorse();
});

watch(() => props.horseId, (newId) => {
    if (newId) loadHorse();
}, { immediate: true });
</script>