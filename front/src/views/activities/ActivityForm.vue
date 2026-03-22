<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pa-0 pb-10"
  >
    <v-container class="px-4 py-2">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            {{ isEditMode ? 'Modifier' : 'Nouvelle activité' }}
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn 
          variant="text" 
          icon="mdi-close"
          color="#2E4B36"
          @click="goBack"
        ></v-btn>
      </div>

      <v-card v-if="isLoading" color="#F5EFE6" variant="flat" rounded="xl" class="pa-4">
        <v-skeleton-loader type="article" bg-color="transparent" />
      </v-card>

      <v-form v-else @submit.prevent="submitForm">
        <v-row dense>
          
          <v-col cols="12">
            <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">L'essentiel</div>
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 mb-4 shadow-subtle">
              <v-row dense>
                <v-col cols="12">
                  <v-select
                    :model-value="horsesStore.horseId"
                    @update:model-value="horsesStore.sethorseId"
                    :items="horsesStore.horseOptions"
                    label="Cheval *"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                    :disabled="isEditMode"
                    prepend-inner-icon="mdi-horse"
                    :error-messages="fieldErrors.horseId ? [fieldErrors.horseId] : undefined"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-select
                    v-model="form.activityType"
                    :items="activityTypes"
                    label="Type d'activité *"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-star-outline"
                    :error-messages="fieldErrors.activityType ? [fieldErrors.activityType] : undefined"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Détails de la séance</div>
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 mb-4 shadow-subtle">
              <v-row dense>
                <v-col cols="12">
                  <DatePickerField
                    v-model="form.date"
                    label="Date de la séance *"
                    :error-messages="fieldErrors.date ? [fieldErrors.date] : undefined"
                    @update:model-value="handleDateChange"
                  />
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model.number="form.duration"
                    label="Durée (min)"
                    type="number"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-clock-outline"
                  />
                </v-col>
                
                <v-col cols="6">
                  <v-select
                    v-model="form.intensity"
                    :items="intensityOptions"
                    label="Intensité"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Notes de séance</div>
            <v-textarea
              v-model="form.comment"
              placeholder="Comment s'est passé la séance ?"
              variant="solo"
              flat
              bg-color="#F5EFE6"
              rounded="xl"
              density="comfortable"
              rows="3"
              class="shadow-subtle"
              @keydown.enter.prevent
            />
          </v-col>
        </v-row>

        <div class="d-flex ga-3 mt-6">
          <v-btn
            variant="text"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            color="#7B5B3E"
            @click="goBack"
          >
            Annuler
          </v-btn>

          <v-btn
            variant="flat"
            color="#2E4B36"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            size="large"
            :loading="isSubmitting"
            @click="submitForm"
          >
            {{ isEditMode ? 'Enregistrer' : 'Ajouter' }}
          </v-btn>
        </div>
      </v-form>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        rounded="pill"
        elevation="10"
      >
        <div class="text-center w-100 font-weight-bold">{{ snackbar.message }}</div>
      </v-snackbar>

    </v-container>
  </v-sheet>
</template>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}

/* Style spécifique pour DatePickerField s'il n'est pas déjà personnalisé */
:deep(.v-field--variant-solo) {
  background-color: white !important;
}
</style>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { toDateInputValue, fromDateInputValue } from "@/libs/date";
import { logger } from "@/services/LoggerService";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { useHorsesStore } from "@/stores/HorsesStore";
import { IntensityValue } from "@/types";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore(); 

const isEditMode = computed(() => Boolean(route.name === 'ActivityEdit'));
const eventId = computed(() => route.params.id as string);

const isSubmitting = ref(false);
const isLoading = ref(isEditMode.value);
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

const handleDateChange = (newVal: string) => {
    form.value.date = newVal;
};

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

const loadActivity = async () => {
    if (!isEditMode.value) return;
    try {
        const event = await eventsApi.getById(eventId.value);
        
        form.value = {
            activityType: event.activity_type || event.name || "",
            date: toDateInputValue(event.event_date),
            duration: event.activity_duration_minutes || 0,
            intensity: (event.activity_intensity as IntensityValue) || "normale",
            comment: event.activity_comment || event.description || "",
        };
    } catch (error) {
        logger.error("Error loading activity:", error);
        snackbar.value = { show: true, message: "Impossible de charger l'activité.", color: "error" };
    } finally {
        isLoading.value = false;
    }
};

const formatToInputDate = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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

    const localDate = new Date(form.value.date);

    localDate.setHours(12, 0, 0);

    try {
        isSubmitting.value = true;
        const payload = {
            name: form.value.activityType,
            description: form.value.comment,
            event_date: localDate.toISOString(),
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
        logger.error("Error saving activity:", error);
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    router.push(horsesStore.horseId ? { name: "HorseActivities" } : { name: "Horses" });
};

watch(() => route.params.id, async (newId) => {
    if (newId && isEditMode.value) {
        await loadActivity();
    } else {
        // Reset pour le mode création
        form.value = {
            activityType: "",
            date: formatToInputDate(new Date()), // Date du jour par défaut
            duration: 0,
            intensity: "normale",
            comment: "",
        };
    }
}, { immediate: true });

onMounted(async () => {
    await horsesStore.loadHorses();

    if (isEditMode.value) {
        await loadActivity();
    } else {
        isLoading.value = false;
    }
});
</script>