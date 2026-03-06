<template>
  <v-card variant="flat" class="bg-transparent">
    <form @submit.prevent="handleSubmit">
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
          {{ isEdit ? 'Enregistrer les modifications' : 'Ajouter le rappel' }}
        </v-btn>
      </div>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DatePickerField, RecurrenceFields } from "@/components";
import type { Horse, ReminderFormValue } from "@/types";

const props = withDefaults(
    defineProps<{
        modelValue: ReminderFormValue;
        horses: Horse[];
        loading?: boolean;
        showHorseSelect?: boolean;
        multiple?: boolean;
        errors?: Record<string, string>;
    }>(),
    {
        loading: false,
        showHorseSelect: true,
        multiple: true,
        errors: () => ({}),
    },
);

const emit = defineEmits<{
    (event: "update:modelValue", value: ReminderFormValue): void;
    (event: "submit"): void;
    (event: "cancel"): void;
}>();

const isEdit = computed(() => !!props.modelValue.id);

const horseSelectOptions = computed(() =>
    props.horses.map((horse) => ({ title: horse.name, value: horse.id })),
);

const updateField = (key: keyof ReminderFormValue, value: any) => {
    emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const horseIds = computed({
    get: () => props.modelValue.horseIds,
    set: (val) => updateField('horseIds', val),
});

const description = computed({
    get: () => props.modelValue.description,
    set: (val) => updateField('description', val),
});

const date = computed({
    get: () => props.modelValue.date,
    set: (val) => updateField('date', val),
});

const reminderType = computed({
    get: () => props.modelValue.reminderType,
    set: (val) => updateField('reminderType', val),
});

const recurrence = computed({
    get: () => ({
        isRecurring: props.modelValue.isRecurring,
        recurrenceInterval: props.modelValue.recurrenceInterval,
        recurrenceUnit: props.modelValue.recurrenceUnit,
    }),
    set: (val) => emit("update:modelValue", { ...props.modelValue, ...val }),
});

const handleSubmit = () => {
    emit("submit");
};

// Options statiques
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