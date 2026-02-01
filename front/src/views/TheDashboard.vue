<template>
    <div class="dashboard">
        <main class="mx-3 d-flex flex-column ga-3">
            <v-skeleton-loader
                v-if="isLoading"
                type="card, card, card"
            />
            <template v-else>
                <VRow no-gutters class="mx-n1">
                    <VCol cols="12" sm="6" class="pa-1">
                        <ReminderCard />
                    </VCol>

                    <VCol cols="12" sm="6" class="pa-1">
                        <HealthCard />
                    </VCol>
                </VRow>

                <VRow v-if="!mdAndUp" no-gutters class="mx-n1">
                    <VCol cols="12" sm="6" class="pa-1">
                        <v-btn
                            class="action-bg-training action-btn"
                            height="60"
                            rounded="lg"
                            variant="flat"
                            block
                            :to="getActivitiesRoute()"
                        >
                            <div class="action-btn-content">
                                <img
                                    src="/equestre.png"
                                    alt=""
                                    class="action-btn-icon"
                                />
                                <div class="action-btn-text">
                                    <span>Suivi</span>
                                    <span>d'Entraînement</span>
                                </div>
                            </div>
                        </v-btn>
                    </VCol>

                    <VCol cols="12" sm="6" class="pa-1">
                        <v-btn
                            class="action-bg-feeding action-btn"
                            height="60"
                            rounded="lg"
                            variant="flat"
                            block
                            :to="goToFeeding()"
                        >
                            <div class="action-btn-content">
                                <img
                                    src="/alimentation.png"
                                    alt=""
                                    class="action-btn-icon action-btn-icon--food"
                                />
                                <div class="action-btn-text">
                                    <span>Alimentation</span>
                                </div>
                            </div>
                        </v-btn>
                    </VCol>
                </VRow>

                <QuickNoteView />
            </template>
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
import { ReminderCard } from "./reminders/index";
import { HealthCard } from "./health/index";
import { QuickNoteView } from "./quickNote/index";
import { useDisplay } from "vuetify";

const { mdAndUp } = useDisplay();

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);
const isLoading = ref(true);

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

.action-btn {
    color: #ffffff;
    text-transform: none;
}

.action-btn-content {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-align: left;
}

.action-btn-text {
    display: inline-flex;
    flex-direction: column;
    line-height: 1.1;
}

.action-btn-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    background: transparent;
}

.action-btn-icon--food {
    width: 28px;
    height: 28px;
}
</style>
