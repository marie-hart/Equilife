<template>
  <div class="dashboard">
    <main class="mx-3 d-flex flex-column ga-3">
        <RemindersCard />

        <HealthCard />

        <v-col cols="12" class="d-flex flex-row ga-3">
            <v-btn
              class="w-50 text-white action-bg-training justify-center"
              height="50"
              rounded="lg"
              variant="flat"
              @click="goToActivities"
            >
            <template v-slot:prepend>
              <v-img
                src="/equestre.png"
                max-width="42"
                max-height="42"
                contain
              />
            </template>

            <div class="text-body-2 font-weight-medium lh-tight">
              <div>Suivi</div>
              <div>d'Entraînement</div>
            </div>
          </v-btn>


              <v-card
                rounded="lg"
                height="50"
                class="w-50 text-white action-bg-feeding"
                @click="goToFeeding"
              >
                <div class="d-flex flex-column ga-1">
                  <v-img
                    src="/alimentation.png"
                    max-width="30"
                    max-height="30"
                    contain
                  />
                  <div class="text-body-2 font-weight-medium">
                    Alimentation
                  </div>
                </div>
              </v-card>
              </v-col>
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
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "../api/events";
import { getActiveHorseId } from "../utils/horseProfile"
import type { Event, SelectedKind } from "../types";
import { deleteLabel } from '../utils/action'
import  RemindersCard  from './reminders/RemindersCard.vue'
import HealthCard from './health/HealthCard.vue'
import QuickNoteDialog from './quickNote/QuickNoteDialog.vue'
import QuickNoteCard from './quickNote/QuickNoteCard.vue'

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);

const route = useRoute();
const router = useRouter();

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
    const horseId = getActiveHorseId();
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

const goToActivities = () => {
  const horseId = getActiveHorseId();
  if (horseId) {
    router.push({ name: "HorseActivities", params: { id: horseId } });
    return;
  }
  router.push("/horses/:id/activities");
};

const goToFeeding = () => {
  const horseId = getActiveHorseId();
  if (horseId) {
    router.push({ name: "HorseFeeding", params: { id: horseId } });
    return;
  }
  router.push("/horses");
};

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
