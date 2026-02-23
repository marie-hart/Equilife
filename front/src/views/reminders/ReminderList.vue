<template>
  <div v-if="items.length" class="reminder-groups">
    <div v-for="group in groupedReminders" :key="group.status" class="mb-8">
      
      <div class="d-flex align-center mb-4 px-2">
        <div 
          class="text-overline font-weight-bold" 
          :style="{ color: group.color, opacity: 0.9, letterSpacing: '1.5px' }"
        >
          {{ group.label }}
        </div>
        <v-divider class="ms-4" :color="group.color" style="opacity: 0.2"></v-divider>
      </div>

      <div class="d-flex flex-column ga-3">
        <v-card 
          v-for="reminder in group.items" 
          :key="reminder.id"
          variant="flat" 
          rounded="xl" 
          class="pa-3 shadow-subtle border-light bg-white"
        >
          <div class="d-flex align-center">
            <div class="status-line" :style="{ backgroundColor: getStatusColor(reminder) }"></div>
            
            <div class="flex-grow-1 ms-4">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="text-caption font-weight-bold mb-1" :style="{ color: '#7B5B3E' }">
                    {{ formatDateLong(getReminderDate(reminder)) }}
                  </div>
                  <h3 class="text-h9 font-weight-bold leading-tight" style="color: #2E4B36">
                    {{ getReminderTitle(reminder) }}
                  </h3>
                </div>
                
                <v-chip
                  v-if="reminder.reminder_type"
                  size="x-small"
                  variant="tonal"
                  :color="getTypeColor(reminder.reminder_type)"
                  class="font-weight-black"
                >
                  {{ reminderTypeLabel(reminder.reminder_type) }}
                </v-chip>
              </div>

              <div class="d-flex align-center mt-2">
                <v-icon size="16" color="#7a6e61" class="me-1">mdi-horse</v-icon>
                <span class="text-body-2 font-weight-medium" style="color: #554338">
                  {{ getHorseName(reminder.horse_id) }}
                </span>
              </div>
            </div>

            <div class="d-none d-md-flex ga-2 ms-4">
              <v-btn
                v-for="action in getReminderActions(reminder)"
                :key="action.key"
                icon
                variant="text"
                size="small"
                :color="action.color || '#2E4B36'"
                @click.stop="$emit('action', { key: action.key, reminder })"
              >
                <v-icon>{{ action.icon }}</v-icon>
              </v-btn>
            </div>

            <div class="d-md-none ms-2">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" color="#7a6e61"></v-btn>
                </template>
                <v-list rounded="lg" density="comfortable">
                  <v-list-item
                      v-for="action in getReminderActions(reminder)"
                      :key="action.key"
                      :prepend-icon="action.icon"
                      :title="action.title"
                      :base-color="action.color"
                      @click="$emit('action', { key: action.key, reminder })"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center pa-10 bg-white rounded-xl mt-4">
    <v-icon size="64" color="#EFE5D9" class="mb-4">mdi-calendar-check</v-icon>
    <p class="text-h6 font-weight-medium" style="color: #7a6e61">Tout est à jour !</p>
    <p class="text-body-2" style="color: #a89f94">Aucun rappel pour le moment.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getStatusKey } from "@/libs/index";

const props = defineProps<{
  items: any[];
  getStatusColor: (item: any) => string;
  getReminderTitle: (item: any) => string;
  getHorseName: (id: string) => string;
  reminderTypeLabel: (type: any) => string;
  getReminderActions: (item: any) => any[];
  // Ajout des props manquantes pour ton design
  formatDateLong: (date: any) => string;
  getReminderDate: (item: any) => any;
  getTypeColor: (type: any) => string;
}>();

defineEmits(['action']);

// On regroupe les items par statut
const groupedReminders = computed(() => {
  const groups = [
    { status: 'overdue', label: 'En retard', color: '#D32F2F', items: [] as any[] },
    { status: 'today', label: "Aujourd'hui", color: '#7B5B3E', items: [] as any[] },
    { status: 'upcoming', label: 'À venir', color: '#2E4B36', items: [] as any[] }
  ];

  props.items.forEach(item => {
    const status = getStatusKey(item);
    const group = groups.find(g => g.status === status);
    if (group) group.items.push(item);
  });

  return groups.filter(g => g.items.length > 0);
});
</script>

<style scoped>
.status-line {
  width: 4px;
  height: 40px;
  border-radius: 4px;
}
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.08) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
.leading-tight {
  line-height: 1.25;
}
</style>