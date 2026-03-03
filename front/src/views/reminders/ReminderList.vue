<template>
  <div v-if="items && items.length" class="reminder-groups">
    <div v-for="group in groupedReminders" :key="group.status" class="mb-6">
      
      <div class="d-flex align-center mb-3 px-2">
        <div 
          class="text-overline font-weight-bold flex-shrink-0 text-no-wrap" 
          :style="{ color: group.color, opacity: 0.9, letterSpacing: '1px' }"
        >
          {{ group.label }}
        </div>
        <v-divider class="ms-4" :color="group.color" style="opacity: 0.2"></v-divider>
      </div>

      <div class="d-flex flex-column ga-2"> <v-card 
          v-for="reminder in group.items" 
          :key="reminder.id"
          variant="flat" 
          rounded="lg" 
          class="pa-3 shadow-subtle border-light bg-white"
        >
          <div class="d-flex align-center">
            <div class="status-line" :style="{ backgroundColor: getStatusColor(reminder) }"></div>
            
            <div class="flex-grow-1 ms-3 overflow-hidden">
              <div class="d-flex justify-space-between align-start">
                <div class="overflow-hidden">
                  <div class="text-caption font-weight-bold" :style="{ color: '#7B5B3E', fontSize: '0.7rem !important' }">
                    {{ formatDateLong(getReminderDate(reminder)) }}
                  </div>
                  <h3 class="text-body-2 font-weight-bold text-truncate leading-tight" :style="{ color: '#2E4B36' }">
                    {{ getReminderTitle(reminder) }}
                  </h3>
                </div>
                
                <v-chip
                  v-if="reminder.reminder_type"
                  size="x-small"
                  variant="tonal"
                  :color="getTypeColor(reminder.reminder_type)"
                  class="font-weight-black ms-2"
                  style="height: 18px; font-size: 0.6rem !important;"
                >
                  {{ reminderTypeLabel(reminder.reminder_type) }}
                </v-chip>
              </div>

              <div class="d-flex align-center mt-1">
                <v-icon size="14" color="#7a6e61" class="me-1">mdi-horse</v-icon>
                <span class="text-caption font-weight-medium text-truncate" :style="{ color: '#554338' }">
                  {{ getHorseName(reminder.horse_id) || 'Cheval inconnu' }}
                </span>
              </div>
            </div>

            <div class="d-none d-md-flex ga-1 ms-4">
              <v-btn
                v-for="action in getReminderActions(reminder)"
                :key="action.key"
                icon
                variant="text"
                size="small"
                :color="action.color || '#2E4B36'"
                @click.stop="$emit('action', { key: action.key, reminder })"
              >
                <v-icon size="20">{{ action.icon }}</v-icon>
              </v-btn>
            </div>

            <div class="d-md-none">
              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" color="#7a6e61" size="small"></v-btn>
                </template>
                <v-list rounded="lg" density="compact" elevation="8">
                  <v-list-item
                      v-for="action in getReminderActions(reminder)"
                      :key="action.key"
                      :prepend-icon="action.icon"
                      :title="action.title"
                      :base-color="action.color"
                      class="text-caption"
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
  
  <div v-else class="text-center pa-8 bg-white rounded-xl mt-4 border-dashed">
    <v-icon size="48" color="#EFE5D9" class="mb-2">mdi-calendar-check</v-icon>
    <p class="text-subtitle-2 font-weight-bold" :style="{ color: '#7a6e61' }">Tout est à jour !</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getStatusKey } from "@/libs/index";

// Typage plus strict pour éviter les erreurs d'accès
const props = defineProps<{
  items: any[];
  getStatusColor: (item: any) => string;
  getReminderTitle: (item: any) => string;
  getHorseName: (id: any) => string;
  reminderTypeLabel: (type: any) => string;
  getReminderActions: (item: any) => any[];
  formatDateLong: (date: any) => string;
  getReminderDate: (item: any) => any;
  getTypeColor: (type: any) => string;
}>();

defineEmits(['action']);

const groupedReminders = computed(() => {
  // On s'assure que items est bien un tableau avant de boucler
  if (!Array.isArray(props.items)) return [];

  const groups = [
    { status: 'overdue', label: 'En retard', color: '#D32F2F', items: [] as any[] },
    { status: 'today', label: "Aujourd'hui", color: '#6B4F3A', items: [] as any[] },
    { status: 'upcoming', label: 'À venir', color: '#2E4B36', items: [] as any[] }
  ];

  props.items.forEach(item => {
    const status = getStatusKey(item);
    // On met en 'upcoming' par défaut si le statut est inconnu pour éviter le crash
    const targetStatus = status || 'upcoming';
    const group = groups.find(g => g.status === targetStatus);
    if (group) group.items.push(item);
  });

  return groups.filter(g => g.items.length > 0);
});
</script>

<style scoped>
.status-line {
  width: 3px; /* Plus fin */
  height: 32px;
  border-radius: 2px;
}
.shadow-subtle {
  box-shadow: 0 2px 8px rgba(123, 91, 62, 0.05) !important;
}
.border-dashed {
    border: 2px dashed #EFE5D9 !important;
}
.leading-tight {
  line-height: 1.2;
}
</style>