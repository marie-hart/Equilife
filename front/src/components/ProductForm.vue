<template>
  <v-form class="product-form" @submit.prevent="emit('submit')">
    <v-row dense>
      <v-col cols="12" md="6">
    <v-text-field v-model="name" label="Nom" density="compact" />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="category"
          :items="categoryOptions"
          label="Catégorie"
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
    <v-text-field v-model="brand" label="Marque" density="compact" />
      </v-col>
      <RecurrenceFields
        v-model="recurrence"
        :units="recurrenceUnits"
        :show="showRecurrence"
        :checkbox-md="4"
        :fields-md="8"
      />
      <v-col cols="12">
        <v-textarea v-model="note" label="Note" density="compact" variant="outlined" rows="2" />
      </v-col>
      <v-col cols="12" v-if="showRepurchase">
        <v-checkbox v-model="needsRepurchase" label="À racheter" density="compact" />
      </v-col>
    </v-row>
    <div class="d-flex justify-end ga-2">
      <v-btn v-if="showCancel" variant="text" size="small" type="button" @click="emit('cancel')">
        {{ cancelLabel }}
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
  </v-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RecurrenceFields } from './index'

type RecurrenceUnit = 'months' | 'years'

type ProductFormValue = {
  name: string
  category: string
  brand: string
  note: string
  isRecurring: boolean
  recurrenceInterval: number
  recurrenceUnit: RecurrenceUnit
  needs_repurchase?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: ProductFormValue
    loading?: boolean
    submitLabel?: string
    cancelLabel?: string
    showCancel?: boolean
    showRecurrence?: boolean
    showRepurchase?: boolean
  }>(),
  {
    loading: false,
    submitLabel: 'Enregistrer',
    cancelLabel: 'Annuler',
    showCancel: false,
    showRecurrence: true,
    showRepurchase: false,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: ProductFormValue): void
  (event: 'submit'): void
  (event: 'cancel'): void
}>()

const name = computed({
  get: () => props.modelValue.name,
  set: (value) => emit('update:modelValue', { ...props.modelValue, name: value }),
})

const category = computed({
  get: () => props.modelValue.category,
  set: (value) => emit('update:modelValue', { ...props.modelValue, category: value }),
})

const brand = computed({
  get: () => props.modelValue.brand,
  set: (value) => emit('update:modelValue', { ...props.modelValue, brand: value }),
})

const note = computed({
  get: () => props.modelValue.note,
  set: (value) => emit('update:modelValue', { ...props.modelValue, note: value }),
})

const recurrence = computed({
  get: () => ({
    isRecurring: props.modelValue.isRecurring,
    recurrenceInterval: props.modelValue.recurrenceInterval,
    recurrenceUnit: props.modelValue.recurrenceUnit,
  }),
  set: (value) => emit('update:modelValue', { ...props.modelValue, ...value }),
})

const needsRepurchase = computed({
  get: () => props.modelValue.needs_repurchase ?? false,
  set: (value) => emit('update:modelValue', { ...props.modelValue, needs_repurchase: value }),
})

const categoryOptions = [
  { title: 'Aliment', value: 'Aliment' },
  { title: 'Complément', value: 'Complément' },
  { title: 'Soin', value: 'Soin' },
  { title: 'Matériels', value: 'Matériels' },
  { title: 'Autres', value: 'Autres' },
]

const recurrenceUnits = [
  { title: 'Mois', value: 'months' },
  { title: 'Ans', value: 'years' },
]
</script>

<style scoped>
.product-form {
  margin: 0;
}
</style>
