<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5">Activités</v-card-title>
            </div>
            <div class="d-flex flex-column ga-4">
                <v-card class="section-card" variant="outlined">
                    <v-card-title class="text-subtitle-1">Filtres</v-card-title>
                    <v-card-text class="pt-3">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="selectedHorseId"
                                    :items="horseFilterOptions"
                                    label="Cheval"
                                    density="compact"
                                    variant="outlined"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn variant="outlined" @click="goToDashboard">
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        class="primary-btn"
                        color="primary"
                        variant="flat"
                        @click="goToActivityCreate"
                    >
                        <v-icon icon="mdi-plus" class="me-2" />
                        Ajouter
                    </v-btn>
                </div>

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

            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { eventsApi } from "@/api/events";
import { ConfirmDeleteDialog } from "@/components";
import { useHorseSelection } from "@/composable/useHorseSelection";
import { formatMonthLabel, sortByDateAsc, toMonthKey } from "@/libs/date";
import type { Event } from "@/types";
import { ActivityList } from "@/views/activities";

type ActivityAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

type ActivityGroup = {
    key: string;
    label: string;
    items: Event[];
};

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();

const { horseFilterOptions, selectedHorseId, setHorseFromParamsOrStored } = useHorseSelection();
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
        const existing = groups.get(key);
        if (existing) {
            existing.push(activity);
        } else {
            groups.set(key, [activity]);
        }
    });
    const keys = Array.from(groups.keys()).sort().reverse();
    return keys.map((key) => ({
        key,
        label: formatMonthLabel(key),
        items: sortByDateAsc(groups.get(key) ?? []).reverse(),
    }));
});

const deleteMessage = computed(() =>
    selectedActivity.value
        ? `Confirmer la suppression de ${selectedActivity.value.name} ?`
        : "Confirmer la suppression de cette activité ?",
);

const intensityLabel = (value?: string): string => {
    switch (value) {
        case "legere":
            return "Légère";
        case "normale":
            return "Normale";
        case "soutenue":
            return "Soutenue";
        default:
            return "";
    }
};

const loadActivities = async () => {
    isLoading.value = true;
    try {
        const horseId =
            selectedHorseId.value !== "all" ? selectedHorseId.value : undefined;
        activities.value = await eventsApi.getAll(horseId);
    } catch (error) {
        console.error("Error loading activities:", error);
    } finally {
        isLoading.value = false;
    }
};

const goToActivityCreate = () => {
    const horseId = route.params.id as string | undefined;
    if (horseId) {
        router.push({ name: "HorseActivityCreate", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

const openView = (activity: Event) => {
    router.push({ name: "EventDetails", params: { id: activity.id } });
};

const openEdit = (activity: Event) => {
    router.push({ name: "ActivityEdit", params: { id: activity.id } });
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
        onClick: () => openView(activity),
    },
    {
        key: "edit",
        title: "Modifier",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => openEdit(activity),
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

const confirmDelete = async () => {
    if (!selectedActivity.value) return;
    try {
        await eventsApi.delete(selectedActivity.value.id);
        snackbar.value = {
            show: true,
            message: "Activité supprimée.",
            color: "success",
        };
        await loadActivities();
    } catch (error) {
        console.error("Error deleting activity:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    } finally {
        isDeleteOpen.value = false;
    }
};

watch(selectedHorseId, () => {
    loadActivities();
});

onMounted(async () => {
    setHorseFromParamsOrStored("all");
    await loadActivities();
});
</script>
