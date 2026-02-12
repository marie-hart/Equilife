<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Rappels
                </v-card-title>
            </div>
            
            <div class="d-flex flex-column ga-4">
                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn 
                        variant="outlined" 
                        @click="goToDashboard"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        class="text-none"
                        variant="flat"
                        rounded="lg"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                        @click="goToReminderCreate"
                    >
                        <v-icon icon="mdi-plus" class="me-2" />
                        Ajouter
                    </v-btn>
                </div>

                <FiltersPanel
                    :filters="filterDefinitions"
                    v-model="filterValues"
                    class="border-md rounded-lg"
                    :style="{ borderColor: '#efe5d9', backgroundColor: '#ffffff' }"
                />
                
                <v-card 
                    class="pa-2" 
                    variant="flat" 
                    rounded="lg"
                    :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
                >
                    <v-card-title class="text-subtitle-1 font-weight-bold" :style="{ color: '#3c3226' }">
                        Liste des rappels
                    </v-card-title>
                    <v-card-text class="pt-3">
                        <v-skeleton-loader
                            v-if="isLoading"
                            type="list-item-two-line, list-item-two-line, list-item-two-line"
                        />
                        <ReminderList
                            v-else
                            :items="filteredReminders"
                            :get-status-color="getStatusColor"
                            :get-reminder-title="getReminderTitle"
                            :get-horse-name="horsesStore.getHorseNameById"
                            :reminder-type-label="reminderTypeLabel"
                            :get-reminder-actions="getReminderActions"
                        />
                    </v-card-text>
                </v-card>
            </div>

            <ReminderEdit
                v-model="isEditOpen"
                :form="editForm"
                :errors="editErrors"
                :recurrence-units="recurrenceUnits"
                @save="saveEdit"
            />

            <ConfirmDeleteDialog
                v-model="isDeleteOpen"
                title="Supprimer le rappel"
                message="Confirmer la suppression de ce rappel ?"
                @confirm="confirmDelete"
            />

            <v-dialog v-model="isCareDoneOpen" max-width="420">
                <v-card rounded="lg" class="pa-2">
                    <v-card-title class="text-h6 font-weight-bold" :style="{ color: '#3c3226' }">
                        Rendez-vous effectué
                    </v-card-title>
                    <v-card-text>
                        <DatePickerField
                            v-model="careDoneForm.date"
                            label="Date du rendez-vous"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                            :error-messages="
                                careDoneErrors.date
                                    ? [careDoneErrors.date]
                                    : undefined
                            "
                        />
                    </v-card-text>
                    <v-card-actions class="pa-4">
                        <v-spacer></v-spacer>
                        <v-btn 
                            variant="outlined" 
                            rounded="lg"
                            class="text-none"
                            :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                            @click="isCareDoneOpen = false"
                        >
                            Annuler
                        </v-btn>
                        <v-btn
                            variant="flat"
                            rounded="lg"
                            class="text-none"
                            :style="{ backgroundColor: '#554338', color: 'white' }"
                            @click="saveCareDone"
                        >
                            Valider
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
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { useHorsesStore } from "@/stores/HorsesStore";
import { validateRequiredFieldsMap } from "@/utils/validation";
import {
    toDateInputValue,
    getReminderDate,
    fromDateInputValue,
} from "@/libs/date";
import { ConfirmDeleteDialog, DatePickerField, FiltersPanel } from "@/components";
import type { Event, SelectOption, ReminderType } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import { getStatusKey, getStatusColor } from "@/libs/index";
import { useFilters } from "@/composables/useFilters";
import { ReminderEdit, ReminderList } from "@/views/reminders";

type ReminderAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

const reminders = ref<Event[]>([]);
const isLoading = ref(true);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const selectedReminder = ref<Event | null>(null);
const editForm = ref({
    description: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
});
const editErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});
const isCareDoneOpen = ref(false);
const careDoneForm = ref({ date: "" });
const careDoneErrors = ref<Record<string, string>>({});

const router = useRouter();
const horsesStore = useHorsesStore(); // UPDATED

type RecurrenceUnit = "days" | "months" | "years";
type ReminderStatus = "overdue" | "today" | "upcoming";

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
    {
        key: "horseId",
        type: "select",
        label: "Cheval",
        defaultValue: "all",
        options: [], // Will be updated in computed
    },
    {
        key: "status",
        type: "select",
        label: "Statut",
        defaultValue: "all",
        options: statusOptions,
    },
    {
        key: "type",
        type: "select",
        label: "Type",
        defaultValue: "all",
        options: reminderTypeOptions,
    },
];

const { filterValues } = useFilters(filters);
const getReminderType = (reminder: Event): ReminderType =>
    reminder.reminder_type ?? "autres";

