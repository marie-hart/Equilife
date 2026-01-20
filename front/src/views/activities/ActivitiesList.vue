<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Activités</v-card-title>
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
          <div class="d-flex flex-column ga-4">
            <v-card class="section-card" variant="outlined">
              <v-card-title class="text-subtitle-1">Filtres</v-card-title>
              <v-card-text class="pt-3">
                <v-row dense>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="selectedHorseId"
                      :items="horseFilterOptions"
                      label="Cheval"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="selectedType"
                      :items="activityTypeOptions"
                      label="Type"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <DatePickerField v-model="selectedDate" label="Date" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Journal</div>
              <div class="pt-2">
                <div v-if="groupedActivities.length">
                  <div
                    v-for="group in groupedActivities"
                    :key="group.key"
                    class="mb-4"
                  >
                <div class="d-flex flex-column ga-4">
                      <div
                        v-for="activity in group.items"
                        :key="activity.id"
                      >
                        <v-card
                          variant="outlined"
                          class="overflow-hidden d-flex flex-column w-100"
                          :style="{ maxWidth: cardMaxWidth }"
                          height="190"
                      >
                          <v-card-title
                            class="bg-primary text-white text-subtitle-1 d-flex align-center justify-space-between"
                          >
                            <span>{{ activity.activity_type || activity.name }}</span>
                            <ActionButtons
                              class="d-md-none"
                              mode="auto"
                              button-size="x-small"
                              menu-button-size="x-small"
                              :actions="getActivityActions(activity)"
                            />
                          </v-card-title>
                          <v-card-text class="flex-grow-1 pt-3">
                        <div class="text-body-2 text-grey-darken-1">
                              <span class="d-none d-md-inline">{{
                                formatDateLong(activity.event_date)
                              }}</span>
                              <span class="d-inline d-md-none">{{
                                formatDateMobile(activity.event_date)
                              }}</span>
                          <span v-if="activity.activity_duration_minutes">
                            • {{ activity.activity_duration_minutes }} min
                          </span>
                          <span v-if="activity.activity_intensity">
                                •
                                {{
                                  intensityLabel(activity.activity_intensity)
                                }}
                          </span>
                        </div>
                        <div
                              v-if="
                                activity.activity_comment ||
                                activity.description
                              "
                              class="text-caption text-grey-darken-1 mt-2"
                        >
                              {{
                                activity.activity_comment ||
                                activity.description
                              }}
                            </div>
                          </v-card-text>
                          <v-card-actions class="mt-auto justify-end">
                            <ActionButtons
                              class="d-none d-md-flex align-center ga-2"
                              mode="inline"
                              button-size="x-small"
                              :actions="getActivityActions(activity)"
                            />
                          </v-card-actions>
                        </v-card>
                      </div>
                        </div>
                  </div>
                </div>
                <p v-else class="empty-state">Aucune activité enregistrée.</p>
              </div>
            </div>
          </div>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer l'activité</v-card-title>
          <v-card-text
            >Confirmer la suppression de cette activité ?</v-card-text
          >
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isDeleteOpen = false">Annuler</v-btn>
            <v-btn color="error" variant="elevated" @click="confirmDelete"
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "../../api/events";
import { ActionButtons, DatePickerField } from "../../components";
import { horsesApi } from "../../api/horses";
import { getStoredHorseId } from "../../utils/horseProfile";
import type { Event, Horse } from "../../types";

type ActivityAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

type IntensityValue = "legere" | "normale" | "soutenue";

const route = useRoute();
const router = useRouter();
const { xs } = useDisplay();
const horseId = computed(() => route.params.id as string | undefined);
const horses = ref<Horse[]>([]);
const activities = ref<Event[]>([]);
const selectedType = ref<string>("all");
const selectedDate = ref<string>("");
const selectedHorseId = ref<string>("all");
const isDeleteOpen = ref(false);
const selectedActivity = ref<Event | null>(null);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const cardMaxWidth = computed(() => (xs.value ? "100%" : "300px"));

