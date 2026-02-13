<template>
    <div>
        <v-container fluid class="pa-3">
            <v-skeleton-loader
                v-if="isLoading"
                type="card, card, card"
            />

            <template v-else>
                <div class="mb-4">
                    <v-card rounded="xl" height="100%">
                        <HorseProfileCard
                            :horseProfile="horsesStore.selectedHorse"
                            :horses="horsesStore.horses"
                        />
                    </v-card>
                 </div>   
                 
                 <div class="mb-4">
                    <QuickNoteView />
                 </div>

               <v-row v-if="smAndDown" dense>
                    <v-col cols="12" sm="6">
                        <v-card
                            :to="getActivitiesRoute()"
                            link
                            rounded="xl"
                            variant="tonal"
                            style="background-color: #f1d9c2;"
                            class="pa-4"
                        >
                <div class="d-flex align-center ga-3">
                    <img
                        src="/equestre.png"
                        alt="Suivi d’entraînement"
                        width="32"
                    />
                   <div>
                        <div class="text-subtitle-1 font-weight-medium">
                            Suivi d’entraînement
                        </div>
                        <div class="text-caption text-grey-darken-1">
                            Activités & séances
                        </div>
                    </div>
                </div>
                </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-card
                    :to="goToFeeding()"
                    link
                    rounded="xl"
                    variant="tonal"
                    style="background-color:#c7c8b7;"
                    class="pa-4"
                    >
                    <div class="d-flex align-center ga-3">
                        <img
                        src="/ration.png"
                        alt="Alimentation"
                        width="32"
                        />
                        <div>
                        <div class="text-subtitle-1 font-weight-medium">
                            Alimentation
                        </div>
                        <div class="text-caption text-grey-darken-1">
                            Rations & repas
                        </div>
                    </div>
                    </div>
                    </v-card>
                </v-col>
                </v-row>

                <div class="mt-4">
                    <ReminderCard />
                </div>
            </template>
        </v-container>

        <v-dialog v-model="deleteDialogOpen" max-width="420">
            <v-card>
                <v-card-title>Supprimer</v-card-title>
                <v-card-text>
                    Confirmer la suppression de
                    <strong>{{ deleteLabel }}</strong> ?
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="outlined" @click="deleteDialogOpen = false">
                        Annuler
                    </v-btn>
                    <v-btn
                        color="error"
                        variant="flat"
                        @click="confirmDelete"
                    >
                        Supprimer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="2500"
        >
            {{ snackbar.message }}
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { eventsApi } from "../api/events";
import type { Event, SelectedKind } from "../types";
import { ReminderCard } from "./reminders";
import { QuickNoteView } from "./quickNote";
import { useDisplay } from "vuetify";
import { HorseProfileCard } from "./horses";
import type { Horse } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useRoute } from 'vue-router';

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);
const isLoading = ref(true);

const { smAndDown } = useDisplay();
const horsesStore = useHorsesStore();
const route = useRoute()

const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);

const loadDashboard = async () => {
    isLoading.value = true;
    try {
       const currentHorseId = horsesStore.horseId;

       if (!currentHorseId) return;

        const [eventsResponse, remindersResponse] = await Promise.all([
            eventsApi.getAll(String(currentHorseId)),
            eventsApi.getReminders(String(currentHorseId)),
        ]);

        events.value = eventsResponse;
        reminders.value = remindersResponse;
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    } finally {
        isLoading.value = false;
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
    if (horsesStore.horseId && horsesStore.horseId !== "all") {
        return { name: "HorseActivities", params: { id: horsesStore.horseId } };
    }
    return "/horses/:id/activities";
};

const goToFeeding = () => {
    if (horsesStore.horseId && horsesStore.horseId !== "all") {
        return { name: "FeedingView", params: { id: horsesStore.horseId } };
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

// UPDATED: Watch store horseId to reload data
watch(() => horsesStore.horseId, () => {
    loadDashboard();
});
</script>