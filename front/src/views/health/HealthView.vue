<template>
    <v-sheet
        color="#EDE4D8"
        @touchstart.passive="onPullStart"
        @touchend.passive="onPullEnd"
        @touchcancel.passive="resetPullState"
    >
        <v-container class="px-4 pb-10">
        
            <div class="d-flex align-center justify-space-between mb-6 mt-2">
                <div>
                    <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                        Santé
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
                :to="{ name: 'HealthCreate' }"
            >
                Ajouter un soin
            </v-btn>

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
                <v-icon icon="mdi-clipboard-pulse-outline" size="18" color="#7B5B3E" class="me-2" />
                <span class="text-overline font-weight-bold" style="color: #7B5B3E">A venir</span>
            </div>

            <v-skeleton-loader
                v-if="isLoading"
                type="card, card, card"
                bg-color="transparent"
            />
            
            <HealthList
                v-else
                :items="filteredCares"
                :format-date="formatDateLong"
                :format-date-mobile="formatDateMobile"
                :get-horse-name="horsesStore.getHorseNameById"
                :recurrence-label="recurrenceLabel"
                :get-care-actions="getCareActions"
                @click:care="goToCareDetails"
            />

            <div
                v-if="!isLoading && (filteredPastCaresForList.length || filteredHistoryForList.length)"
                class="mt-8"
            >
                <div class="mb-4 d-flex align-center">
                    <v-icon icon="mdi-history" size="18" color="#7B5B3E" class="me-2" />
                    <span class="text-overline font-weight-bold" style="color: #7B5B3E">Historique</span>
                </div>
                <HealthList
                    v-if="filteredPastCaresForList.length"
                    :items="filteredPastCaresForList"
                    :format-date="formatDateLong"
                    :format-date-mobile="formatDateMobile"
                    :get-horse-name="horsesStore.getHorseNameById"
                    :recurrence-label="recurrenceLabel"
                    :get-care-actions="getCareActions"
                    @click:care="goToCareDetails"
                />
                <HealthList
                    v-if="filteredHistoryForList.length"
                    class="mt-4"
                    :items="filteredHistoryForList"
                    :format-date="formatDateLong"
                    :format-date-mobile="formatDateMobile"
                    :get-horse-name="horsesStore.getHorseNameById"
                    :recurrence-label="() => '-'"
                    :get-care-actions="getHistoryCareActions"
                    :show-done-tag="true"
                    @click:care="() => {}"
                />
            </div>

            <v-dialog v-model="isCareDoneOpen" max-width="420px">
                <v-card rounded="xl" class="pa-4">
                    <v-card-title class="text-h6 font-weight-bold" style="color: #2E4B36">
                        Soin effectué
                    </v-card-title>
                    <v-card-text>
                        <p class="text-body-2 mb-4" style="color: #7a6e61">
                            Confirmez la date à laquelle le soin a été réalisé pour programmer le prochain.
                        </p>
                        <DatePickerField
                            v-model="careDoneForm.date"
                            label="Date de réalisation"
                            variant="outlined"
                            color="#2E4B36"
                            rounded="lg"
                        />
                    </v-card-text>
                    <v-card-actions class="px-4 pb-4">
                        <v-spacer></v-spacer>
                        <v-btn variant="text" color="#554338" class="text-none" @click="isCareDoneOpen = false">Annuler</v-btn>
                        <v-btn variant="flat" color="#2E4B36" rounded="xl" class="text-none px-6" @click="saveCareDone">Valider</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <ConfirmDeleteDialog
                v-model="isDeleteOpen"
                title="Supprimer le soin"
                :message="deleteMessage"
                @confirm="confirmDelete"
            />

            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" rounded="lg">
                {{ snackbar.message }}
            </v-snackbar>

        </v-container>
    </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFilters } from "@/composables/useFilters";
import { logger } from "@/services/LoggerService";
import { useHorsesStore } from "@/stores/HorsesStore"; 
import { useEventsStore } from "@/stores/EventsStore";
import type { CareAction, Event, CareHistoryEntry } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import {
    formatDateLong,
    formatDateMobile,
    parseDateOnly,
    startOfDay,
    toDateInputValue,
} from "@/libs/date";
import { ConfirmDeleteDialog, FiltersPanel, DatePickerField } from "@/components";
import { HealthList } from "@/views/health";

