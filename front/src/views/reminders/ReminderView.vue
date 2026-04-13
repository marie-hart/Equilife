<template>
  <v-sheet
    color="#EDE4D8"
    @touchstart.passive="onPullStart"
    @touchend.passive="onPullEnd"
    @touchcancel.passive="resetPullState"
  >
    <v-container class="px-4">
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Rappels
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn
          variant="flat"
          color="#2E4B36"
          rounded="xl"
          class="text-none font-weight-bold"
          elevation="4"
          @click="goToReminderCreate"
        >
          <v-icon icon="mdi-plus" class="me-1" />
          Nouveau
        </v-btn>
      </div>

      <v-progress-linear
        v-if="isPullRefreshing"
        indeterminate
        color="#7B5B3E"
        rounded
        class="mb-3"
      />

      <FiltersPanel
        :filters="filterDefinitions"
        v-model="filterValues"
        class="mb-6"
      />

      <div class="mb-4 d-flex align-center">
        <v-icon icon="mdi-sort-clock-ascending" size="18" color="#7B5B3E" class="me-2" />
        <span class="text-overline font-weight-bold" style="color: #7B5B3E">Chronologie des soins</span>
      </div>

      <v-skeleton-loader
        v-if="isLoading"
        type="card, card, card"
        bg-color="transparent"
      />
      
        <ReminderList
            v-else
            :items="filteredReminders"
            :get-status-color="getStatusColor"
            :get-reminder-title="getReminderTitle"
            :get-horse-name="horsesStore.getHorseNameById"
            :reminder-type-label="reminderTypeLabel"
            :get-reminder-actions="getReminderActions"
            :format-date-long="formatDateLong"     
            :get-reminder-date="getReminderDate"   
            :get-type-color="getTypeColor"         
            @action="handleReminderAction" 
        />

        <ReminderEdit
            v-model="isEditOpen"
            v-model:form="editForm"
            :horses="horsesStore.horses"
            :errors="editErrors"
            @save="saveEdit"
        />

      <ConfirmDeleteDialog
          v-model="isDeleteOpen"
          title="Supprimer le rappel"
          message="Confirmer la suppression de ce rappel ?"
          @confirm="confirmDelete"
      />

      <v-dialog v-model="isCareDoneOpen" max-width="420">
          <v-card rounded="xl" class="pa-4 shadow-subtle">
              <v-card-title class="text-h6 font-weight-bold" style="color: #2E4B36">
                  Rendez-vous effectué
              </v-card-title>
              <v-card-text>
                  <p class="text-body-2 mb-4" style="color: #7a6e61">
                    Indiquez la date à laquelle le soin a été fait pour reprogrammer le prochain rappel.
                  </p>
                  <DatePickerField
                      v-model="careDoneForm.date"
                      label="Date du rendez-vous"
                      density="comfortable"
                      variant="outlined"
                      color="#2E4B36"
                      rounded="lg"
                      :error-messages="careDoneErrors.date ? [careDoneErrors.date] : undefined"
                  />
              </v-card-text>
              <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn variant="text" color="#554338" @click="isCareDoneOpen = false">Annuler</v-btn>
                  <v-btn variant="flat" color="#2E4B36" rounded="xl" @click="saveCareDone">Valider</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" rounded="lg">
          {{ snackbar.message }}
      </v-snackbar>

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logger } from "@/services/LoggerService";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useEventsStore } from "@/stores/EventsStore";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { toDateInputValue, getReminderDate, fromDateInputValue, formatDateLong } from "@/libs/date";
import { ConfirmDeleteDialog, DatePickerField, FiltersPanel } from "@/components";
import type { Event, SelectOption, ReminderType, ReminderFormValue } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import { getStatusKey, getStatusColor } from "@/libs/index";
import { useFilters } from "@/composables/useFilters";
import { ReminderEdit, ReminderList } from '@/views/reminders';

