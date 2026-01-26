<template>
  <div class="dashboard">
    <main class="mx-3 d-flex flex-column ga-3">
        <RemindersCard />

        <HealthCard />

        <VRow no-gutters class="mx-n1">
          <VCol cols="12" sm="6" class="pa-1">
            <v-btn
              class="action-bg-training text-body-2 font-weight-medium"
              height="60"
              rounded="lg"
              variant="flat"
              block
              :to="getActivitiesRoute()"
            >
              <template v-slot:prepend>
                <img src="/equestre.png" alt="" width="42" />
              </template>
                Suivi d'Entraînement
            </v-btn>
          </VCol>

          <VCol cols="12" sm="6" class="pa-1">
            <v-btn
              class="action-bg-feeding text-body-2 font-weight-medium"
              height="60"
              rounded="lg"
              variant="flat"
              block
              :to="goToFeeding()"
            >
              <template v-slot:prepend>
                  <img src="/alimentation.png" alt="" width="30">
              </template>
              Alimentation
            </v-btn>
          </VCol>
        </VRow>

        <QuickNoteCard />
    </main>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card>
        <v-card-title>Supprimer</v-card-title>
        <v-card-text>
          Confirmer la suppression de
          <strong>{{ deleteLabel }}</strong> ?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="deleteDialogOpen = false"
            >Annuler</v-btn
          >
          <v-btn color="error" variant="flat" @click="confirmDelete"
            >Supprimer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>

    <QuickNoteDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { eventsApi } from "../api/events";
import { getActiveHorseId } from "../libs/horseProfile.js"
import type { Event, SelectedKind } from "../types";
import  RemindersCard  from './reminders/RemindersCard.vue'
import HealthCard from './health/HealthCard.vue'
import QuickNoteDialog from './quickNote/QuickNoteDialog.vue'
import QuickNoteCard from './quickNote/QuickNoteCard.vue'

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);

const route = useRoute();

const routeHorseId = computed(() => route.params.id as string | undefined);

const horseId = getActiveHorseId(routeHorseId.value);

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);

const loadDashboard = async () => {
  try { 
    const [eventsResponse, remindersResponse] = await Promise.all([
      eventsApi.getAll(horseId),
      eventsApi.getReminders(horseId),
    ]);

    events.value = eventsResponse;
    reminders.value = remindersResponse;
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
};

const confirmDelete = async () => {
  try {
    if (selectedKind.value === "event" && selectedEvent.value) {
      await eventsApi.delete(selectedEvent.value.id);
    }
    deleteDialogOpen.value = false;
    await loadDashboard();
    snackbar.value = {
      show: true,
      message: "Suppression effectuée.",
      color: "success",
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    snackbar.value = {
      show: true,
      message: "Suppression impossible.",
      color: "error",
    };
  }
};

const getActivitiesRoute = () => {
  if (horseId) {
    return { name: "HorseActivities", params: { id: horseId } };
  }
  return "/horses/:id/activities";
};

const goToFeeding = () => {
  if (horseId) {
    return { name: "HorseFeeding", params: { id: horseId } };
  }
  return "/horses/:id/feeding";
};

const deleteLabel = computed(() => {
  if (selectedKind.value === "event" && selectedEvent.value) {
    return selectedEvent.value.name;
  }
  return "";
});

onMounted(async () => {
  await loadDashboard();
});

watch(
  () => route.params.id,
  () => {
    loadDashboard();
  },
);
</script>

<style scoped>
.action-bg-training {
  background: url("/training.svg") center / cover no-repeat;
  cursor: pointer;
}

.action-bg-feeding {
  background: url("/alimentation.svg") center / cover no-repeat;
  cursor: pointer;
}

.action-bg-training:hover,
.action-bg-feeding:hover {
  box-shadow: 0 6px 18px rgba(30, 99, 176, 0.2);
}
</style>
