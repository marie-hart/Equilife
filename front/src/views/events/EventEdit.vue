<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5">{{
                    pageTitle
                }}</v-card-title>
                <v-btn variant="outlined" @click="goBack">Retour</v-btn>
            </div>

            <v-card class="card" variant="outlined">
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="card, list-item-two-line"
                    />
                    <div v-else>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.horseId"
                                    :items="horseOptions"
                                    label="Cheval"
                                    density="compact"
                                    variant="outlined"
                                    :error-messages="
                                        fieldErrors.horseId
                                            ? [fieldErrors.horseId]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.reminderType"
                                    :items="reminderTypeOptions"
                                    label="Type"
                                    density="compact"
                                    variant="outlined"
                                    :error-messages="
                                        fieldErrors.reminderType
                                            ? [fieldErrors.reminderType]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <DatePickerField
                                    v-model="form.date"
                                    label="Date"
                                    :error-messages="
                                        fieldErrors.date
                                            ? [fieldErrors.date]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="8" v-if="!isActivity">
                                <v-text-field
                                    v-model="form.name"
                                    label="Titre"
                                    density="compact"
                                    :error-messages="
                                        fieldErrors.name
                                            ? [fieldErrors.name]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="6" v-if="isActivity">
                                <v-select
                                    v-model="form.activityType"
                                    :items="activityTypes"
                                    label="Type d'activité"
                                    density="compact"
                                    variant="outlined"
                                    :error-messages="
                                        fieldErrors.activityType
                                            ? [fieldErrors.activityType]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="3" v-if="isActivity">
                                <v-text-field
                                    v-model.number="form.duration"
                                    label="Durée (min)"
                                    type="number"
                                    min="0"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="12" md="3" v-if="isActivity">
                                <v-select
                                    v-model="form.intensity"
                                    :items="intensityOptions"
                                    label="Intensité"
                                    density="compact"
                                    variant="outlined"
                                />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.description"
                                    :label="
                                        isActivity
                                            ? 'Commentaire'
                                            : 'Description'
                                    "
                                    density="compact"
                                    variant="outlined"
                                    rows="2"
                                />
                            </v-col>
                            <v-col cols="12">
                                <v-checkbox
                                    v-model="form.reminderEnabled"
                                    label="Rappel actif"
                                    density="compact"
                                />
                            </v-col>
                        </v-row>
                    </div>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="outlined" @click="goBack">Annuler</v-btn>
                    <v-btn variant="elevated" color="primary" @click="save"
                        >Enregistrer</v-btn
                    >
                </v-card-actions>
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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Event } from "@/types";
import { useHorseSelection } from "@/composable/useHorseSelection";

type IntensityValue = "legere" | "normale" | "soutenue";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const form = ref({
    name: "",
    description: "",
    date: "",
    reminderType: "autres" as Event["reminder_type"],
    reminderEnabled: false,
    horseId: "",
    activityType: "",
    duration: 0,
    intensity: "normale" as IntensityValue,
});
const fieldErrors = ref<Record<string, string>>({});
const { horseOptions, loadHorses } = useHorseSelection({
    useRouteHorseId: false,
});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const reminderTypeOptions = [
    { title: "Soin", value: "soin" },
    { title: "Activité", value: "activité" },
    { title: "Alimentation", value: "alimentation" },
    { title: "Autres", value: "autres" },
];

const activityTypes = [
    { title: "Travail monté", value: "travail monté" },
    { title: "Travail à pied", value: "travail à pied" },
    { title: "Balade", value: "balade" },
    { title: "Longe", value: "longe" },
    { title: "Repos", value: "repos" },
    { title: "Autre", value: "autre" },
];

const intensityOptions = [
    { title: "Légère", value: "legere" },
    { title: "Normal", value: "normale" },
    { title: "Soutenu", value: "soutenue" },
];

const isActivity = computed(() => form.value.reminderType === "activité");
const pageTitle = computed(() =>
    isActivity.value ? "Modifier l'activité" : "Modifier l'événement",
);

const loadEvent = async () => {
    try {
        const id = route.params.id as string;
        const event = await eventsApi.getById(id);
        form.value = {
            name: event.name,
            description: event.activity_comment || event.description || "",
            date: toDateInputValue(event.event_date),
            reminderType:
                event.reminder_type || (event.is_care ? "soin" : "autres"),
            reminderEnabled: event.reminder_enabled ?? false,
            horseId: event.horse_id || "",
            activityType: event.activity_type || event.name,
            duration: event.activity_duration_minutes || 0,
            intensity:
                (event.activity_intensity as IntensityValue) || "normale",
        };
    } catch (error) {
        console.error("Error loading event:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de charger l’événement.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
    }
};

const save = async () => {
    try {
        const id = route.params.id as string;
        const isActivityType = form.value.reminderType === "activité";
        const { errors, firstError } = await validateRequiredFieldsMap([
            { key: "horseId", label: "un cheval", value: form.value.horseId },
            {
                key: "reminderType",
                label: "un type",
                value: form.value.reminderType,
            },
            { key: "date", label: "une date", value: form.value.date },
            {
                key: isActivityType ? "activityType" : "name",
                label: isActivityType ? "un type d'activité" : "un titre",
                value: isActivityType
                    ? form.value.activityType
                    : form.value.name,
            },
        ]);
        fieldErrors.value = errors;
        if (firstError) {
            snackbar.value = {
                show: true,
                message: firstError,
                color: "error",
            };
            return;
        }
        await eventsApi.update(id, {
            name: isActivityType
                ? form.value.activityType.trim()
                : form.value.name.trim(),
            description: form.value.description.trim() || undefined,
            event_date: fromDateInputValue(form.value.date),
            reminder_type: form.value.reminderType,
            reminder_enabled: form.value.reminderEnabled,
            horse_id: form.value.horseId || undefined,
            activity_type: isActivityType ? form.value.activityType : undefined,
            activity_duration_minutes: isActivityType
                ? form.value.duration || undefined
                : undefined,
            activity_intensity: isActivityType
                ? form.value.intensity
                : undefined,
            activity_comment: isActivityType
                ? form.value.description.trim() || undefined
                : undefined,
        });
        snackbar.value = {
            show: true,
            message: "Événement mis à jour.",
            color: "success",
        };
        router.push({ name: "EventDetails", params: { id } });
    } catch (error) {
        console.error("Error saving event:", error);
        snackbar.value = {
            show: true,
            message: "Modification impossible.",
            color: "error",
        };
    }
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    loadEvent();
    loadHorses();
});
</script>