type RecurrenceUnit = "days" | "months" | "years";

const reminders = ref<Event[]>([]);
const isLoading = ref(true);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isCareDoneOpen = ref(false);
const selectedReminder = ref<Event | null>(null);
const pullStartY = ref<number | null>(null);
const pullCanRefresh = ref(false);
const isPullRefreshing = ref(false);

const editForm = ref<ReminderFormValue>({
    id: "",
    horseIds: [],
    description: "",
    date: "",
    reminderType: "autres",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months",
});

const editErrors = ref<Record<string, string>>({});
const careDoneForm = ref({ date: "" });
const careDoneErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });

const router = useRouter();
const route = useRoute();
const horsesStore = useHorsesStore(); 
const eventsStore = useEventsStore();

const statusOptions = [
    { title: "Tous", value: "all" },
    { title: "En retard", value: "overdue" },
    { title: "Aujourd'hui", value: "today" },
    { title: "À venir", value: "upcoming" },
];

const reminderTypeOptions: SelectOption<ReminderType>[] = [
    { title: "Tous", value: "all" },
    { title: "Soin", value: "soin" },
    { title: "Activité", value: "activité" },
    { title: "Alimentation", value: "alimentation" },
    { title: "Autres", value: "autres" },
];

const recurrenceUnits: { title: string; value: RecurrenceUnit }[] = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];

const filters: readonly FilterDefinition<string>[] = [
    { key: "horseId", type: "select", label: "Cheval", defaultValue: "all", options: [] },
    { key: "status", type: "select", label: "Statut", defaultValue: "all", options: statusOptions },
    { key: "type", type: "select", label: "Type", defaultValue: "all", options: reminderTypeOptions },
];

const { filterValues } = useFilters(filters);

// Logic
const getReminderType = (reminder: Event): ReminderType => reminder.reminder_type ?? "autres";

const applyReminderFilters = (items: Event[], overrides: any = {}) => {
    const horseId = overrides.horseId ?? filterValues.horseId;
    const status = overrides.status ?? filterValues.status;
    const type = overrides.type ?? filterValues.type;
    let result = items;
    if (horseId !== "all") result = result.filter((r) => r.horse_id === horseId);
    if (status !== "all") result = result.filter((r) => getStatusKey(r) === status);
    if (type !== "all") result = result.filter((r) => getReminderType(r) === type);
    return result;
};

const filterDefinitions = computed(() => [
    ...(horsesStore.horses.length > 1
        ? [{ ...filters[0], options: horsesStore.horseFilterOptions }]
        : []),
    { ...filters[1], options: statusOptions }, 
    { ...filters[2], options: reminderTypeOptions },
]);

const getTypeColor = (type?: ReminderType): string => {
    switch (type) {
        case "soin":
            return "#D32F2F"; 
        case "activité":
            return "#1976D2";
        case "alimentation":
            return "#388E3C"; 
        case "autres":
        default:
            return "#7B5B3E"; 
    }
};

const filteredReminders = computed(() => {
    if (!reminders.value || reminders.value.length === 0) return [];
    const result = applyReminderFilters(reminders.value);
    
    return result.sort((a, b) => {
        const dateA = new Date(getReminderDate(a)).getTime();
        const dateB = new Date(getReminderDate(b)).getTime();
        const statusA = getStatusKey(a); 
        const statusB = getStatusKey(b);

        const priorityScore = {
            "overdue": 1,
            "today": 2,
            "upcoming": 3
        };

        const scoreA = priorityScore[statusA as keyof typeof priorityScore] || 4;
        const scoreB = priorityScore[statusB as keyof typeof priorityScore] || 4;

        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        }

        return dateA - dateB;
    });
});

const getReminderTitle = (reminder: Event) => 
  (reminder.reminder_type === "alimentation" && reminder.name) ? reminder.name : (reminder.description || reminder.name);

