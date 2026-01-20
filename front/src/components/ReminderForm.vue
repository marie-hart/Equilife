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
          :error-messages="errors?.horseIds ? [errors.horseIds] : undefined"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="reminderType"
          :items="reminderTypeOptions"
          label="Type"
          density="compact"
          variant="outlined"
          :error-messages="errors?.reminderType ? [errors.reminderType] : undefined"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="description"
          label="Description (vaccin, maréchal, médicament...)"
          density="compact"
          :error-messages="errors?.description ? [errors.description] : undefined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <DatePickerField
          v-model="date"
          label="Date"
          :error-messages="errors?.date ? [errors.date] : undefined"
        />
      </v-col>
      <RecurrenceFields
        v-model="recurrence"
        :units="recurrenceUnits"
        :checkbox-md="3"
        :fields-md="6"
      />
    </v-row>
    <div class="d-flex justify-end ga-2">
      <v-btn variant="outlined" size="small" type="button" @click="emit('cancel')">
        Annuler
      </v-btn>
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
import { DatePickerField, RecurrenceFields } from './index'
import type { Horse } from '../types'

type ReminderFormValue = {
  horseIds: string[]
  description: string
  date: string
  reminderType: 'soin' | 'activité' | 'alimentation' | 'autres'
  isRecurring: boolean
  recurrenceInterval: number
  recurrenceUnit: RecurrenceUnit
}

type RecurrenceUnit = 'days' | 'months' | 'years'

const props = withDefaults(
  defineProps<{
    modelValue: ReminderFormValue
    horses: Horse[]
    loading?: boolean
    submitLabel?: string
    showHorseSelect?: boolean
    multiple?: boolean
    errors?: Record<string, string>
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
  (event: 'cancel'): void
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

const reminderType = computed({
  get: () => props.modelValue.reminderType,
  set: (value) => emit('update:modelValue', { ...props.modelValue, reminderType: value }),
})

const recurrence = computed({
  get: () => ({
    isRecurring: props.modelValue.isRecurring,
    recurrenceInterval: props.modelValue.recurrenceInterval,
    recurrenceUnit: props.modelValue.recurrenceUnit,
  }),
  set: (value) => emit('update:modelValue', { ...props.modelValue, ...value }),
})

const reminderTypeOptions = [
  { title: 'Soin', value: 'soin' },
  { title: 'Activité', value: 'activité' },
  { title: 'Alimentation', value: 'alimentation' },
  { title: 'Autres', value: 'autres' },
]

const recurrenceUnits = [
  { title: 'Jours', value: 'days' },
  { title: 'Mois', value: 'months' },
  { title: 'Ans', value: 'years' },
]
</script>

<style scoped>
.reminder-form {
  margin: 0;
}
</style>
