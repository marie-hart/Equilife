<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-4">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">Soins</v-card-title>
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
                        :to="{ name: 'HorseCareCreate', params: { id: horseId } }"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                    >
                        <v-icon start icon="mdi-plus" />
                        Ajouter
                    </v-btn>
                </div>

                <FiltersPanel
                    :filters="filterDefinitions"
                    v-model="filterValues"
                />
                <v-skeleton-loader
                    v-if="isLoading"
                    type="list-item-two-line, list-item-two-line, list-item-two-line"
                />
                <HealthList
                    v-else
                    :items="filteredCares"
                    :format-date="formatDateLong"
                    :format-date-mobile="formatDateMobile"
                    :get-horse-name="getHorseName"
                    :recurrence-label="recurrenceLabel"
                    :get-care-actions="getCareActions"
                />
            </div>
            </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { useFilters } from "@/composables/useFilters";
import { useHorseSelection } from "@/composables/useHorseSelection";
import type { Event } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import {
    formatDateLong,
    formatDateMobile,
    fromDateInputValue,
    isSameDay,
    startOfDay,
    toDateInputValue,
} from "@/libs/date";
import { ConfirmDeleteDialog, DatePickerField, FiltersPanel } from "@/components";
import { HealthList } from "@/views/health";

type CareAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

const cares = ref<Event[]>([]);
const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const {
    horses,
    horseFilterOptions,
    selectedHorseId: horseSelectionId,
} = useHorseSelection();
const statusOptions = [
    { title: "Tous", value: "all" },
    { title: "Passé", value: "past" },
    { title: "Aujourd'hui", value: "today" },
    { title: "À venir", value: "upcoming" },
];

const careTypeOptions = computed(() => {
    const uniqueTypes = Array.from(
        new Set(
            cares.value
                .map((care) => care.name?.trim())
                .filter((name): name is string => Boolean(name)),
        ),
    ).sort((a, b) => a.localeCompare(b, "fr"));
    return [
        { title: "Tous", value: "all" },
        ...uniqueTypes.map((name) => ({ title: name, value: name })),
    ];
});

const horseById = computed(
    () => new Map(horses.value.map((horse) => [horse.id, horse])),
);

const filters: readonly FilterDefinition<string>[] = [
    {
        key: "horseId",
        type: "select",
        label: "Cheval",
        defaultValue: "all",
        options: horseFilterOptions.value,
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
        label: "Type de soin",
        defaultValue: "all",
        options: careTypeOptions.value,
    },
];

