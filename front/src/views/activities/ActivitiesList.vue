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

            <FiltersPanel
              :filters="filterDefinitions"
              v-model="filterValues"
            />

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
import { ActionButtons } from "../../components";
import type { Event, SelectOption, ActivityType } from "../../types";
import { toMonthKey, formatDateLong, formatDateMobile, isSameDayFilter, formatMonthLabel } from '../../libs/date';
import { useHorseSelection } from '../../composable/useHorseSelection'
import { useFilters } from '../../composable/useFilters';
import FiltersPanel from '@/components/FiltersPanel.vue'


type ActivityAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const {
  selectedHorseId,
} = useHorseSelection()

type IntensityValue = "legere" | "normale" | "soutenue";

const route = useRoute();
const router = useRouter();
const { xs } = useDisplay();
const horseId = computed(() => route.params.id as string | undefined);
const activities = ref<Event[]>([]);
const isDeleteOpen = ref(false);
const selectedActivity = ref<Event | null>(null);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const cardMaxWidth = computed(() => (xs.value ? "100%" : "300px"));


const activityTypes: SelectOption<ActivityType>[] = [
  { title: 'Travail monté', value: 'travail monté' },
  { title: 'Travail à pied', value: 'travail à pied' },
  { title: 'Balade', value: 'balade' },
  { title: 'Longe', value: 'longe' },
  { title: 'Repos', value: 'repos' },
  { title: 'Autre', value: 'autre' },
]


const filters = [
  {
    key: 'type',
    type: 'select',
    label: 'Type d’activité',
    defaultValue: 'all',
    options: activityTypes,
  },
  {
    key: 'date',
    type: 'date',
    label: 'Date',
    defaultValue: '',
  },
] as const

const {
  filterValues,
  filterDefinitions,
} = useFilters(filters)


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

watch(
  () => filterValues.type,
  (id) => {
    selectedHorseId.value = id
    loadActivities()
  }
)

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

const filteredActivities = computed(() => {
  let result = activities.value

  if (filterValues.type !== 'all') {
    result = result.filter(
      a => (a.activity_type || a.name) === filterValues.type
    )
  }

  if (filterValues.date) {
    result = result.filter(a =>
      isSameDayFilter(a.event_date, filterValues.date)
    )
  }

  return result
})

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
  await loadActivities();
});
</script>

