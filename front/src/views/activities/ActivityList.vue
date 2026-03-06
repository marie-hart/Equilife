<template>
  <div class="activity-journal">
    <div class="mb-6 ps-1">
          <h2 class="text-h5 font-weight-black" style="color: #2E4B36; font-family: 'serif', 'Playfair Display', Georgia, serif;">
            Journal de bord
          </h2>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;" class="mt-1"></div>
        </div>

    <div class="pt-2">
      <div v-if="groupedActivities.length">
        <div
          v-for="group in groupedActivities"
          :key="group.key"
          class="mb-8"
        >
          <div class="text-overline mb-4 ps-1" style="color: #A89F94; letter-spacing: 2px;">
            {{ group.key }}
          </div>

          <div class="d-flex flex-column ga-4">
            <div v-for="activity in group.items" :key="activity.id">
              <v-card
                variant="flat"
                color="#F5EFE6"
                rounded="xl"
                class="shadow-subtle pa-4 w-100"
              >
                <div class="d-flex align-start justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-avatar color="#EDE4D8" size="40" rounded="lg" class="me-3">
                      <v-icon :icon="getActivityIcon(activity.activity_type)" color="#2E4B36"></v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold" style="color: #2E4B36; line-height: 1.2;">
                        {{ activity.activity_type || activity.name }}
                      </div>
                      <div class="text-caption" style="color: #7B5B3E">
                        {{ formatDateMobile(activity.event_date) }}
                      </div>
                    </div>
                  </div>
                  
                  <ActionButtons
                    mode="auto"
                    button-size="small"
                    menu-button-size="small"
                    variant="text"
                    color="#A89F94"
                    :actions="getActivityActions(activity)"
                  />
                </div>

                <v-card-text class="pa-0 mt-2">
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-if="activity.activity_duration_minutes"
                      size="x-small"
                      variant="flat"
                      color="white"
                      style="color: #2E4B36"
                      prepend-icon="mdi-clock-outline"
                      class="font-weight-bold"
                    >
                      {{ activity.activity_duration_minutes }} min
                    </v-chip>
                    
                    <v-chip
                      v-if="activity.activity_intensity"
                      size="x-small"
                      variant="flat"
                      color="#2E4B36"
                      theme="dark"
                      class="font-weight-bold"
                    >
                      {{ intensityLabel(activity.activity_intensity) }}
                    </v-chip>
                  </div>

                  <div
                    v-if="activity.activity_comment || activity.description"
                    class="mt-3 pa-3 rounded-lg text-body-2 italic-note"
                    style="background-color: rgba(255, 255, 255, 0.5); color: #554338; line-height: 1.4;"
                  >
                    "{{ activity.activity_comment || activity.description }}"
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <v-icon size="64" color="#D1C7BC" class="mb-4">mdi-book-open-variant</v-icon>
        <p style="color: #A89F94; font-style: italic;">
          Le journal est vide pour le moment.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import { formatDateMobile } from "@/libs/date";
import type { ActivityAction, ActivityGroup, Event } from "@/types";

defineProps<{
  groupedActivities: ActivityGroup[];
  cardMaxWidth: string;
  getActivityActions: (activity: Event) => ActivityAction[];
  intensityLabel: (value?: string) => string;
}>();

// Helper pour les icônes d'activité
const getActivityIcon = (type: string | undefined) => {
  const map: Record<string, string> = {
    'Travail monté': 'mdi-horse-variant',
    'Longe': 'mdi-sync',
    'Soins': 'mdi-heart-pulse',
    'Sortie paddock': 'mdi-fence',
    'Balade': 'mdi-map-marker-distance',
    'Repos': 'mdi-bed-outline'
  };
  return map[type || ''] || 'mdi-calendar-check';
};
</script>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}

.italic-note {
  font-style: italic;
  position: relative;
}

.text-overline {
  font-weight: 800 !important;
  font-size: 0.7rem !important;
}
</style>