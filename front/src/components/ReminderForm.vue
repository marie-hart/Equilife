<template>
  <form class="reminder-form" @submit.prevent="emit('submit')">
    <v-row dense>
      <v-col v-if="showHorseSelect" cols="12" md="4">
        <v-select
          v-model="horseIds"
          :items="horseSelectOptions"
          label="Chevaux"
          density="compact"
          variant="outlined"
          :multiple="multiple"
          :chips="multiple"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="description"
          label="Description (vaccin, maréchal, médicament...)"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="date"
          label="Date"
          type="date"
          density="compact"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-end">
      <v-btn
        variant="elevated"
        color="primary"
        size="small"
        type="submit"
        :loading="loading"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Horse } from '../types'

type ReminderFormValue = {
  horseIds: string[]
  description: string
  date: string
}

const props = withDefaults(
  defineProps<{
    modelValue: ReminderFormValue
    horses: Horse[]
    loading?: boolean
    submitLabel?: string
    showHorseSelect?: boolean
    multiple?: boolean
  }>(),
  {
    loading: false,
    submitLabel: 'Ajouter',
    showHorseSelect: true,
    multiple: true,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: ReminderFormValue): void
  (event: 'submit'): void
}>()

const horseSelectOptions = computed(() =>
  props.horses.map((horse) => ({ title: horse.name, value: horse.id }))
)

const horseIds = computed({
  get: () => props.modelValue.horseIds,
  set: (value) => emit('update:modelValue', { ...props.modelValue, horseIds: value }),
})

const description = computed({
  get: () => props.modelValue.description,
  set: (value) => emit('update:modelValue', { ...props.modelValue, description: value }),
})

const date = computed({
  get: () => props.modelValue.date,
  set: (value) => emit('update:modelValue', { ...props.modelValue, date: value }),
})
</script>

<style scoped>
.reminder-form {
  margin: 0;
}
</style>
