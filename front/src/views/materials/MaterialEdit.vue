<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5"
                    >Modifier le produit</v-card-title
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
                        <v-text-field
                            v-model="form.name"
                            label="Nom"
                            density="compact"
                            :error-messages="
                                fieldErrors.name
                                    ? [fieldErrors.name]
                                    : undefined
                            "
                        />
                        <v-select
                            v-model="form.category"
                            :items="categoryOptions"
                            label="Catégorie"
                            density="compact"
                            variant="outlined"
                        />
                        <v-text-field
                            v-model="form.brand"
                            label="Marque"
                            density="compact"
                        />
                        <v-textarea
                            v-model="form.note"
                            label="Note"
                            density="compact"
                            variant="outlined"
                            rows="2"
                        />
                        <v-row dense>
                            <RecurrenceFields
                                v-model="recurrence"
                                :units="recurrenceUnits"
                                :checkbox-md="4"
                                :fields-md="8"
                            />
                        </v-row>
                        <v-checkbox
                            v-model="form.needs_repurchase"
                            label="À racheter"
                            density="compact"
                        />
                    </div>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="outlined" @click="goBack">Annuler</v-btn>
                    <v-btn variant="elevated" color="primary" @click="save"
                        >Enregistrer</v-btn
                    >
                </v-card-actions>
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
import { materialsApi } from "../../api/materials";
import { RecurrenceFields } from "../../components";
import { validateRequiredFieldsMap } from "../../utils/validation";
import type { Material } from "../../types";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const form = ref({
    name: "",
    category: "" as Material["category"] | "",
    brand: "",
    note: "",
    needs_repurchase: false,
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
});
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const categoryOptions = [
    { title: "Aliment", value: "Aliment" },
    { title: "Complément", value: "Complément" },
    { title: "Soin", value: "Soin" },
    { title: "Matériels", value: "Matériels" },
    { title: "Autres", value: "Autres" },
];

type RecurrenceUnit = "months" | "years";

const recurrenceUnits = [
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

const loadMaterial = async () => {
    try {
        const id = route.params.id as string;
        const material = await materialsApi.getById(id);
        const hasMonthlyRecurrence = Boolean(material.purchase_interval_months);
        const hasYearlyRecurrence = Boolean(material.purchase_interval_years);
        const recurrenceUnit: RecurrenceUnit = hasYearlyRecurrence
            ? "years"
            : "months";
        const recurrenceInterval = hasYearlyRecurrence
            ? material.purchase_interval_years || 1
            : material.purchase_interval_months || 1;
        form.value = {
            name: material.name,
            category: material.category || "",
            brand: material.brand || "",
            note: material.note || "",
            needs_repurchase: material.needs_repurchase ?? false,
            isRecurring: hasMonthlyRecurrence || hasYearlyRecurrence,
            recurrenceInterval,
            recurrenceUnit,
        };
    } catch (error) {
        console.error("Error loading material:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de charger le produit.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
    }
};

const save = async () => {
    try {
        const { errors, firstError } = await validateRequiredFieldsMap([
            { key: "name", label: "un nom", value: form.value.name.trim() },
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
        const intervalMonths =
            form.value.isRecurring && form.value.recurrenceUnit === "months"
                ? form.value.recurrenceInterval
                : 0;
        const intervalYears =
            form.value.isRecurring && form.value.recurrenceUnit === "years"
                ? form.value.recurrenceInterval
                : 0;
        const id = route.params.id as string;
        await materialsApi.update(id, {
            name: form.value.name.trim(),
            category: form.value.category || undefined,
            brand: form.value.brand.trim() || undefined,
            note: form.value.note.trim() || undefined,
            needs_repurchase: form.value.needs_repurchase,
            purchase_interval_months: intervalMonths,
            purchase_interval_years: intervalYears,
        });
        snackbar.value = {
            show: true,
            message: "Produit mis à jour.",
            color: "success",
        };
        router.push({ name: "MaterialDetails", params: { id } });
    } catch (error) {
        console.error("Error saving material:", error);
        snackbar.value = {
            show: true,
            message: "Modification impossible.",
            color: "error",
        };
    }
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    loadMaterial();
});
</script>