const reminderTypeLabel = (type?: Event["reminder_type"]) => {
    const labels = { soin: "Soin", activité: "Activité", alimentation: "Alimentation", autres: "Autres" };
    return labels[type as keyof typeof labels] || "Autres";
};

const handleReminderAction = ({ key, reminder }: { key: string, reminder: Event }) => {
    switch (key) {
        case 'done': markDone(reminder); break;
        case 'edit': editReminder(reminder); break;
        case 'delete': openDelete(reminder); break;
    }
};

const getReminderActions = () => [
    { key: "done", title: "Valider", icon: "mdi-check", disabled: false },
    { key: "edit", title: "Éditer", icon: "mdi-pencil", disabled: false },
    { key: "delete", title: "Supprimer", icon: "mdi-trash-can", color: "error", disabled: false },
];

const isReminderRecurring = (reminder: Event): boolean =>
    reminder.reminder_enabled && Boolean(reminder.reminder_interval_days || reminder.reminder_interval_months || reminder.reminder_interval_years);

const markDone = async (reminder: Event) => {
    if (reminder.is_care) {
        selectedReminder.value = reminder;
        careDoneForm.value = {
            date: toDateInputValue(getReminderDate(reminder)),
        };
        isCareDoneOpen.value = true;
        return;
    }
    if (isReminderRecurring(reminder)) {
        selectedReminder.value = reminder;
        careDoneForm.value = { date: toDateInputValue(getReminderDate(reminder)) };
        isCareDoneOpen.value = true;
        return;
    }
    try {
        await eventsStore.updateEvent(reminder.id, { reminder_enabled: false });
        reminders.value = reminders.value.filter(item => item.id !== reminder.id);
        snackbar.value = { show: true, message: "Rappel marqué comme fait.", color: "success" };
    } catch (error) {
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
    }
};

const editReminder = (reminder: Event) => {
    selectedReminder.value = reminder;
    
    editForm.value = {
        id: reminder.id,
        horseIds: [reminder.horse_id || ""],
        description: reminder.description || reminder.name || "",
        date: toDateInputValue(reminder.event_date),
        reminderType: reminder.reminder_type || "autres",
        isRecurring: isReminderRecurring(reminder),
        recurrenceInterval: reminder.reminder_interval_years || reminder.reminder_interval_months || reminder.reminder_interval_days || 1,
        recurrenceUnit: reminder.reminder_interval_years ? "years" : reminder.reminder_interval_months ? "months" : "days",
    };

    editErrors.value = {};
    isEditOpen.value = true;
};

