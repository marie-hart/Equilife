<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container class="px-4 py-2">
      <div class="d-flex align-center justify-space-between mb-8">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Détails
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn 
          variant="text" 
          icon="mdi-close"
          color="#2E4B36"
          @click="router.back()"
        ></v-btn>
      </div>

      <v-skeleton-loader
        v-if="isLoading"
        type="article, actions"
        bg-color="transparent"
      />

      <div v-else-if="event">
        <v-card variant="flat" color="#2E4B36" theme="dark" rounded="xl" class="pa-6 mb-6 shadow-subtle">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-overline mb-1" style="color: rgba(255,255,255,0.7)">{{ event.activity_type || event.name }}</div>
              <div class="text-h5 font-weight-bold">{{ formatDateLong(event.event_date) }}</div>
            </div>
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon size="28">{{ getActivityIcon(event.activity_type) }}</v-icon>
            </v-avatar>
          </div>
        </v-card>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 text-center">
              <v-icon color="#7B5B3E" class="mb-1">mdi-clock-outline</v-icon>
              <div class="text-caption" style="color: #7B5B3E">Durée</div>
              <div class="text-subtitle-1 font-weight-bold" style="color: #2E4B36">
                {{ event.activity_duration_minutes || '-' }} min
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 text-center">
              <v-icon color="#7B5B3E" class="mb-1">mdi-gauge</v-icon>
              <div class="text-caption" style="color: #7B5B3E">Intensité</div>
              <div class="text-subtitle-1 font-weight-bold" style="color: #2E4B36">
                {{ intensityLabel(event.activity_intensity) }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Notes de séance</div>
        <v-card variant="flat" color="white" rounded="xl" class="pa-5 mb-8 shadow-subtle border-light">
          <p class="text-body-1 mb-0" style="color: #554338; line-height: 1.6; font-style: italic;">
            "{{ event.activity_comment || event.description || 'Aucune note pour cette séance.' }}"
          </p>
        </v-card>

        <div class="d-flex ga-3">
          <v-btn
            variant="flat"
            color="#2E4B36"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            size="large"
            prepend-icon="mdi-pencil"
            :to="{ name: 'ActivityEdit', params: { id } }"
          >
            Modifier
          </v-btn>
          <v-btn
            variant="tonal"
            color="#B00020"
            rounded="xl"
            class="text-none font-weight-bold"
            size="large"
            prepend-icon="mdi-trash-can-outline"
            @click="deleteDialogOpen = true"
          >
            Supprimer
          </v-btn>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <v-icon size="64" color="#D1C7BC">mdi-alert-circle-outline</v-icon>
        <p class="mt-4" style="color: #7B5B3E">Événement introuvable</p>
        <v-btn variant="text" color="#2E4B36" class="mt-2" @click="router.back()">Retour</v-btn>
      </div>

      <ConfirmDeleteDialog
        v-model="deleteDialogOpen"
        title="Supprimer l'activité ?"
        message="Cette action est irréversible."
        @confirm="confirmDelete"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
        <div class="text-center w-100">{{ snackbar.message }}</div>
      </v-snackbar>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { useEventsStore } from "@/stores/EventsStore";
import { formatDateLong } from "@/libs/date";
import { ConfirmDeleteDialog } from "@/components";
import { logger } from "@/services/LoggerService";
import type { Event } from "@/types";

const route = useRoute();
const router = useRouter();
const eventsStore = useEventsStore();
const event = ref<Event | null>(null);
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({ show: false, message: "", color: "#2E4B36" });

const id = route.params.id as string;

const intensityLabel = (value?: string): string => {
    switch (value) {
        case "legere": return "Légère";
        case "soutenue": return "Soutenue";
        default: return "Normale";
    }
};

const getActivityIcon = (type?: string) => {
  const map: Record<string, string> = {
    'Travail sur le plat': 'mdi-horse-variant',
    'Longe': 'mdi-sync',
    'Obstacle': 'mdi-chevron-up-box',
    'Balade': 'mdi-map-marker-distance',
    'Repos': 'mdi-moon-waning-crescent'
  };
  return map[type || ''] || 'mdi-calendar-star';
};

const loadEvent = async () => {
    try {
        event.value = await eventsApi.getById(id);
    } catch (error) {
        logger.error("Error loading activity details", error);
    } finally {
        isLoading.value = false;
    }
};

const confirmDelete = async () => {
    try {
        await eventsStore.deleteEvent(id);
        snackbar.value = { show: true, message: "Activité supprimée", color: "#2E4B36" };
        setTimeout(() => router.push({ name: "HorseActivities" }), 1000);
    } catch (error) {
        snackbar.value = { show: true, message: "Erreur lors de la suppression", color: "#B00020" };
    } finally {
        deleteDialogOpen.value = false;
    }
};

onMounted(loadEvent);
</script>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
</style>
