<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    {{ isEditMode ? 'Modifier l\'activité' : 'Ajouter une activité' }}
                </v-card-title>
            </div>
            
            <v-card 
                class="pa-2" 
                variant="flat" 
                rounded="lg"
                :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
            >
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="card, list-item-two-line"
                    />
                    
                    <v-row v-else dense>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="horsesStore.horseId"
                                :items="horsesStore.horseOptions"
                                label="Cheval *"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                :error-messages="fieldErrors.horseId ? [fieldErrors.horseId] : undefined"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.activityType"
                                :items="activityTypes"
                                label="Type d'activité *"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                :error-messages="fieldErrors.activityType ? [fieldErrors.activityType] : undefined"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="3">
                            <DatePickerField
                                v-model="form.date"
                                label="Date *"
                                :error-messages="fieldErrors.date ? [fieldErrors.date] : undefined"
                                class="rounded-lg"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model.number="form.duration"
                                label="Durée (min)"
                                type="number"
                                min="0"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.intensity"
                                :items="intensityOptions"
                                label="Intensité"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                            />
                        </v-col>
                        
                        <v-col cols="12">
                            <v-textarea
                                v-model="form.comment"
                                label="Commentaire"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                rows="3"
                            />
                        </v-col>
                    </v-row>
                    
                    <div class="d-flex justify-end mt-4">
                           
                <v-btn 
                    variant="outlined" 
                    @click="goBack"
                    rounded="lg"
                    class="mr-2"
                    :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                >
                    Annuler
                </v-btn>
                        <v-btn
                            variant="flat"
                            rounded="lg"
                            :style="{ backgroundColor: '#554338', color: 'white' }"
                            class="text-none"
                            :loading="isSubmitting"
                            @click="submitForm"
                        >
                            {{ isEditMode ? 'Enregistrer' : 'Ajouter' }}
                        </v-btn>
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
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { useHorsesStore } from "@/stores/HorsesStore";
import { IntensityValue } from "@/types";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore(); 

// Détection mode édition vs création
const isEditMode = computed(() => Boolean(route.name === 'ActivityEdit'));
const eventId = computed(() => route.params.id as string);

const isSubmitting = ref(false);
const isLoading = ref(isEditMode.value); // Load si mode édition
const fieldErrors = ref<Record<string, string>>({});
const form = ref({
    activityType: "",
    date: "",
    duration: 0,
    intensity: "normale" as IntensityValue,
    comment: "",
});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const activityTypes = [
    { title: "Travail sur le plat", value: "travail sur le plat" },
    { title: "Travail à pied", value: "travail à pied" },
    { title: "Obstacle", value: "obstacle"},
    { title: "Barre au sol", value: "barre au sol"},
    { title: "Balade", value: "balade" },
    { title: "Longe", value: "longe" },
    { title: "Repos", value: "repos" },
    { title: "Trotting", value: "Trotting" },
    { title: "Cours", value: "cours" },
    { title: "Concours", value: "concours" },
    { title: "Stage", value: "stage" },
];

const intensityOptions = [
    { title: "Légère", value: "legere" },
    { title: "Normal", value: "normale" },
    { title: "Soutenu", value: "soutenue" },
];

// Chargement des données si mode édition
const loadActivity = async () => {
    if (!isEditMode.value) return;
    try {
        const event = await eventsApi.getById(eventId.value);
        // Mise à jour du store avec le cheval de l'activité
        if (event.horse_id) horsesStore.sethorseId(event.horse_id);                
        
        form.value = {
            activityType: event.activity_type || event.name || "",
            date: toDateInputValue(event.event_date),
            duration: event.activity_duration_minutes || 0,
            intensity: (event.activity_intensity as IntensityValue) || "normale",
            comment: event.activity_comment || event.description || "",
        };
    } catch (error) {
        console.error("Error loading activity:", error);
        snackbar.value = { show: true, message: "Impossible de charger l'activité.", color: "error" };
    } finally {
        isLoading.value = false;
    }
};

const submitForm = async () => {
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseId", label: "un cheval", value: horsesStore.horseId },
        { key: "activityType", label: "un type d'activité", value: form.value.activityType },
        { key: "date", label: "une date", value: form.value.date },
    ]);
    
    fieldErrors.value = errors;
    if (firstError) {
        snackbar.value = { show: true, message: firstError, color: "error" };
        return;
    }

    try {
        isSubmitting.value = true;
        const payload = {
            name: form.value.activityType,
            description: form.value.comment,
            event_date: fromDateInputValue(form.value.date),
            horse_id: horsesStore.horseId || "",
            reminder_enabled: false,
            reminder_type: "activité" as const,
            activity_type: form.value.activityType,
            activity_duration_minutes: form.value.duration,
            activity_intensity: form.value.intensity,
            activity_comment: form.value.comment,
        };

        if (isEditMode.value) {
            await eventsApi.update(eventId.value, payload);
            snackbar.value = { show: true, message: "Activité mise à jour.", color: "success" };
        } else {
            await eventsApi.create(payload);
            snackbar.value = { show: true, message: "Activité ajoutée.", color: "success" };
        }
        goBack();
    } catch (error) {
        console.error("Error saving activity:", error);
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    if (horsesStore.horseId) {
        router.push({ name: "HorseActivities", params: { id: horsesStore.horseId } });
        return;
    }
    router.push("/horses");
};

onMounted(async () => {
    if (isEditMode.value) {
        await loadActivity();
    } else {
        // En création, si un ID est dans l'URL, on l'utilise
        const horseIdFromUrl = route.query.horseId as string;
        if (horseIdFromUrl) horsesStore.sethorseId(horseIdFromUrl);                
        isLoading.value = false;
    }
});
</script>