const cares = ref<Event[]>([]);
const careHistory = ref<CareHistoryEntry[]>([]);
const isLoading = ref(true);
const isDeleteOpen = ref(false);
const selectedCare = ref<Event | null>(null);
const selectedDeleteCare = ref<{ id: string; name: string } | null>(null);
const isCareDoneOpen = ref(false);
const careDoneForm = ref({ date: "" });
const pullStartY = ref<number | null>(null);
const pullCanRefresh = ref(false);
const isPullRefreshing = ref(false);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const router = useRouter();
const route = useRoute();
const horsesStore = useHorsesStore();
const eventsStore = useEventsStore();

const goToCareDetails = (care: Event | CareHistoryEntry) => {
    if ("care_status" in care) return;
    router.push({ name: "HealthDetails", params: { id: care.id } });
};

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

const careCategoryOptions = computed(() => {
    const categories = new Set<string>([
        "Maladie",
        "Bobo",
        "Soins courants",
        "Cures",
    ]);
    for (const care of cares.value) {
        const value = care.category?.trim();
        if (value) categories.add(value);
    }
    for (const historyEntry of careHistory.value) {
        const value = historyEntry.category?.trim();
        if (value) categories.add(value);
    }
    return [
        { title: "Toutes", value: "all" },
        ...Array.from(categories)
            .sort((a, b) => a.localeCompare(b, "fr"))
            .map((value) => ({ title: value, value })),
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
        key: "type",
        type: "select",
        label: "Type de soin",
        defaultValue: "all",
        options: careTypeOptions.value,
    },
];

const { filterValues } = useFilters(filters);

const getCareType = (care: Event): string => (care.name || "").trim();
const getCareCategory = (care: Event | CareHistoryEntry): string =>
    (care.category || "").trim();

const deleteMessage = computed(() => 
    selectedDeleteCare.value
        ? `Confirmer la suppression du soin "${selectedDeleteCare.value.name}" ?`
        : "Confirmer la suppression ?"
);

const applyCareFilters = (
    items: Event[],
    overrides: Partial<{
        horseId: string;
        type: string;
    }> = {},
) => {
    const horseId = overrides.horseId ?? filterValues.horseId;
    const type = overrides.type ?? filterValues.type;
    let result = items;
    if (horseId !== "all") {
        result = result.filter((care) => care.horse_id === horseId);
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
    const base = horsesStore.horseFilterOptions; 
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
    ...(horsesStore.horses.length > 1
        ? [{ ...filters[0], options: availableHorseOptions.value }]
        : []),
    { ...filters[1], options: availableTypeOptions.value },
]);

const recurrenceLabel = (care: Event | CareHistoryEntry): string => {
    if ("care_status" in care) return "-";
    const ev = care as Event;
    const days = ev.reminder_interval_days;
    const months = ev.reminder_interval_months;
    const years = ev.reminder_interval_years;
    if (!ev.reminder_enabled || (!days && !months && !years)) return "-";
    if (days) return `Tous les ${days} jour${days > 1 ? "s" : ""}`;
    if (months) return `Tous les ${months} mois`;
    if (years) return `Tous les ${years} an${years > 1 ? "s" : ""}`;
    return "-";
};

const todayStartTimestamp = computed(() =>
    startOfDay(new Date()).getTime(),
);

const filteredCares = computed(() => {
    const result = applyCareFilters(cares.value).filter(
        (care) => parseDateOnly(care.event_date).getTime() >= todayStartTimestamp.value,
    );
    return [...result].sort(
        (a, b) =>
            parseDateOnly(a.event_date).getTime() - parseDateOnly(b.event_date).getTime(),
    );
});

const filteredPastCares = computed(() =>
    applyCareFilters(cares.value).filter(
        (care) => parseDateOnly(care.event_date).getTime() < todayStartTimestamp.value,
    ),
);

const filteredPastCaresForList = computed(() =>
    [...filteredPastCares.value].sort(
        (a, b) =>
            parseDateOnly(b.event_date).getTime() - parseDateOnly(a.event_date).getTime(),
    ),
);

const filteredHistory = computed(() => {
    let result = careHistory.value;
    if (filterValues.horseId !== "all") {
        result = result.filter((h) => h.horse_id === filterValues.horseId);
    }
    if (filterValues.type !== "all") {
        result = result.filter((h) => (h.name || "").trim() === filterValues.type);
    }
    return result;
});

const filteredHistoryForList = computed(() =>
    [...filteredHistory.value].sort(
        (a, b) =>
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    ),
);

const loadCares = async (forceRefresh = false) => {
    isLoading.value = true;
    try {
        const [events, history] = await Promise.all([
            eventsStore.fetchEvents(undefined, forceRefresh).catch((error) => {
                logger.error("Error loading care events:", error);
                return [] as Event[];
            }),
            eventsStore.fetchCareHistory(undefined, forceRefresh).catch((error) => {
                logger.error("Error loading care history:", error);
                return [] as CareHistoryEntry[];
            }),
        ]);
        cares.value = events.filter((event) => event.is_care);
        careHistory.value = history;
    } catch (error) {
        logger.error("Error loading cares:", error);
    } finally {
        isLoading.value = false;
    }
};

const loadHistory = async (forceRefresh = false) => {
    try {
        careHistory.value = await eventsStore.fetchCareHistory(
            undefined,
            forceRefresh,
        );
    } catch (error) {
        logger.error("Error loading care history:", error);
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
        await loadCares(true);
    } finally {
        isPullRefreshing.value = false;
    }
}

const isCareRecurring = (care: Event): boolean =>
    care.reminder_enabled &&
    Boolean(
        care.reminder_interval_days ||
            care.reminder_interval_months ||
            care.reminder_interval_years,
    );

const markDone = (care: Event) => {
    selectedCare.value = care;
    careDoneForm.value = {
        date: toDateInputValue(care.event_date ? new Date(care.event_date) : new Date()),
    };
    isCareDoneOpen.value = true;
};

const saveCareDone = async () => {
    if (!selectedCare.value) return;
    try {
        const care = selectedCare.value;
        await eventsStore.markCareDone(care.id, careDoneForm.value.date);

        snackbar.value.message = isCareRecurring(care)
            ? "Soin historisé avec tag 'done' et prochain rendez-vous planifié."
            : "Soin validé avec tag 'done' et enregistré dans l'historique.";
        snackbar.value.show = true;
        snackbar.value.color = "success";
        isCareDoneOpen.value = false;
        await loadCares(true);
        await loadHistory(true);
    } catch (error) {
        logger.error("Erreur lors de la validation:", error);
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
    }
};

const openDelete = (care: { id: string; name: string }) => {
    selectedDeleteCare.value = care;
    isDeleteOpen.value = true;
};

const getCareActions = (care: Event | CareHistoryEntry): CareAction[] => {
    if ("care_status" in care) return [];
    return [
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
        onClick: () => openDelete({ id: care.id, name: care.name || "le soin" }),
    },
];
};

