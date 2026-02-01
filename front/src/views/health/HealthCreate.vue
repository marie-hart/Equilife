<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5"
                    >Ajouter un soin</v-card-title
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
                                    v-model="form.horseIds"
                                    :items="horseOptions"
                                    label="Chevaux"
                                    density="compact"
                                    variant="outlined"
                                    multiple
                                    chips
                                    :error-messages="
                                        fieldErrors.horseIds
                                            ? [fieldErrors.horseIds]
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
                                @click="createCare"
                            >
                                Ajouter
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
import { computed, onActivated, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { materialsApi } from "@/api/materials";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Material } from "@/types";
import { fromDateInputValue } from "@/libs/date";
import { useHorseSelection } from "@/composables/useHorseSelection";

type RecurrenceUnit = "days" | "months" | "years";

const { horses, getHorseIdsFromParamsOrStored } = useHorseSelection();
const materials = ref<Material[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
const form = ref({
    horseIds: [] as string[],
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

const loadMaterials = async () => {
    try {
        materials.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading materials:", error);
    }
};

const createCare = async () => {
    const productName =
        materials.value
            .find((material) => material.id === form.value.productId)
            ?.name?.trim() || "";
    const careName = form.value.careDescription.trim() || productName;
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseIds", label: "un cheval", value: form.value.horseIds },
        { key: "careDescription", label: "une description", value: careName },
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
        (!form.value.recurrenceInterval || form.value.recurrenceInterval < 1)
    ) {
        snackbar.value = {
            show: true,
            message: "Merci de renseigner une récurrence valide.",
            color: "error",
        };
        return;
    }

    try {
        isSubmitting.value = true;
        const { recurrenceInterval, recurrenceUnit } = form.value;
        const intervalDays =
            form.value.isRecurring && recurrenceUnit === "days"
                ? recurrenceInterval
                : undefined;
        const intervalMonths =
            form.value.isRecurring && recurrenceUnit === "months"
                ? recurrenceInterval
                : undefined;
        const intervalYears =
            form.value.isRecurring && recurrenceUnit === "years"
                ? recurrenceInterval
                : undefined;

        await Promise.all(
            form.value.horseIds.map((horseId) =>
                eventsApi.create({
                    name: careName,
                    description: form.value.note || undefined,
                    event_date: fromDateInputValue(form.value.date),
                    horse_id: horseId,
                    product_id: form.value.productId || undefined,
                    is_care: true,
                    reminder_type: "soin",
                    reminder_enabled: form.value.isRecurring,
                    reminder_interval_days: intervalDays,
                    reminder_interval_months: intervalMonths,
                    reminder_interval_years: intervalYears,
                }),
            ),
        );

        snackbar.value = {
            show: true,
            message: "Soin(s) créé(s).",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error creating care:", error);
        snackbar.value = {
            show: true,
            message: "Création impossible.",
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    const horseId = route.params.id as string | undefined;
    if (horseId) {
        router.push({ name: "HorseHealth", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

const refreshMaterials = async () => {
    await loadMaterials();
};

const handleVisibilityRefresh = () => {
    if (document.visibilityState === "visible") {
        refreshMaterials();
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await refreshMaterials();
        form.value.horseIds = getHorseIdsFromParamsOrStored();
        window.addEventListener("focus", refreshMaterials);
        document.addEventListener("visibilitychange", handleVisibilityRefresh);
    } finally {
        isLoading.value = false;
    }
});

onActivated(() => {
    refreshMaterials();
});

onUnmounted(() => {
    window.removeEventListener("focus", refreshMaterials);
    document.removeEventListener("visibilitychange", handleVisibilityRefresh);
});
</script>