const { filterValues } = useFilters(filters);
const getCareType = (care: Event): string => (care.name || "").trim();
type CareStatus = "past" | "today" | "upcoming";
const applyCareFilters = (
    items: Event[],
    overrides: Partial<{
        horseId: string;
        status: "all" | CareStatus;
        type: string;
    }> = {},
) => {
    const horseId = overrides.horseId ?? filterValues.horseId;
    const status = (overrides.status ??
        filterValues.status) as "all" | CareStatus;
    const type = overrides.type ?? filterValues.type;
    let result = items;
    if (horseId !== "all") {
        result = result.filter((care) => care.horse_id === horseId);
    }
    if (status !== "all") {
        result = result.filter((care) => getStatusKey(care) === status);
    }
    if (type !== "all") {
        result = result.filter((care) => getCareType(care) === type);
    }
    return result;
};
const availableHorseOptions = computed(() => {
    const filtered = applyCareFilters(cares.value, { horseId: "all" });
    const ids = new Set(
        filtered
            .map((care) => care.horse_id)
            .filter((id): id is string => Boolean(id)),
    );
    const base = horseFilterOptions.value;
    let options = base.filter(
        (option) => option.value === "all" || ids.has(option.value),
    );
    const selected = filterValues.horseId;
    if (
        selected !== "all" &&
        !options.some((option) => option.value === selected)
    ) {
        const match = base.find((option) => option.value === selected);
        if (match) options = [...options, match];
    }
    return options.length ? options : base;
});
const availableStatusOptions = computed(() => {
    const filtered = applyCareFilters(cares.value, { status: "all" });
    const statuses = new Set(filtered.map((care) => getStatusKey(care)));
    let options = statusOptions.filter(
        (option) =>
            option.value === "all" ||
            statuses.has(option.value as CareStatus),
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
    const filtered = applyCareFilters(cares.value, { type: "all" });
    const uniqueTypes = Array.from(
        new Set(filtered.map(getCareType).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "fr"));
    const dynamic = [
        { title: "Tous", value: "all" },
        ...uniqueTypes.map((name) => ({ title: name, value: name })),
    ];
    const selected = filterValues.type;
    if (selected !== "all" && !dynamic.some((option) => option.value === selected)) {
        dynamic.push({ title: selected, value: selected });
    }
    return dynamic.length ? dynamic : careTypeOptions.value;
});
const filterDefinitions = computed(() => [
    { ...filters[0], options: availableHorseOptions.value },
    { ...filters[1], options: availableStatusOptions.value },
    { ...filters[2], options: availableTypeOptions.value },
]);

const recurrenceLabel = (care: Event): string => {
    const days = care.reminder_interval_days;
    const months = care.reminder_interval_months;
    const years = care.reminder_interval_years;
    if (!care.reminder_enabled || (!days && !months && !years)) return "-";
    if (days) return `Tous les ${days} jour${days > 1 ? "s" : ""}`;
    if (months) return `Tous les ${months} mois`;
    if (years) return `Tous les ${years} an${years > 1 ? "s" : ""}`;
    return "-";
};

const getHorseName = (care: Event): string => {
    if (!care.horse_id) {
        return "Cheval inconnu";
    }
    return horseById.value.get(care.horse_id)?.name ?? "Cheval inconnu";
};

const getStatusKey = (care: Event): "past" | "today" | "upcoming" => {
    const today = startOfDay(new Date());
    if (isSameDay(care.event_date, today)) {
        return "today";
    }
    return new Date(care.event_date) < today ? "past" : "upcoming";
};

const filteredCares = computed(() => {
    const result = applyCareFilters(cares.value);
    return [...result].sort(
        (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    );
});

const isDeleteOpen = ref(false);
const selectedCare = ref<Event | null>(null);
const isCareDoneOpen = ref(false);
const careDoneForm = ref({ date: "" });
const careDoneErrors = ref<Record<string, string>>({});

const horseId = computed(() => route.params.id as string | undefined);

const loadCares = async () => {
    isLoading.value = true;
    try {
        const events = await eventsApi.getAll();
        cares.value = events.filter((event) => event.is_care);
    } catch (error) {
        console.error("Error loading cares:", error);
    } finally {
        isLoading.value = false;
    }
};

const openEdit = (care: Event) => {
    router.push({ name: "HealthEdit", params: { id: care.id } });
};

const isCareRecurring = (care: Event): boolean =>
    care.reminder_enabled &&
    Boolean(
        care.reminder_interval_days ||
            care.reminder_interval_months ||
            care.reminder_interval_years,
    );

const markDone = async (care: Event) => {
    if (isCareRecurring(care)) {
        selectedCare.value = care;
        careDoneForm.value = {
            date: toDateInputValue(care.event_date),
        };
        isCareDoneOpen.value = true;
        return;
    }
    try {
        await eventsApi.update(care.id, { reminder_enabled: false });
        await loadCares();
        snackbar.value = {
            show: true,
            message: "Soin marqué comme fait.",
            color: "success",
        };
    } catch (error) {
        console.error("Error marking care as done:", error);
        snackbar.value = {
            show: true,
            message: "Action impossible.",
            color: "error",
        };
    }
};

const openDelete = (care: Event) => {
    selectedCare.value = care;
    isDeleteOpen.value = true;
};

const getCareActions = (care: Event): CareAction[] => [
    {
        key: "done",
        title: "Valider",
        icon: "mdi-check",
        disabled: false,
        onClick: () => markDone(care),
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => openEdit(care),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDelete(care),
    },
];

const saveCareDone = async () => {
    if (!selectedCare.value) return;
    if (!careDoneForm.value.date) {
        careDoneErrors.value = { date: "Merci de renseigner une date." };
        return;
    }
    careDoneErrors.value = {};
    try {
        const appointmentDate = fromDateInputValue(careDoneForm.value.date);
        await eventsApi.create({
            name: selectedCare.value.name,
            description: selectedCare.value.description,
            event_date: appointmentDate,
            horse_id: selectedCare.value.horse_id,
            product_id: selectedCare.value.product_id,
            is_care: true,
            reminder_type: "soin",
            reminder_enabled: false,
        });
        await eventsApi.update(selectedCare.value.id, {
            event_date: appointmentDate,
            reminder_enabled: true,
            reminder_interval_days: selectedCare.value.reminder_interval_days,
            reminder_interval_months: selectedCare.value.reminder_interval_months,
            reminder_interval_years: selectedCare.value.reminder_interval_years,
        });
        await loadCares();
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
const confirmDelete = async () => {
    if (!selectedCare.value) return;
    try {
        await eventsApi.delete(selectedCare.value.id);
        await loadCares();
        isDeleteOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Soin supprimé.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting care:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

onMounted(() => {
    loadCares();
});

watch(
    () => horseSelectionId.value,
    (value) => {
        if (value && filterValues.horseId !== value) {
            filterValues.horseId = value;
        }
    },
    { immediate: true },
);
</script>
