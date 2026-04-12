<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Nouveau rappel
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
          <v-btn 
            variant="text" 
            icon="mdi-close"
            color="#2E4B36"
            @click="router.back()" 
          ></v-btn>
      </div>

      <ReminderForm
        v-model="form"
        :horses="horsesStore.horses"
        :loading="isLoading"
        :errors="errors"
        @submit="handleCreate"
        @cancel="router.back()"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
        <div class="text-center w-100 font-weight-bold">{{ snackbar.message }}</div>
      </v-snackbar>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { logger } from "@/services/LoggerService";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useEventsStore } from "@/stores/EventsStore";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { ReminderForm } from "@/views/reminders";
import type { ReminderFormValue } from "@/types";

const router = useRouter();
const horsesStore = useHorsesStore();
const eventsStore = useEventsStore();

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });

const getTodayLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 10);
  return localISOTime;
};

const form = ref<ReminderFormValue>({
    horseIds: [], 
    description: "",
    date: getTodayLocal(), 
    reminderType: "soin",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months",
});

onMounted(async () => {
    if (horsesStore.horses.length === 0) {
        await horsesStore.loadHorses();
    }
    const preselectedHorseId = horsesStore.horseId && horsesStore.horseId !== "all" ? horsesStore.horseId : null;
    if (preselectedHorseId) {
        form.value.horseIds = [preselectedHorseId];
    }
});

const handleCreate = async () => {
    isLoading.value = true;
    errors.value = {};

    try {
        const { errors: valErrors, firstError } = await validateRequiredFieldsMap([
            { key: "horseIds", label: "cheval", value: form.value.horseIds },
            { key: "description", label: "description", value: form.value.description },
            { key: "date", label: "date", value: form.value.date },
        ]);

        if (firstError) {
            errors.value = valErrors;
            isLoading.value = false;
            return;
        }
        
        const dateObj = new Date(form.value.date);
        const cleanDate = new Intl.DateTimeFormat('sv-SE').format(dateObj);

        const promises = form.value.horseIds.map(horseId => {
            return eventsStore.createEvent({
                horse_id: horseId,
                name: form.value.description,
                description: form.value.description,
                event_date: cleanDate,
                reminder_type: form.value.reminderType,
                reminder_enabled: true,
                reminder_interval_days: form.value.isRecurring && form.value.recurrenceUnit === "days" ? form.value.recurrenceInterval : 0,
                reminder_interval_months: form.value.isRecurring && form.value.recurrenceUnit === "months" ? form.value.recurrenceInterval : 0,
                reminder_interval_years: form.value.isRecurring && form.value.recurrenceUnit === "years" ? form.value.recurrenceInterval : 0,
            });
        });

        await Promise.all(promises);

        snackbar.value = {
            show: true,
            message: form.value.horseIds.length > 1 ? "Rappels créés avec succès !" : "Rappel créé avec succès !",
            color: "success",
        };

        setTimeout(() => router.push({ name: "Reminders" }), 1500);

    } catch (error) {
        logger.error("Erreur création rappel:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de créer le rappel.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
    }
};
</script>