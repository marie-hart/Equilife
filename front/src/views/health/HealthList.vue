<template>
  <div v-if="items.length" class="care-list-container">
    <div class="d-flex flex-column ga-3">
      <v-card
        v-for="care in items"
        :key="care.id"
        variant="flat"
        rounded="xl"
        class="pa-3 shadow-subtle border-light bg-white care-card clickable"
        @click="$emit('click:care', care)"
      >
        <div class="d-flex align-center">
          <div class="status-indicator" :style="{ backgroundColor: getCategoryColor(care.category) }"></div>
          
          <div class="flex-grow-1 ms-3">
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="text-caption font-weight-bold mb-1" style="color: #7B5B3E">
                  {{ $vuetify.display.mdAndUp ? formatDate(care.event_date) : formatDateMobile(care.event_date) }}
                </div>
                
                <h3 class="text-subtitle-1 font-weight-black leading-tight" style="color: #2E4B36">
                  {{ care.name }}
                </h3>
              </div>

              <div class="d-flex align-center ga-2">
                <v-chip
                  v-if="care.category"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold text-white"
                  :style="{ backgroundColor: getCategoryColor(care.category) }"
                >
                  {{ care.category }}
                </v-chip>
                <v-chip
                  v-if="showDoneTag"
                  size="x-small"
                  variant="flat"
                  color="#2E4B36"
                  class="font-weight-bold"
                >
                  <v-icon start size="12">mdi-check</v-icon>
                  Done
                </v-chip>
                <v-chip
                  v-else-if="recurrenceLabel(care) !== '-'"
                  size="x-small"
                  variant="tonal"
                  color="#7B5B3E"
                  class="font-weight-bold"
                >
                  <v-icon start size="12">mdi-refresh</v-icon>
                  {{ recurrenceLabel(care) }}
                </v-chip>
              </div>
            </div>

            <div class="d-flex align-center mt-2">
              <v-icon size="14" color="#a89f94" class="me-1">mdi-horse</v-icon>
              <span class="text-caption font-weight-medium" style="color: #554338">
                {{ getHorseName(String(care.horse_id)) }}
              </span>
            </div>

            <p
              v-if="care.description"
              class="text-body-2 mt-2 mb-0 text-medium-emphasis"
              style="color: #7B5B3E; line-height: 1.4;"
            >
              {{ care.description }}
            </p>
          </div>

          <div v-if="!showDoneTag" class="ms-2" @click.stop>
            <ActionButtons
              mode="auto"
              button-size="small"
              menu-button-size="small"
              :actions="getCareActions(care)"
              color="#a89f94"
            />
          </div>
        </div>
      </v-card>
    </div>
  </div>
  
  <div v-else class="text-center pa-10 bg-white rounded-xl mt-4 border-light">
    <v-icon size="48" color="#EFE5D9" class="mb-2">mdi-medication-outline</v-icon>
    <p class="text-subtitle-1 font-weight-bold" style="color: #7a6e61">Historique vide</p>
    <p class="text-caption" style="color: #a89f94">Aucun soin enregistré pour le moment.</p>
  </div>
</template>

<style scoped>
.status-indicator {
  width: 3px;
  height: 35px;
  border-radius: 10px;
  opacity: 0.6;
}
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.06) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
.leading-tight {
  line-height: 1.2;
}
.clickable {
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import type { CareAction, Event } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";

const props = withDefaults(
    defineProps<{
        items: (Event | import("@/types").CareHistoryEntry)[];
        formatDate: (dateString: string) => string;
        formatDateMobile: (dateString: string) => string;
        recurrenceLabel: (care: Event | import("@/types").CareHistoryEntry) => string;
        getCareActions: (care: Event | import("@/types").CareHistoryEntry) => CareAction[];
        showDoneTag?: boolean;
    }>(),
    { showDoneTag: false },
);

defineEmits<{
    (e: "click:care", care: Event | import("@/types").CareHistoryEntry): void;
}>();

const horsesStore = useHorsesStore(); 

const getHorseName = (horseId: string) => {
    return horsesStore.getHorseNameById(horseId); 
};

const normalizeCategory = (value?: string): string =>
    (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

const getCategoryColor = (category?: string): string => {
    const normalized = normalizeCategory(category);
    if (normalized === "maladie") return "#B64E4E";
    if (normalized === "bobo") return "#C8832B";
    if (normalized === "soins courants" || normalized === "soin courant") return "#4E7A4B";
    if (normalized === "cures" || normalized === "cure") return "#6E5A9A";
    return "#2E4B36";
};
</script>