const applyReminderFilters = (
    items: Event[],
    overrides: Partial<{ horseId: string; status: string; type: string }> = {},
) => {
    const horseId = overrides.horseId ?? filterValues.horseId;
    const status = overrides.status ?? filterValues.status;
    const type = overrides.type ?? filterValues.type;
    let result = items;
    if (horseId !== "all") {
        result = result.filter((r) => r.horse_id === horseId);
    }
    if (status !== "all") {
        result = result.filter((r) => getStatusKey(r) === status);
    }
    if (type !== "all") {
        result = result.filter((r) => getReminderType(r) === type);
    }
    return result;
};

const availableHorseOptions = computed(() => {
    return horsesStore.horseFilterOptions;
});

const availableStatusOptions = computed(() => {
    const filtered = applyReminderFilters(reminders.value, { status: "all" });
    const statuses = new Set(filtered.map((r) => getStatusKey(r)));
    let options = statusOptions.filter(
        (option) =>
            option.value === "all" ||
            statuses.has(option.value as ReminderStatus),
    );
    const selected = filterValues.status;
    if (
        selected !== "all" &&
        !options.some((option) => option.value === selected)
    ) {
        const match = statusOptions.find((option) => option.value === selected);
        if (match) options = [...options, match];
    }
    return options.length ? options : statusOptions;
});

const availableTypeOptions = computed(() => {
    const filtered = applyReminderFilters(reminders.value, { type: "all" });
    const types = new Set(filtered.map(getReminderType));
    let options = reminderTypeOptions.filter(
        (option) => option.value === "all" || types.has(option.value),
    );
    const selected = filterValues.type;
    if (
        selected !== "all" &&
        !options.some((option) => option.value === selected)
    ) {
        const match = reminderTypeOptions.find(
            (option) => option.value === selected,
        );
        if (match) options = [...options, match];
    }
    return options.length ? options : reminderTypeOptions;
});

const filterDefinitions = computed(() => [
    { ...filters[0], options: availableHorseOptions.value },
    { ...filters[1], options: availableStatusOptions.value },
    { ...filters[2], options: availableTypeOptions.value },
]);

const filteredReminders = computed(() => {
    const result = applyReminderFilters(reminders.value);
    return result.sort(
        (a, b) =>
            new Date(getReminderDate(a)).getTime() -
            new Date(getReminderDate(b)).getTime(),
    );
});

const getReminderTitle = (reminder: Event): string => {
    if (reminder.reminder_type === "alimentation" && reminder.name) {
        return reminder.name;
    }
    return reminder.description || reminder.name;
};

const reminderTypeLabel = (type?: Event["reminder_type"]): string => {
    switch (type) {
        case "soin":
            return "Soin";
        case "activité":
            return "Activité";
        case "alimentation":
            return "Alimentation";
        case "autres":
        default:
            return "Autres";
    }
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

const goToReminderCreate = () => {
    const id = horsesStore.horseId !== "all" ? horsesStore.horseId : undefined;
    if (id) {
        router.push({ name: "ReminderCreate", params: { id } });
    } else {
        router.push({ name: "ReminderCreate" });
    }
};

const isReminderRecurring = (reminder: Event): boolean =>
    reminder.reminder_enabled &&
    Boolean(
        reminder.reminder_interval_days ||
            reminder.reminder_interval_months ||
            reminder.reminder_interval_years,
    );

const markDone = async (reminder: Event) => {
    if (isReminderRecurring(reminder)) {
        selectedReminder.value = reminder;
        careDoneForm.value = {
            date: toDateInputValue(getReminderDate(reminder)),
        };
        isCareDoneOpen.value = true;
        return;
    }
    try {
        await eventsApi.update(reminder.id, { reminder_enabled: false });
        reminders.value = reminders.value.filter(
            (item) => item.id !== reminder.id,
        );
        snackbar.value = {
            show: true,
            message: "Rappel marqué comme fait.",
            color: "success",
        };
    } catch (error) {
        console.error("Error marking reminder as done:", error);
        snackbar.value = {
            show: true,
            message: "Action impossible.",
            color: "error",
        };
    }
};

const editReminder = (reminder: Event) => {
    selectedReminder.value = reminder;
    const hasMonthlyRecurrence = Boolean(reminder.reminder_interval_months);
    const hasYearlyRecurrence = Boolean(reminder.reminder_interval_years);
    const hasDailyRecurrence = Boolean(reminder.reminder_interval_days);
    const recurrenceUnit: RecurrenceUnit = hasYearlyRecurrence
        ? "years"
        : hasMonthlyRecurrence
          ? "months"
          : "days";
    const recurrenceInterval = hasYearlyRecurrence
        ? reminder.reminder_interval_years || 1
        : hasMonthlyRecurrence
          ? reminder.reminder_interval_months || 1
          : reminder.reminder_interval_days || 1;
    editForm.value = {
        description: reminder.description || reminder.name,
        date: toDateInputValue(reminder.event_date),
        isRecurring:
            hasMonthlyRecurrence || hasYearlyRecurrence || hasDailyRecurrence,
        recurrenceInterval,
        recurrenceUnit,
    };
    isEditOpen.value = true;
};

const getReminderActions = (reminder: Event): ReminderAction[] => [
    {
        key: "done",
        title: "Valider",
        icon: "mdi-check",
        disabled: false,
        onClick: () => markDone(reminder),
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => editReminder(reminder),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDelete(reminder),
    },
];

const saveCareDone = async () => {
    if (!selectedReminder.value) return;
    if (!careDoneForm.value.date) {
        snackbar.value = {
            show: true,
            message: "Merci de renseigner la date du rendez-vous.",
            color: "error",
        };
        return;
    }
    try {
        const appointmentDate = fromDateInputValue(careDoneForm.value.date);
        const reminderType =
            selectedReminder.value.reminder_type ?? "autres";
        await eventsApi.create({
            name: selectedReminder.value.name,
            description: selectedReminder.value.description,
            event_date: appointmentDate,
            horse_id: selectedReminder.value.horse_id,
            is_care: reminderType === "soin",
            reminder_type: reminderType,
            reminder_enabled: false,
            activity_type: selectedReminder.value.activity_type,
            activity_duration_minutes:
                selectedReminder.value.activity_duration_minutes,
            activity_intensity: selectedReminder.value.activity_intensity,
            activity_comment: selectedReminder.value.activity_comment,
        });
        await eventsApi.update(selectedReminder.value.id, {
            event_date: appointmentDate,
            reminder_type: reminderType,
            reminder_enabled: true,
            reminder_interval_days:
                selectedReminder.value.reminder_interval_days,
            reminder_interval_months:
                selectedReminder.value.reminder_interval_months,
            reminder_interval_years:
                selectedReminder.value.reminder_interval_years,
        });
        await loadReminders();
        isCareDoneOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Soin enregistré et rappel reprogrammé.",
            color: "success",
        };
    } catch (error) {
        console.error("Error saving care appointment:", error);
        snackbar.value = {
            show: true,
            message: "Action impossible.",
            color: "error",
        };
    }
};

