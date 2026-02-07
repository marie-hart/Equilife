<template>
    <div>
        <v-container fluid class="pa-3">
            <v-skeleton-loader
                v-if="isLoading"
                type="card, card, card"
            />

            <template v-else>
                <!-- PROFIL  -->
                 <div class="mb-4">
                    <v-card rounded="xl" height="100%">
                        <HorseProfileCard
                            :horseProfile="horseProfile"
                            :horses="horses"
                            @select="onHorseSelect"
                        />
                    </v-card>
                 </div>   
                 
                 <div class="mb-4">
                    <QuickNoteView />
                 </div>

               <!-- ACTIONS : < md -->
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

                <!-- RAPPELS + Notes -->
               <div class="mt-4">
                    <ReminderCard />
                </div>
            </template>
        </v-container>

        <!-- DIALOG -->
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

        <!-- SNACKBAR -->
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
import { useRoute } from "vue-router";
import { eventsApi } from "../api/events";
import { getActiveHorseId } from "../libs/horseProfile.js";
import type { Event, SelectedKind } from "../types";
import { ReminderCard } from "./reminders";
import { QuickNoteView } from "./quickNote";
import { useDisplay } from "vuetify";
import { HorseProfileCard } from "./horses";
import { useHorseSelection } from "@/composables/useHorseSelection";
import type { Horse } from "@/types";


const { mdAndUp, smAndDown } = useDisplay();

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);
const isLoading = ref(true);

const route = useRoute();

const {
    horses,
    selectedHorseId,
    horseById,
} = useHorseSelection({ useRouteHorseId: true });


const horseProfile = computed(() =>
  selectedHorseId.value && selectedHorseId.value !== "all"
    ? horseById.value.get(selectedHorseId.value) ?? null
    : null
);


const onHorseSelect = (horse: Horse) => {
    selectedHorseId.value = horse.id;
};

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
    isLoading.value = true;
    try {
        const [eventsResponse, remindersResponse] = await Promise.all([
            eventsApi.getAll(horseId),
            eventsApi.getReminders(horseId),
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
