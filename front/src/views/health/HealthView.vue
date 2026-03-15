<template>
    <v-sheet color="#EDE4D8" min-height="100vh">
        <v-container class="px-4 pb-10">
        
            <div class="d-flex align-center justify-space-between mb-6 mt-2">
                <div>
                    <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                        Santé
                    </h1>
                    <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
                </div>
                
                <v-btn
                    variant="flat"
                    color="#2E4B36"
                    rounded="xl"
                    class="text-none font-weight-bold"
                    elevation="4"
                    :to="{ name: 'HealthCreate' }"
                >
                    <v-icon icon="mdi-plus" class="me-1" />
                    Ajouter
                </v-btn>
            </div>

            <FiltersPanel
                :filters="filterDefinitions"
                v-model="filterValues"
                class="mb-6"
            />

            <div class="mb-4 d-flex align-center">
                <v-icon icon="mdi-clipboard-pulse-outline" size="18" color="#7B5B3E" class="me-2" />
                <span class="text-overline font-weight-bold" style="color: #7B5B3E">Carnet de santé</span>
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
            />

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
import { eventsApi } from "@/api/events";
import { useFilters } from "@/composables/useFilters";
import { logger } from "@/services/LoggerService";
import { useHorsesStore } from "@/stores/HorsesStore"; 
import type { CareAction, CareStatus, Event } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import {
    formatDateLong,
    formatDateMobile,
    isSameDay,
    startOfDay,
    toDateInputValue,
} from "@/libs/date";
import { ConfirmDeleteDialog, FiltersPanel, DatePickerField } from "@/components";
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
        logger.error("Error loading cares:", error);
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
    selectedCare.value = care;

    if (isCareRecurring(care)) {
        careDoneForm.value = {
            date: toDateInputValue(new Date()),
        };
        isCareDoneOpen.value = true;
    } else {
        try {
            await eventsApi.delete(care.id);
            await loadCares();
            snackbar.value = {
                show: true,
                message: "Soin effectué et supprimé.",
                color: "success",
            };
        } catch (error) {
            logger.error("Erreur lors de la suppression du soin:", error);
            snackbar.value = {
                show: true,
                message: "Action impossible.",
                color: "error",
            };
        }
    }
};

const saveCareDone = async () => {
    if (!selectedCare.value) return;
    try {
        const care = selectedCare.value;
        const doneDate = new Date(careDoneForm.value.date);

        // 1. On crée une copie pour l'historique (soin accompli)
        await eventsApi.create({
            ...care,
            event_date: careDoneForm.value.date,
            reminder_enabled: false, // On désactive le rappel pour l'archive
            is_care: true,
        });

        if (isCareRecurring(care)) {
            // 2. On calcule la date du PROCHAIN rendez-vous
            const nextDate = new Date(doneDate);
            
            if (care.reminder_interval_days) {
                nextDate.setDate(nextDate.getDate() + care.reminder_interval_days);
            } else if (care.reminder_interval_months) {
                nextDate.setMonth(nextDate.getMonth() + care.reminder_interval_months);
            } else if (care.reminder_interval_years) {
                nextDate.setFullYear(nextDate.getFullYear() + care.reminder_interval_years);
            }

            // 3. On met à jour l'événement existant avec la nouvelle date futur
            const formattedNextDate = nextDate.toISOString().split('T')[0];
            
            await eventsApi.update(care.id, {
                event_date: formattedNextDate,
                reminder_enabled: true
            });
            
            snackbar.value.message = "Soin historisé et prochain rendez-vous planifié.";
        } else {
            // Si pas récurrent, on supprime l'original (la copie en historique suffit)
            await eventsApi.delete(care.id);
            snackbar.value.message = "Soin validé et enregistré dans l'historique.";
        }
        
        await loadCares();
        isCareDoneOpen.value = false;
        snackbar.value.show = true;
        snackbar.value.color = "success";

    } catch (error) {
        logger.error("Erreur lors de la validation:", error);
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
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
        logger.error("Error deleting care:", error);
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