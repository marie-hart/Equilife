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
                        :to="{ name: 'Dashboard' }"
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
                        :to="{ name: 'HealthCreate', params: { id: horsesStore.horseId !== 'all' ? horsesStore.horseId : undefined } }"
                        :style="{ backgroundColor: '#1F3D2B', color: 'white' }"
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
                    :get-horse-name="horsesStore.getHorseNameById"
                    :recurrence-label="recurrenceLabel"
                    :get-care-actions="getCareActions"
                />
            </div>
        </main>
    </div>
    <div class="page">
        <main class="pa-4">
            <ConfirmDeleteDialog
                v-model="isDeleteOpen"
                title="Supprimer le soin"
                :message="deleteMessage"
                @confirm="confirmDelete"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { eventsApi } from "@/api/events";
import { useFilters } from "@/composables/useFilters";
import { useHorsesStore } from "@/stores/HorsesStore"; 
import type { CareAction, CareStatus, Event,  } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import {
    formatDateLong,
    formatDateMobile,
    isSameDay,
    startOfDay,
    toDateInputValue,
} from "@/libs/date";
import { ConfirmDeleteDialog, FiltersPanel } from "@/components";
import { HealthList } from "@/views/health";

const cares = ref<Event[]>([]);
const isLoading = ref(true);
const isDeleteOpen = ref(false);
const selectedCare = ref<Event | null>(null);
const isCareDoneOpen = ref(false);
const careDoneForm = ref({ date: "" });
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const horsesStore = useHorsesStore();

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

const filters: readonly FilterDefinition<string>[] = [
    {
        key: "horseId",
        type: "select",
        label: "Cheval",
        defaultValue: "all",
        options: horsesStore.horseFilterOptions,
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

const deleteMessage = computed(() => 
    selectedCare.value 
        ? `Confirmer la suppression du soin "${selectedCare.value.name}" ?`
        : "Confirmer la suppression ?"
);

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
    const base = horsesStore.horseFilterOptions; // UPDATED
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
        to: { name: 'HealthEdit', params: { id: care.id }},
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

onMounted(() => {
    loadCares();
});

watch(
    () => horsesStore.horseId,
    (value) => {
        if (value && filterValues.horseId !== value) {
            filterValues.horseId = value;
        }
    },
    { immediate: true },
);
</script>