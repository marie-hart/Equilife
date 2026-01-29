<template>
    <div class="page">
        <main class="pa-4">
            <v-card class="card" variant="outlined">
                <v-card-title>Créer un rappel</v-card-title>
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="card, list-item-two-line"
                    />
                    <ReminderForm
                        v-else
                        v-model="createForm"
                        :horses="horses"
                        :loading="isCreating"
                        :errors="fieldErrors"
                        submit-label="Ajouter"
                        @submit="createReminder"
                        @cancel="goBack"
                    />
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
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { fromDateInputValue } from "@/libs/date";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { useHorseSelection } from "@/composable/useHorseSelection";
import { ReminderForm } from "@/views/reminders";

type ReminderFormValue = {
    horseIds: string[];
    description: string;
    date: string;
    reminderType: "soin" | "activité" | "alimentation" | "autres";
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
};

type RecurrenceUnit = "days" | "months" | "years";

const router = useRouter();
const { horses, getHorseIdsFromQuery, loadHorses } = useHorseSelection();
const isLoading = ref(true);
const isCreating = ref(false);
const fieldErrors = ref<Record<string, string>>({});
const createForm = ref<ReminderFormValue>({
    horseIds: [],
    description: "",
    date: "",
    reminderType: "soin",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months",
});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return (
            (error.response?.data as { error?: string } | undefined)?.error ??
            "Création impossible."
        );
    }
    return "Création impossible.";
};

const createReminder = async () => {
    const { errors, firstError } = await validateRequiredFieldsMap([
        {
            key: "horseIds",
            label: "un cheval",
            value: createForm.value.horseIds,
        },
        {
            key: "reminderType",
            label: "un type",
            value: createForm.value.reminderType,
        },
        {
            key: "description",
            label: "une description",
            value: createForm.value.description,
        },
        { key: "date", label: "une date", value: createForm.value.date },
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
    if (
        createForm.value.isRecurring &&
        (!createForm.value.recurrenceInterval ||
            createForm.value.recurrenceInterval < 1)
    ) {
        snackbar.value = {
            show: true,
            message: "Merci de renseigner une récurrence valide.",
            color: "error",
        };
        return;
    }
    try {
        isCreating.value = true;
        const { recurrenceUnit } = createForm.value;
        const recurrenceInterval = Number.isFinite(
            createForm.value.recurrenceInterval,
        )
            ? createForm.value.recurrenceInterval
            : 1;
        const intervalDays =
            createForm.value.isRecurring && recurrenceUnit === "days"
                ? recurrenceInterval
                : undefined;
        const intervalMonths =
            createForm.value.isRecurring && recurrenceUnit === "months"
                ? recurrenceInterval
                : undefined;
        const intervalYears =
            createForm.value.isRecurring && recurrenceUnit === "years"
                ? recurrenceInterval
                : undefined;
        await Promise.all(
            createForm.value.horseIds.map((horseId) =>
                eventsApi.create({
                    name: createForm.value.description,
                    description: createForm.value.description,
                    event_date: fromDateInputValue(createForm.value.date),
                    horse_id: horseId,
                    reminder_type: createForm.value.reminderType,
                    reminder_enabled: true,
                    reminder_interval_days: intervalDays,
                    reminder_interval_months: intervalMonths,
                    reminder_interval_years: intervalYears,
                }),
            ),
        );
        const reminderType = createForm.value.reminderType;
        createForm.value.horseIds = [];
        createForm.value.description = "";
        createForm.value.date = "";
        createForm.value.reminderType = reminderType;
        createForm.value.isRecurring = false;
        createForm.value.recurrenceInterval = 1;
        createForm.value.recurrenceUnit = "months";
        const horseIds = getHorseIdsFromQuery();
        if (horseIds.length && createForm.value.horseIds.length === 0) {
            createForm.value.horseIds = horseIds;
        }
        snackbar.value = {
            show: true,
            message: "Rappel(s) créé(s).",
            color: "success",
        };
        await router.push("/reminders");
    } catch (error) {
        console.error("Error creating reminder:", error);
        snackbar.value = {
            show: true,
            message: getErrorMessage(error),
            color: "error",
        };
    } finally {
        isCreating.value = false;
    }
};

const goBack = () => {
    router.push("/reminders");
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await loadHorses();
        const horseIds = getHorseIdsFromQuery();
        if (horseIds.length && createForm.value.horseIds.length === 0) {
            createForm.value = { ...createForm.value, horseIds };
        }
    } finally {
        isLoading.value = false;
    }
});
</script>
