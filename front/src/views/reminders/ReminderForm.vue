<template>
  <v-card variant="flat" class="bg-transparent">
    <form @submit.prevent="emit('submit')">
      <v-row>
        <v-col cols="12">
          <div class="text-overline mb-2" style="color: #7B5B3E">Détails du rappel</div>
          <v-card variant="flat" rounded="xl" class="pa-6 shadow-subtle border-light bg-white">
            <v-row dense>
              <v-col v-if="showHorseSelect" cols="12">
                <v-select
                  v-model="horseIds"
                  :items="horseSelectOptions"
                  label="Chevaux concernés *"
                  density="comfortable"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  :multiple="multiple"
                  :chips="multiple"
                  :error-messages="errors?.horseIds ? [errors.horseIds] : undefined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="reminderType"
                  :items="reminderTypeOptions"
                  label="Catégorie *"
                  density="comfortable"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  :error-messages="errors?.reminderType ? [errors.reminderType] : undefined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <DatePickerField
                  v-model="date"
                  label="Date prévue *"
                  density="comfortable"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  :error-messages="errors?.date ? [errors.date] : undefined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="description"
                  label="Description / Note *"
                  placeholder="Ex: Vaccin grippe/tétanos, passage ostéo..."
                  density="comfortable"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  hide-details="auto"
                  :error-messages="errors?.description ? [errors.description] : undefined"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12">
          <div class="text-overline mb-2" style="color: #7B5B3E">Paramètres de répétition</div>
          <v-card variant="flat" rounded="xl" class="pa-6 shadow-subtle border-light bg-white">
            <RecurrenceFields
              v-model="recurrence"
              :units="recurrenceUnits"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              :checkbox-md="12"
              :fields-md="6"
            />
          </v-card>
        </v-col>
      </v-row>
      
      <div class="d-flex align-center justify-end ga-3 mt-8">
        <v-btn 
          variant="text" 
          @click="emit('cancel')"
          class="text-none font-weight-bold"
          color="#554338"
        >
          Annuler
        </v-btn>
        <v-btn
          min-width="140"
          size="large"
          class="text-none font-weight-black"
          color="#2E4B36"
          variant="flat"
          rounded="xl"
          type="submit"
          :loading="loading"
          elevation="4"
        >
          {{ submitLabel }}
        </v-btn>
      </div>
    </form>
  </v-card>
</template>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.08) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
:deep(.v-field__outline) {
  --v-field-border-color: #d1c7bc;
}
</style>

<script setup lang="ts">
import { computed } from "vue";
import { DatePickerField, RecurrenceFields } from "@/components";
import type { Horse, RecurrenceUnit } from "@/types"; // Importez correctement le type ici

type ReminderFormValue = {
    horseIds: string[];
    description: string;
    date: string;
    reminderType: "soin" | "activité" | "alimentation" | "autres";
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
};

const props = withDefaults(
    defineProps<{
        modelValue: ReminderFormValue;
        horses: Horse[];
        loading?: boolean;
        submitLabel?: string;
        showHorseSelect?: boolean;
        multiple?: boolean;
        errors?: Record<string, string>;
    }>(),
    {
        loading: false,
        submitLabel: "Ajouter",
        showHorseSelect: true,
        multiple: true,
    },
);

const emit = defineEmits<{
    (event: "update:modelValue", value: ReminderFormValue): void;
    (event: "submit"): void;
    (event: "cancel"): void;
}>();

// Mapping des chevaux pour le select
const horseSelectOptions = computed(() =>
    props.horses.map((horse) => ({ title: horse.name, value: horse.id })),
);

// Computed properties for v-model binding
const horseIds = computed({
    get: () => props.modelValue.horseIds,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, horseIds: value }),
});

const description = computed({
    get: () => props.modelValue.description,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, description: value }),
});

const date = computed({
    get: () => props.modelValue.date,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, date: value }),
});

const reminderType = computed({
    get: () => props.modelValue.reminderType,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, reminderType: value }),
});

const recurrence = computed({
    get: () => ({
        isRecurring: props.modelValue.isRecurring,
        recurrenceInterval: props.modelValue.recurrenceInterval,
        recurrenceUnit: props.modelValue.recurrenceUnit,
    }),
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, ...value }),
});

const reminderTypeOptions = [
    { title: "Soin", value: "soin" },
    { title: "Activité", value: "activité" },
    { title: "Alimentation", value: "alimentation" },
    { title: "Autres", value: "autres" },
];

const recurrenceUnits = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];
</script>

<style scoped>
.reminder-form {
    margin: 0;
}
/* Style pour s'assurer que RecurrenceFields hérite des styles */
:deep(.v-field__outline) {
    --v-field-border-color: #d1c7bc;
}
</style>