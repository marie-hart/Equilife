<template>
  <v-dialog v-model="isOpen" max-width="600" persistent transition="dialog-bottom-transition">
    <v-card rounded="xl" class="pa-4 shadow-subtle border-light">
      <v-card-title class="d-flex align-center justify-space-between pt-4">
        <span class="text-h5 font-weight-black" style="color: #2E4B36">Éditer le rappel</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false" />
      </v-card-title>
      
      <v-card-text class="mt-4 px-2">
        <ReminderForm
          v-model="internalForm"
          :horses="horses"
          :errors="errors"
          :show-horse-select="false" 
          @submit="handleSave"
          @cancel="isOpen = false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ReminderForm } from '@/views/reminders';
import type { ReminderFormValue, Horse } from '@/types';

const props = defineProps<{
    modelValue: boolean;
    form: ReminderFormValue;
    horses: Horse[];
    errors: Record<string, string>;
}>();

const emit = defineEmits(["update:modelValue", "update:form", "save"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

const internalForm = computed({
    get: () => props.form,
    set: (value) => emit("update:form", value),
});

const handleSave = () => {
    emit("save");
};
</script>