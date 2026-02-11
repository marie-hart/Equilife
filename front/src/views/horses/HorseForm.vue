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
                        <v-text-field
                            v-model="form.nickname"
                            label="Surnom"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
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
                <div class="d-flex align-center ga-3 mt-6 flex-wrap">
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
                    <v-btn 
                        variant="outlined" 
                        @click="goBack"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        Annuler
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { horsesApi } from "@/api/horses";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { CreateHorseDto, Horse } from "@/types";

const route = useRoute();
const router = useRouter();
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

const horseId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => Boolean(horseId.value));

const form = ref<CreateHorseDto>({
    name: "",
    nickname: "",
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

const handleFileChange = (files: File[] | File | null) => {
    if (Array.isArray(files)) {
        selectedPhoto.value = files[0] || null;
    } else {
        selectedPhoto.value = files || null;
    }
};

const loadHorse = async () => {
    isLoading.value = true;
    if (!horseId.value) {
        isLoading.value = false;
        return;
    }
    try {
        const horse = await horsesApi.getById(horseId.value);
        form.value = {
            name: horse.name,
            nickname: horse.nickname || "",
            sex: horse.sex,
            breed: horse.breed || "",
            coat: horse.coat || "",
            birth_date: horse.birth_date || "",
            stable_location: horse.stable_location || "",
            feed: horse.feed || "",
            additional_info: horse.additional_info || "",
        };
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
        let savedHorse: Horse;
        const payload = {
            name: form.value.name.trim(),
            nickname: form.value.nickname?.trim() || undefined,
            sex: form.value.sex || undefined,
            breed: form.value.breed?.trim() || undefined,
            coat: form.value.coat?.trim() || undefined,
            birth_date: form.value.birth_date || undefined,
            stable_location: form.value.stable_location?.trim() || undefined,
            feed: form.value.feed?.trim() || undefined,
            additional_info: form.value.additional_info?.trim() || undefined,
        };

        if (horseId.value) {
            savedHorse = await horsesApi.update(horseId.value, payload);
        } else {
            savedHorse = await horsesApi.create(payload);
        }

        if (selectedPhoto.value) {
            await horsesApi.uploadPhoto(savedHorse.id, selectedPhoto.value);
        }

        snackbar.value = {
            show: true,
            message: isEdit.value ? "Cheval mis à jour." : "Cheval créé.",
            color: "success",
        };

        setTimeout(() => {
            router.push("/horses");
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
</script>
