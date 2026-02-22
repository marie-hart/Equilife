<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pa-0 safe-area-top pb-10"
  >
    <v-container class="px-4 py-2">
      
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Activités
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
      </div>

       <v-btn 
          block 
          color="#2E4B36"
          size="large" 
          rounded="pill" 
          class="mb-6 text-none font-weight-bold" 
          prepend-icon="mdi-plus"
          elevation="1"
          :to="{ name: 'ActivityCreate', params: { id: horsesStore.horseId} }"
        >
          Ajouter un produit
        </v-btn>

      <div class="mb-8">
        <div class="text-overline mb-2 ps-1" style="color: #7B5B3E; letter-spacing: 1px;">Filtrer par compagnon</div>
        <v-select
          v-model="horsesStore.horseId"
          :items="horsesStore.horseFilterOptions"
          variant="solo"
          flat
          bg-color="#F5EFE6"
          rounded="xl"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-horse"
          class="shadow-subtle"
        >
          <template v-slot:selection="{ item }">
            <span class="font-weight-bold" style="color: #2E4B36">{{ item.title }}</span>
          </template>
        </v-select>
      </div>

      <div v-if="isLoading">
        <v-card v-for="i in 3" :key="i" color="#F5EFE6" variant="flat" rounded="xl" class="pa-4 mb-4">
          <v-skeleton-loader type="list-item-avatar-two-line" bg-color="transparent" />
        </v-card>
      </div>
      
      <ActivityList
        v-else
        :grouped-activities="groupedActivities"
        :card-max-width="cardMaxWidth"
        :get-activity-actions="getActivityActions"
        :intensity-label="intensityLabel"
      />

      <ConfirmDeleteDialog
        v-model="isDeleteOpen"
        :title="deleteMessage"
        message="Cette action supprimera définitivement l'entrée de votre journal."
        @confirm="confirmDelete"
      />

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        rounded="pill"
        elevation="24"
      >
        <div class="text-center w-100 font-weight-bold">
          {{ snackbar.message }}
        </div>
      </v-snackbar>

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
/* ... Ta logique existante reste la même ... */
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
const horsesStore = useHorsesStore();
    
const activities = ref<Event[]>([]);
const isLoading = ref(true);
const isDeleteOpen = ref(false);
const selectedActivity = ref<Event | null>(null);
const snackbar = ref({
    show: false,
    message: "",
    color: "#2E4B36", // Vert Equilife pour le succès
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
        case "legere": return "Légère";
        case "soutenue": return "Soutenu";
        default: return "Normal";
    }
};

const openDelete = (activity: Event) => {
    selectedActivity.value = activity;
    isDeleteOpen.value = true;
};

const getActivityActions = (activity: Event): ActivityAction[] => [
    {
        key: "view",
        title: "Détails",
        icon: "mdi-eye-outline",
        disabled: false,
        to:{ name: "ActivityDetails", params: { id: activity.id } },
    },
    {
        key: "edit",
        title: "Modifier",
        icon: "mdi-pencil-outline",
        disabled: false,
        to: { name: "ActivityEdit", params: { id: activity.id } },
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can-outline",
        color: "#B00020",
        disabled: false,
        onClick: () => openDelete(activity),
    },
];

const deleteMessage = computed(() =>
    selectedActivity.value
        ? `Supprimer ${selectedActivity.value.activity_type || "l'activité"} ?`
        : "Supprimer l'activité ?"
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
            message: "Entrée supprimée",
            color: "#2E4B36",
        };
    } catch (error) {
        snackbar.value = {
            show: true,
            message: "Erreur lors de la suppression",
            color: "#B00020",
        };
    }
};

const loadActivities = async () => {
    isLoading.value = true;
    try {
        const horseFilter = horsesStore.horseId !== "all" ? horsesStore.horseId : undefined;
        activities.value = await eventsApi.getAll(horseFilter as string);
    } catch (error) {
        console.error("Error loading activities:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await horsesStore.loadHorses();
    await loadActivities();
});

watch(() => horsesStore.horseId, () => loadActivities());
</script>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top, 20px) !important;
}

.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
</style>