const saveEdit = async () => {
    if (!selectedReminder.value) return;
    try {
        const { errors, firstError } = await validateRequiredFieldsMap([
            { key: "description", label: "description", value: editForm.value.description },
            { key: "date", label: "date", value: editForm.value.date },
        ]);
        if (firstError) { editErrors.value = errors; return; }

        const date = new Date(editForm.value.date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        const payload = {
            name: editForm.value.description,
            description: editForm.value.description,
            event_date: formattedDate,
            reminder_interval_days: editForm.value.isRecurring && editForm.value.recurrenceUnit === "days" ? editForm.value.recurrenceInterval : 0,
            reminder_interval_months: editForm.value.isRecurring && editForm.value.recurrenceUnit === "months" ? editForm.value.recurrenceInterval : 0,
            reminder_interval_years: editForm.value.isRecurring && editForm.value.recurrenceUnit === "years" ? editForm.value.recurrenceInterval : 0,
        };

        await eventsStore.updateEvent(selectedReminder.value.id, payload);
        await loadReminders(true);
        isEditOpen.value = false;
        snackbar.value = { show: true, message: "Rappel mis à jour.", color: "success" };
    } catch (error) {
        snackbar.value = { show: true, message: "Mise à jour impossible.", color: "error" };
    }
};

const openDelete = (reminder: Event) => {
    selectedReminder.value = reminder;
    isDeleteOpen.value = true;
};

const confirmDelete = async () => {
    if (!selectedReminder.value) return;
    try {
        await eventsStore.deleteEvent(selectedReminder.value.id);
        reminders.value = reminders.value.filter(item => item.id !== selectedReminder.value?.id);
        isDeleteOpen.value = false;
        snackbar.value = { show: true, message: "Rappel supprimé.", color: "success" };
    } catch (error) {
        snackbar.value = { show: true, message: "Suppression impossible.", color: "error" };
    }
};

const saveCareDone = async () => {
    if (!selectedReminder.value) return;
    try {
        const appointmentDate = fromDateInputValue(careDoneForm.value.date);
        const reminder = selectedReminder.value;
        const type = reminder.reminder_type ?? "autres";

        if (reminder.is_care) {
            await eventsStore.markCareDone(reminder.id, appointmentDate);
        } else {
            await eventsStore.createEvent({
                ...reminder,
                event_date: appointmentDate,
                reminder_enabled: false,
                is_care: type === "soin",
            });

            await eventsStore.updateEvent(reminder.id, {
                event_date: appointmentDate,
                reminder_enabled: true,
            });
        }
        
        await loadReminders(true);
        isCareDoneOpen.value = false;
        snackbar.value = { show: true, message: "Soin enregistré et reprogrammé.", color: "success" };
    } catch (error) {
        snackbar.value = { show: true, message: "Erreur lors de la validation.", color: "error" };
    }
};

function isMainScrollerAtTop(): boolean {
    const scroller = document.querySelector(".v-main__scroller") as HTMLElement | null;
    if (scroller) return scroller.scrollTop <= 0;
    return window.scrollY <= 0;
}

function onPullStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    pullCanRefresh.value = isMainScrollerAtTop();
    pullStartY.value = event.touches[0].clientY;
}

function resetPullState() {
    pullCanRefresh.value = false;
    pullStartY.value = null;
}

async function onPullEnd(event: TouchEvent) {
    if (!pullCanRefresh.value || pullStartY.value === null || isPullRefreshing.value) {
        resetPullState();
        return;
    }

    const endY = event.changedTouches[0]?.clientY ?? pullStartY.value;
    const deltaY = endY - pullStartY.value;
    resetPullState();
    if (deltaY < 80) return;

    isPullRefreshing.value = true;
    try {
        await loadReminders(true);
    } finally {
        isPullRefreshing.value = false;
    }
}

const loadReminders = async (forceRefresh = false) => {
    isLoading.value = true;
    try {
        // Force le chargement des chevaux si nécessaire avant les rappels
        if (horsesStore.horses.length === 0) await horsesStore.loadHorses();
        
        const data = await eventsStore.fetchReminders(undefined, forceRefresh);
        reminders.value = Array.isArray(data) ? data : [];
    } catch (error) {
        logger.error("Erreur chargement rappels:", error);
        reminders.value = []; // Garantit un tableau vide au lieu de null
    } finally {
        isLoading.value = false;
    }
};

const goToReminderCreate = () => {
    const id = horsesStore.horseId !== "all" ? horsesStore.horseId : undefined;
    router.push({ name: "ReminderCreate", params: id ? { id } : {} });
};

watch(() => horsesStore.horseId, (newId) => { if (newId) filterValues.horseId = newId; }, { immediate: true });

watch(
  () => [route.query.reminderId, reminders.value] as const,
  async ([reminderId, list]) => {
    if (!reminderId || !Array.isArray(list) || list.length === 0) return;
    const id = String(reminderId);
    const reminder = list.find((r) => r.id === id);
    if (reminder) {
      if (reminder.horse_id) horsesStore.sethorseId(reminder.horse_id);
      editReminder(reminder);
      await router.replace({ name: "Reminders", query: {} });
    }
  },
  { flush: "post" }
);

onMounted(loadReminders);
</script>