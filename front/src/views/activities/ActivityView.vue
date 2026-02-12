<template>
    <div class="page" :style="{ minHeight: '100vh', backgroundColor: '#fdfaf6' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Activités
                </v-card-title>
            </div>
            
            <div class="d-flex flex-column ga-4">
                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn 
                        variant="outlined" 
                        :to="{ name: 'Dashboard' }"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        variant="flat"
                        rounded="lg"
                        :to="{ name: 'ActivityCreate', params: { id: horsesStore.horseId} }"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                        class="text-none"
                    >
                        <v-icon start icon="mdi-plus" />
                        Ajouter
                    </v-btn>
                </div>

                <v-card 
                    class="pa-2" 
                    variant="flat" 
                    rounded="lg"
                    :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
                >
                    <v-card-title class="text-subtitle-1 font-weight-bold" :style="{ color: '#3c3226' }">
                        Filtres
                    </v-card-title>
                    <v-card-text class="pt-3">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="horsesStore.horseId"
                                    :items="horsesStore.horseFilterOptions"
                                    label="Cheval"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-skeleton-loader
                    v-if="isLoading"
                    type="list-item-two-line, list-item-two-line, list-item-two-line"
                />
                
                <ActivityList
                    v-else
                    :grouped-activities="groupedActivities"
                    :card-max-width="cardMaxWidth"
                    :get-activity-actions="getActivityActions"
                    :intensity-label="intensityLabel"
                />
            </div>

            <ConfirmDeleteDialog
                v-model="isDeleteOpen"
                title="Supprimer l'activité"
                :message="deleteMessage"
                @confirm="confirmDelete"
            />

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                timeout="2500"
            >
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { eventsApi } from "@/api/events";
import { ConfirmDeleteDialog } from "@/components";
import { useHorsesStore } from "@/stores/HorsesStore";
import { formatMonthLabel, sortByDateAsc, toMonthKey } from "@/libs/date";
import type { ActivityAction, ActivityGroup, Event } from "@/types";
import { ActivityList } from "@/views/activities";

const route = useRoute();
const { mdAndUp } = useDisplay();
const horsesStore = useHorsesStore(); // Initialisation du Store
    
const activities = ref<Event[]>([]);
const isLoading = ref(true);
const isDeleteOpen = ref(false);
const selectedActivity = ref<Event | null>(null);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const cardMaxWidth = computed(() => (mdAndUp.value ? "520px" : "100%"));

const isActivity = (event: Event): boolean =>
    event.reminder_type === "activité" || Boolean(event.activity_type);

const filteredActivities = computed(() =>
    activities.value.filter(isActivity),
);

const groupedActivities = computed<ActivityGroup[]>(() => {
    const groups = new Map<string, Event[]>();
    filteredActivities.value.forEach((activity) => {
        const key = toMonthKey(activity.event_date);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(activity);
    });

    return Array.from(groups.entries() as IterableIterator<[string, Event[]]>)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, items]): ActivityGroup => ({
            key,
            label: formatMonthLabel(key),
            items: sortByDateAsc(items),
        }));
});

const intensityLabel = (value?: string): string => {
    switch (value) {
        case "legere":
            return "Légère";
        case "soutenue":
            return "Soutenu";
        case "normale":
        default:
            return "Normal";
    }
};

const openDelete = (activity: Event) => {
    selectedActivity.value = activity;
    isDeleteOpen.value = true;
};

const getActivityActions = (activity: Event): ActivityAction[] => [
    {
        key: "view",
        title: "Voir",
        icon: "mdi-eye",
        disabled: false,
        to:{ name: "ActivityDetails", params: { id: activity.id } },
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        to: { name: "ActivityEdit", params: { id: activity.id } },
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDelete(activity),
    },
];

const deleteMessage = computed(() =>
    selectedActivity.value
        ? `Confirmer la suppression de ${selectedActivity.value.name || "cette activité"} ?`
        : "Confirmer la suppression de cette activité ?",
);

const confirmDelete = async () => {
    if (!selectedActivity.value) return;
    try {
        await eventsApi.delete(selectedActivity.value.id);
        activities.value = activities.value.filter(
            (item) => item.id !== selectedActivity.value?.id,
        );
        isDeleteOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Activité supprimée.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting activity:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const loadActivities = async () => {
    isLoading.value = true;
    try {
        // Utilisation de la valeur du store pour filtrer
        const horseFilter =
            horsesStore.horseId !== "all"
                ? horsesStore.horseId
                : undefined;
        activities.value = await eventsApi.getAll(horseFilter as string);
    } catch (error) {
        console.error("Error loading activities:", error);
    } finally {
        isLoading.value = false;
    }
};


onMounted(async () => {
    const horseIdFromUrl = route.params.id as string;
    if (horseIdFromUrl) horsesStore.sethorseId(horseIdFromUrl);
    
    await loadActivities();
});

// Réaction au changement de cheval dans le filtre
watch(
    () => horsesStore.horseId,
    () => {
        loadActivities();
    },
);
</script>