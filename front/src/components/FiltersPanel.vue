<template>
  <v-card variant="flat" class="bg-transparent mb-8">
    <v-row dense align="center">
      <v-col 
        v-for="filter in filters" 
        :key="filter.key" 
        cols="12" 
        sm="4"
      >
        <v-card 
          variant="flat" 
          rounded="xl" 
          class="px-4 py-1 shadow-subtle border-light bg-white d-flex align-center"
          min-height="56"
        >
          <v-icon 
            :icon="getFilterIcon(filter.key)" 
            size="20" 
            color="#7B5B3E" 
            class="me-3" 
          />
          
          <v-select
            v-model="modelValue[filter.key]"
            :items="filter.options"
            :label="filter.label"
            variant="plain"
            density="compact"
            hide-details
            class="filter-select"
            color="#2E4B36"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  filters: any[];
  modelValue: Record<string, any>;
}>();

// Helper pour ajouter une icône spécifique par type de filtre
const getFilterIcon = (key: string) => {
  switch (key) {
    case 'horseId': return 'mdi-horse-variant';
    case 'status': return 'mdi-list-status';
    case 'type': return 'mdi-tag-outline';
    default: return 'mdi-filter-variant';
  }
};
</script>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.08) !important;
}

.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}

/* On personnalise le select de Vuetify pour qu'il soit très discret */
:deep(.filter-select .v-field__label) {
  font-size: 0.75rem !important;
  color: #7B5B3E !important;
  text-transform: uppercase;
  letter-spacing: 1px;
}

:deep(.filter-select .v-select__selection-text) {
  font-weight: 600;
  color: #2E4B36;
}
</style>