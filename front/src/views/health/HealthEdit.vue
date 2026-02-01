<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5"
                    >Modifier le soin</v-card-title
                >
                <v-btn variant="outlined" @click="goBack">Retour</v-btn>
            </div>
            <v-card class="card" variant="outlined">
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="card, list-item-two-line"
                    />
                    <div v-else>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.horseId"
                                    :items="horseOptions"
                                    label="Cheval"
                                    density="compact"
                                    variant="outlined"
                                    :error-messages="
                                        fieldErrors.horseId
                                            ? [fieldErrors.horseId]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.productId"
                                    :items="productOptions"
                                    label="Produit (soin)"
                                    density="compact"
                                    variant="outlined"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="form.careDescription"
                                    label="Description du soin (maréchal, ostéo...)"
                                    density="compact"
                                    :error-messages="
                                        fieldErrors.careDescription
                                            ? [fieldErrors.careDescription]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <DatePickerField
                                    v-model="form.date"
                                    label="Date"
                                    :error-messages="
                                        fieldErrors.date
                                            ? [fieldErrors.date]
                                            : undefined
                                    "
                                />
                            </v-col>
                            <RecurrenceFields
                                v-model="recurrence"
                                :units="recurrenceUnits"
                                :checkbox-md="4"
                                :fields-md="4"
                            />
                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.note"
                                    label="Note libre"
                                    density="compact"
                                    variant="outlined"
                                    rows="3"
                                />
                            </v-col>
                        </v-row>
                        <div class="d-flex justify-end">
                            <v-btn
                                variant="elevated"
                                color="primary"
                                size="small"
                                :loading="isSubmitting"
                                @click="save"
                            >
                                Enregistrer
                            </v-btn>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import type { Event } from "@/types";
import type { Material } from "@/types";
import { materialsApi } from "@/api/materials";
import { useHorseSelection } from "@/composables/useHorseSelection";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);
const care = ref<Event | null>(null);
const form = ref({
    horseId: "",
    productId: "",
    careDescription: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
    note: "",
});
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});
const materials = ref<Material[]>([]);

type RecurrenceUnit = "days" | "months" | "years";

const { horses } = useHorseSelection({ useRouteHorseId: false });

const horseOptions = computed(() =>
    horses.value.map((horse) => ({ title: horse.name, value: horse.id })),
);

const productOptions = computed(() => {
    const seen = new Set<string>();
    const hasCategory = materials.value.some((material) =>
        Boolean(material.category),
    );
    return materials.value
        .filter((material) =>
            hasCategory ? material.category === "Soin" : true,
        )
        .filter((material) => {
            const key = material.name?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((material) => ({ title: material.name, value: material.id }));
});

const recurrenceUnits = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];

const recurrence = computed({
    get: () => ({
        isRecurring: form.value.isRecurring,
        recurrenceInterval: form.value.recurrenceInterval,
        recurrenceUnit: form.value.recurrenceUnit,
    }),
    set: (value) => {
        form.value = { ...form.value, ...value };
    },
});

const goBack = () => {
    const horseId = form.value.horseId || care.value?.horse_id;
    if (horseId) {
        router.push({ name: "HorseHealth", params: { id: horseId } });
        return;
    }
    router.back();
};

const loadMaterials = async () => {
    try {
        materials.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading materials:", error);
    }
};

const loadCare = async () => {
    isLoading.value = true;
    try {
        const id = route.params.id as string;
        const event = await eventsApi.getById(id);
        care.value = event;
        const hasMonthlyRecurrence = Boolean(event.reminder_interval_months);
        const hasYearlyRecurrence = Boolean(event.reminder_interval_years);
        const hasDailyRecurrence = Boolean(event.reminder_interval_days);
        const recurrenceUnit: RecurrenceUnit = hasYearlyRecurrence
            ? "years"
            : hasMonthlyRecurrence
              ? "months"
              : "days";
        const recurrenceInterval = hasYearlyRecurrence
            ? event.reminder_interval_years || 1
            : hasMonthlyRecurrence
              ? event.reminder_interval_months || 1
              : event.reminder_interval_days || 1;
        form.value = {
            horseId: event.horse_id || "",
            productId: event.product_id || "",
            careDescription: event.name || "",
            date: toDateInputValue(event.event_date),
            isRecurring:
                Boolean(event.reminder_enabled) &&
                (hasMonthlyRecurrence || hasYearlyRecurrence || hasDailyRecurrence),
            recurrenceInterval,
            recurrenceUnit,
            note: event.description || "",
        };
    } catch (error) {
        console.error("Error loading care:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de charger le soin.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
    }
};

const save = async () => {
    if (!care.value) return;
    isSubmitting.value = true;
    try {
        const productName =
            materials.value
                .find((material) => material.id === form.value.productId)
                ?.name?.trim() || "";
        const careName = form.value.careDescription.trim() || productName;
        const { errors, firstError } = await validateRequiredFieldsMap([
            { key: "horseId", label: "un cheval", value: form.value.horseId },
            {
                key: "careDescription",
                label: "une description",
                value: careName,
            },
            { key: "date", label: "une date", value: form.value.date },
        ]);
        fieldErrors.value = errors;
        if (firstError) {
            snackbar.value = {
                show: true,
                message: firstError,
                color: "error",
            };
            return;
        }
        if (
            form.value.isRecurring &&
            (!form.value.recurrenceInterval ||
                form.value.recurrenceInterval < 1)
        ) {
            snackbar.value = {
                show: true,
                message: "Merci de renseigner une récurrence valide.",
                color: "error",
            };
            return;
        }
        const intervalDays =
            form.value.isRecurring && form.value.recurrenceUnit === "days"
                ? form.value.recurrenceInterval
                : 0;
        const intervalMonths =
            form.value.isRecurring && form.value.recurrenceUnit === "months"
                ? form.value.recurrenceInterval
                : 0;
        const intervalYears =
            form.value.isRecurring && form.value.recurrenceUnit === "years"
                ? form.value.recurrenceInterval
                : 0;
        await eventsApi.update(care.value.id, {
            name: careName,
            description: form.value.note.trim() || undefined,
            event_date: fromDateInputValue(form.value.date),
            horse_id: form.value.horseId,
            product_id: form.value.productId || undefined,
            is_care: true,
            reminder_type: "soin",
            reminder_enabled: form.value.isRecurring,
            reminder_interval_days: intervalDays,
            reminder_interval_months: intervalMonths,
            reminder_interval_years: intervalYears,
        });
        snackbar.value = {
            show: true,
            message: "Soin mis à jour.",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error updating care:", error);
        snackbar.value = {
            show: true,
            message: "Mise à jour impossible.",
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(async () => {
    await Promise.all([loadMaterials(), loadCare()]);
});
</script>
