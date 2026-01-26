<template>
  <v-row dense>
    <v-col
      v-for="filter in filters"
      :key="filter.key"
      cols="12"
      md="4"
    >
      <v-select
        v-if="filter.type === 'select'"
        v-model="modelValue[filter.key]"
        :items="filter.options"
        :label="filter.label"
        density="compact"
        variant="outlined"
      />

      <DatePickerField
        v-else-if="filter.type === 'date'"
        v-model="modelValue[filter.key]"
        :label="filter.label"
      />

      <v-text-field
        v-else-if="filter.type === 'search'"
        v-model="modelValue[filter.key]"
        :label="filter.label"
        density="compact"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { FilterDefinition } from "../types"
defineProps<{
  filters: readonly FilterDefinition<any>[]
  modelValue: Record<string, any>
}>()

defineEmits(['update:modelValue'])
</script>