const saveEdit = async () => {
    if (!selectedReminder.value) return;
    try {
        const { errors, firstError } = await validateRequiredFieldsMap([
            {
                key: "description",
                label: "une description",
                value: editForm.value.description,
            },
            { key: "date", label: "une date", value: editForm.value.date },
        ]);
        editErrors.value = errors;
        if (firstError) {
            snackbar.value = {
                show: true,
                message: firstError,
                color: "error",
            };
            return;
        }
        if (
            editForm.value.isRecurring &&
            (!editForm.value.recurrenceInterval ||
                editForm.value.recurrenceInterval < 1)
        ) {
            snackbar.value = {
                show: true,
                message: "Merci de renseigner une récurrence valide.",
                color: "error",
            };
            return;
        }
        const intervalDays =
            editForm.value.isRecurring &&
            editForm.value.recurrenceUnit === "days"
                ? editForm.value.recurrenceInterval
                : 0;
        const intervalMonths =
            editForm.value.isRecurring &&
            editForm.value.recurrenceUnit === "months"
                ? editForm.value.recurrenceInterval
                : 0;
        const intervalYears =
            editForm.value.isRecurring &&
            editForm.value.recurrenceUnit === "years"
                ? editForm.value.recurrenceInterval
                : 0;
        await eventsApi.update(selectedReminder.value.id, {
            name: editForm.value.description,
            description: editForm.value.description,
            event_date: fromDateInputValue(editForm.value.date),
            reminder_interval_days: intervalDays,
            reminder_interval_months: intervalMonths,
            reminder_interval_years: intervalYears,
        });
        await loadReminders();
        isEditOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Rappel mis à jour.",
            color: "success",
        };
    } catch (error) {
        console.error("Error updating reminder:", error);
        snackbar.value = {
            show: true,
            message: "Mise à jour impossible.",
            color: "error",
        };
    }
};

const openDelete = (reminder: Event) => {
    selectedReminder.value = reminder;
    isDeleteOpen.value = true;
};

const confirmDelete = async () => {
    if (!selectedReminder.value) return;
    try {
        await eventsApi.delete(selectedReminder.value.id);
        reminders.value = reminders.value.filter(
            (item) => item.id !== selectedReminder.value?.id,
        );
        isDeleteOpen.value = false;
        careDoneErrors.value = {};
        snackbar.value = {
            show: true,
            message: "Rappel supprimé.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting reminder:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const loadReminders = async () => {
    isLoading.value = true;
    try {
        const [remindersResponse] = await Promise.all([
            eventsApi.getReminders(),
            horsesStore.loadHorses(), // UPDATED
        ]);
        reminders.value = remindersResponse;
    } catch (error) {
        console.error("Error loading reminders:", error);
    } finally {
        isLoading.value = false;
    }
};

// UPDATED: Watch store horseId to update filter
watch(() => horsesStore.horseId, (newHorseId) => {
    if (newHorseId) {
        filterValues.horseId = newHorseId;
    }
}, { immediate: true });

onMounted(() => {
    loadReminders();
});
</script>

<style scoped>
.page {
    background-color: #fcfaf8;
}
</style>