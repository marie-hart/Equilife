<template>
    <v-sheet
        color="#EDE4D8"
        class="pb-nav"
        @touchstart.passive="onPullStart"
        @touchend.passive="onPullEnd"
        @touchcancel.passive="resetPullState"
    >
        <v-container fluid class="pa-3">
            <v-progress-linear
                v-if="isPullRefreshing"
                indeterminate
                color="#7B5B3E"
                rounded
                class="mb-3"
            />
            <v-skeleton-loader v-if="isLoading" type="card, article" bg-color="transparent" />

            <template v-else>
                <v-card rounded="xl" elevation="0" class="mb-4 border-light overflow-hidden">
                    <HorseProfileCard />
                    <v-divider thickness="3" :style="{ borderColor: '#E6DCCB' }" />
                    <QuickNoteView />
                </v-card>

                <v-row dense class="mb-4">
                    <v-col cols="6">
                        <v-btn
                            :to="getActivitiesRoute()"
                            block
                            rounded="lg"
                            height="48"
                            color="#2E4B36"
                            class="text-none"
                            elevation="2"
                            :disabled="!hasSelectedHorse"
                        >
                            <v-icon start size="20">mdi-horse-variant</v-icon>
                            Activités
                        </v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn
                            :to="goToFeeding()"
                            block
                            rounded="lg"
                            height="48"
                            color="#6B4F3A"
                            class="text-none"
                            elevation="2"
                            :disabled="!hasSelectedHorse"
                        >
                            <v-icon start size="20">mdi-food-apple</v-icon>
                            Rations
                        </v-btn>
                    </v-col>
                </v-row>

                <ReminderCard />
            </template>
        </v-container>
    </v-sheet>
</template>

<style scoped>
.shadow-subtle {
    box-shadow: 0 10px 30px rgba(46, 75, 54, 0.05) !important;
}
.border-light {
    border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
/* Marge minimale pour laisser le contenu visible au-dessus de la bottom nav */
.pb-nav {
    padding-bottom: 56px;
}
@media (min-width: 1024px) {
    .pb-nav {
        padding-bottom: 1.5rem;
    }
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { logger } from "@/services/LoggerService";
import type { Event, SelectedKind } from "../types";
import { ReminderCard } from "./reminders";
import { QuickNoteView } from "./quickNote";
import { useDisplay } from "vuetify";
import { HorseProfileCard } from "./horses";
import type { Horse } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useEventsStore } from "@/stores/EventsStore";
import { useRoute } from 'vue-router';
import { usePullToRefresh } from "@/composables/usePullToRefresh";

const events = ref<Event[]>([]);
const reminders = ref<Event[]>([]);
const isLoading = ref(true);

const { smAndDown } = useDisplay();
const horsesStore = useHorsesStore();
const eventsStore = useEventsStore();
const route = useRoute();

const hasSelectedHorse = computed(
    () =>
        Boolean(
            horsesStore.horseId &&
                horsesStore.horseId !== "all" &&
                horsesStore.selectedHorse,
        ),
);

const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);

const loadDashboard = async (forceRefresh = false) => {
    isLoading.value = true;
    try {
       const currentHorseId = horsesStore.horseId;

       if (!currentHorseId) return;

        const [eventsResponse, remindersResponse] = await Promise.all([
            eventsStore.fetchEvents(String(currentHorseId), forceRefresh),
            eventsStore.fetchReminders(String(currentHorseId), forceRefresh),
        ]);

        events.value = eventsResponse;
        reminders.value = remindersResponse;
    } catch (error) {
        logger.error("Error loading dashboard data:", error);
    } finally {
        isLoading.value = false;
    }
};

const { isPullRefreshing, onPullStart, onPullEnd, resetPullState } =
    usePullToRefresh(async () => {
        await loadDashboard(true);
    });

const confirmDelete = async () => {
    try {
        if (selectedKind.value === "event" && selectedEvent.value) {
            await eventsStore.deleteEvent(selectedEvent.value.id);
        }
        deleteDialogOpen.value = false;
        await loadDashboard(true);
        snackbar.value = {
            show: true,
            message: "Suppression effectuée.",
            color: "success",
        };
    } catch (error) {
        logger.error("Error deleting item:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const getActivitiesRoute = () => {
    if (horsesStore.horseId && horsesStore.horseId !== "all") {
        return { name: "HorseActivities" };
    }
    return { name: "Horses" };
};

const goToFeeding = () => {
    if (horsesStore.horseId && horsesStore.horseId !== "all") {
        return { name: "FeedingView" };
    }
    return { name: "Horses" };
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

watch(() => horsesStore.horseId, () => {
    loadDashboard();
});
</script>