const getHistoryCareActions = (care: Event | CareHistoryEntry): CareAction[] => {
    if (!("care_status" in care)) return getCareActions(care);
    const sourceId = care.original_event_id;
    return [
        {
            key: "edit",
            title: "Modifier",
            icon: "mdi-pencil",
            disabled: !sourceId,
            to: sourceId ? { name: "HealthEdit", params: { id: sourceId } } : undefined,
        },
        {
            key: "delete",
            title: "Supprimer",
            icon: "mdi-trash-can",
            color: "error",
            disabled: !sourceId,
            onClick: sourceId
                ? () => openDelete({ id: sourceId, name: care.name || "le soin" })
                : undefined,
        },
    ];
};

const confirmDelete = async () => {
    if (!selectedDeleteCare.value) return;
    try {
        await eventsStore.deleteEvent(selectedDeleteCare.value.id);
        await loadCares(true);
        isDeleteOpen.value = false;
        selectedDeleteCare.value = null;
        snackbar.value = {
            show: true,
            message: "Soin supprimé.",
            color: "success",
        };
    } catch (error) {
        logger.error("Error deleting care:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

onMounted(async () => {
    await loadCares();
    if (route.query.forceHorseFilter === "all") {
        filterValues.horseId = "all";
        const { forceHorseFilter: _drop, ...restQuery } = route.query;
        await router.replace({ query: restQuery });
    }
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