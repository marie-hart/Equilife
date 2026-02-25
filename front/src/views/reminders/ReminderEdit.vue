<template>
  <v-dialog v-model="isOpen" max-width="500" persistent transition="dialog-bottom-transition">
    <v-card rounded="xl" class="pa-4 shadow-subtle border-light">
      <v-card-title class="d-flex align-center justify-space-between pt-4">
        <span class="text-h5 font-weight-black" style="color: #2E4B36">Éditer le rappel</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false" />
      </v-card-title>
      
      <v-card-text class="mt-4 px-2">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="form.description"
              label="Description"
              density="comfortable"
              variant="outlined"
              color="#2E4B36"
              rounded="lg"
              :error-messages="errors.description ? [errors.description] : undefined"
            />
          </v-col>
          
          <v-col cols="12">
            <DatePickerField
              v-model="dateValue"
              label="Date"
              density="comfortable"
              variant="outlined"
              color="#2E4B36"
              rounded="lg"
              :error-messages="errors.date ? [errors.date] : undefined"
            />
          </v-col>
          
          <v-col cols="12">
            <div class="pa-4 rounded-xl border-light bg-grey-lighten-5">
              <v-checkbox
                v-model="form.isRecurring"
                label="Répéter ce rappel"
                density="compact"
                color="#2E4B36"
                hide-details
              />
              
              <v-expand-transition>
                <v-row v-if="form.isRecurring" dense class="mt-2">
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="form.recurrenceInterval"
                      label="Fréquence"
                      type="number"
                      min="1"
                      density="comfortable"
                      variant="outlined"
                      color="#2E4B36"
                      rounded="lg"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="form.recurrenceUnit"
                      :items="recurrenceUnits"
                      label="Unité"
                      density="comfortable"
                      variant="outlined"
                      color="#2E4B36"
                      rounded="lg"
                    />
                  </v-col>
                </v-row>
              </v-expand-transition>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      
      <v-card-actions class="pa-4 pb-6">
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          class="text-none font-weight-bold me-2"
          color="#554338"
          @click="isOpen = false"
        >
          Annuler
        </v-btn>
        <v-btn 
          variant="flat" 
          rounded="xl"
          min-width="120"
          class="text-none font-weight-black"
          color="#2E4B36"
          elevation="2"
          @click="$emit('save')"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DatePickerField } from "@/components";
import type { RecurrenceUnit } from "@/types"

const props = defineProps<{
    modelValue: boolean;
    form: {
        description: string;
        date: string;
        isRecurring: boolean;
        recurrenceInterval: number;
        recurrenceUnit: RecurrenceUnit;
    };
    errors: Record<string, string>;
    recurrenceUnits: { title: string; value: RecurrenceUnit }[];
}>();

const dateValue = computed({
  get: () => props.form.date || '', 
  set: (val) => props.form.date = val
});

const emit = defineEmits(["update:modelValue", "save"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});
</script>