const activityTypes = [
  { title: "Travail monté", value: "travail monté" },
  { title: "Travail à pied", value: "travail à pied" },
  { title: "Balade", value: "balade" },
  { title: "Longe", value: "longe" },
  { title: "Repos", value: "repos" },
  { title: "Autre", value: "autre" },
];

const intensityLabel = (value?: IntensityValue): string => {
  switch (value) {
    case "legere":
      return "Légère";
    case "soutenue":
      return "Soutenu";
    default:
      return "Normal";
  }
};

const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateMobile = (dateString: string): string => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const monthShort = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
  return date.getFullYear() !== currentYear
    ? `${date.getDate()} ${monthShort} ${date.getFullYear()}`
    : `${date.getDate()} ${monthShort}`;
};

const toMonthKey = (dateString: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const formatMonthLabel = (key: string): string => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const groupedActivities = computed(() => {
  const grouped = new Map<string, Event[]>();
  filteredActivities.value.forEach((activity) => {
    const key = toMonthKey(activity.event_date);
    const list = grouped.get(key) ?? [];
    list.push(activity);
    grouped.set(key, list);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({
      key,
      label: formatMonthLabel(key),
      items: items.sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      ),
    }));
});

const activityTypeOptions = computed(() => {
  const types = activityTypes.map((type) => type.value);
  return [
    { title: "Tous", value: "all" },
    ...types.map((type) => ({ title: type, value: type })),
  ];
});

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
);

const horseFilterOptions = computed(() => [
  { title: "Tous les chevaux", value: "all" },
  ...horseOptions.value,
]);

const isSameDayFilter = (dateString: string): boolean => {
  if (!selectedDate.value) return true;
  const date = new Date(dateString).toDateString();
  const target = new Date(`${selectedDate.value}T00:00:00`).toDateString();
  return date === target;
};

const filteredActivities = computed(() => {
  const byType =
    selectedType.value === "all"
      ? activities.value
      : activities.value.filter(
          (activity) =>
            (activity.activity_type || activity.name) === selectedType.value
        );
  return byType.filter((activity) => isSameDayFilter(activity.event_date));
});

const loadActivities = async () => {
  try {
    const horseFilter =
      selectedHorseId.value !== "all" ? selectedHorseId.value : undefined;
    const events = await eventsApi.getAll(horseFilter);
    activities.value = events.filter(
      (event) => !event.is_care && event.reminder_type !== "soin"
    );
  } catch (error) {
    console.error("Error loading activities:", error);
  }
};

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll();
  } catch (error) {
    console.error("Error loading horses:", error);
  }
};

const setHorseFromRoute = () => {
  if (horseId.value) {
    selectedHorseId.value = horseId.value;
    return;
  }
  const storedHorseId = getStoredHorseId();
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId;
}
};

const goToActivityCreate = () => {
  const id = horseId.value;
  if (id) {
    router.push({ name: "HorseActivityCreate", params: { id } });
    return;
  }
  router.push("/horses");
};

const openEventDetails = (event: Event) => {
  router.push({ name: "EventDetails", params: { id: event.id } });
};

const openEventEdit = (event: Event) => {
  router.push({ name: "ActivityEdit", params: { id: event.id } });
};

const openEventDelete = (event: Event) => {
  selectedActivity.value = event;
  isDeleteOpen.value = true;
};

const getActivityActions = (activity: Event): ActivityAction[] => [
  {
    key: "view",
    title: "Voir",
    icon: "mdi-eye",
    disabled: false,
    onClick: () => openEventDetails(activity),
  },
  {
    key: "edit",
    title: "Éditer",
    icon: "mdi-pencil",
    disabled: false,
    onClick: () => openEventEdit(activity),
  },
  {
    key: "delete",
    title: "Supprimer",
    icon: "mdi-trash-can",
    color: "error",
    disabled: false,
    onClick: () => openEventDelete(activity),
  },
];

const confirmDelete = async () => {
  if (!selectedActivity.value) return;
  try {
    await eventsApi.delete(selectedActivity.value.id);
    await loadActivities();
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

watch(selectedHorseId, () => {
  loadActivities();
});

onMounted(async () => {
  await loadHorses();
  setHorseFromRoute();
  await loadActivities();
});
</script>

