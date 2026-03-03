<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container class="px-4 max-width-600">
      <div class="d-flex align-center mb-8 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Nouveau rappel
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
      </div>

      <v-skeleton-loader
        v-if="isLoading"
        type="article, actions"
        bg-color="transparent"
      />
      
      <ReminderForm
        v-else
        v-model="createForm"
        :horses="horsesStore.horses"
        :loading="isCreating"
        :errors="fieldErrors"
        submit-label="Enregistrer le rappel"
        @submit="createReminder"
        @cancel="goBack"
      />
    </v-container>
    
    </v-sheet>
</template>

<style scoped>
.max-width-600 {
  max-width: 600px;
}
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { useHorsesStore } from "@/stores/HorsesStore";
import { fromDateInputValue } from "@/libs/date";
import { validateRequiredFieldsMap } from "@/utils/validation";
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
const horsesStore = useHorsesStore();
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
        
        const { horseIds, description, date, reminderType, isRecurring, recurrenceInterval, recurrenceUnit } = createForm.value;
        const eventDate = fromDateInputValue(date);

        const intervalDays = isRecurring && recurrenceUnit === "days" ? recurrenceInterval : undefined;
        const intervalMonths = isRecurring && recurrenceUnit === "months" ? recurrenceInterval : undefined;
        const intervalYears = isRecurring && recurrenceUnit === "years" ? recurrenceInterval : undefined;

        await Promise.all(
            horseIds.map((horseId) =>
                eventsApi.create({
                    name: description,
                    description: description,
                    event_date: eventDate,
                    horse_id: horseId,
                    reminder_type: reminderType,
                    reminder_enabled: true,
                    reminder_interval_days: intervalDays,
                    reminder_interval_months: intervalMonths,
                    reminder_interval_years: intervalYears,
                }),
            ),
        );
        
        snackbar.value = {
            show: true,
            message: "Rappel(s) créé(s).",
            color: "success",
        };
        
        setTimeout(() => {
            goBack();
        }, 100); // Un léger délai permet à l'animation du bouton de se terminer
        
    } catch (error) {
        isCreating.value = false; // Important : libérer le bouton en cas d'erreur
        console.error("Error creating reminder:", error);
        snackbar.value = {
            show: true,
            message: getErrorMessage(error),
            color: "error",
        };
    }
};

const goBack = () => {
    router.push({ name: "Reminders" });
}
    

onMounted(async () => {
    isLoading.value = true;
    try {
        await horsesStore.loadHorses();
        // Pré-sélectionner le cheval actif du store si présent
        if (horsesStore.horseId && horsesStore.horseId !== "all" && createForm.value.horseIds.length === 0) {
            createForm.value.horseIds = [horsesStore.horseId];
        }
    } finally {
        isLoading.value = false;
    }
});
</script>