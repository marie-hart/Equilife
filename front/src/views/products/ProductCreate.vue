<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Ajouter un produit
                </v-card-title>
            </div>
            
            <v-card 
                class="pa-2" 
                variant="flat" 
                rounded="lg"
                :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
            >
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="card, list-item-two-line"
                    />
                    
                    <v-row v-else dense>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.name"
                                label="Nom *"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                :error-messages="fieldErrors.name ? [fieldErrors.name] : undefined"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.category"
                                :items="categoryOptions"
                                label="Catégorie"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                clearable
                            />
                        </v-col>
                        
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.brand"
                                label="Marque"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="4">
                            <v-checkbox
                                v-model="form.isRecurring"
                                label="Récurrence (rappel auto)"
                                density="comfortable"
                                color="primary"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="8" v-if="form.isRecurring">
                            <v-row dense>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model.number="form.recurrenceInterval"
                                        label="Tous les"
                                        type="number"
                                        min="1"
                                        density="comfortable"
                                        variant="outlined"
                                        bg-color="white"
                                        rounded="lg"
                                    />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select
                                        v-model="form.recurrenceUnit"
                                        :items="recurrenceUnits"
                                        label="Unité"
                                        density="comfortable"
                                        variant="outlined"
                                        bg-color="white"
                                        rounded="lg"
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                        
                        <v-col cols="12">
                            <v-textarea
                                v-model="form.note"
                                label="Note libre"
                                density="comfortable"
                                variant="outlined"
                                bg-color="white"
                                rounded="lg"
                                rows="3"
                            />
                        </v-col>
                    </v-row>
                    
                    <div class="d-flex justify-end mt-4">
                        <v-btn 
                            variant="outlined" 
                            rounded="lg"
                            class="mr-2"
                            @click="goBack"
                        >
                            Annuler
                        </v-btn>
                        <v-btn
                            variant="flat"
                            :style="{ backgroundColor: '#554338', color: 'white' }"
                            rounded="lg"
                            class="text-none"
                            :loading="isSubmitting"
                            @click="createProduct"
                        >
                            Enregistrer
                        </v-btn>
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
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { materialsApi } from "@/api/materials";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Product, RecurrenceUnit } from "@/types";

const route = useRoute();
const router = useRouter();
const products = ref<Product[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(true);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const form = ref({
    name: "",
    category: "",
    brand: "",
    note: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
});

const categoryOptions = [
    { title: "Aliment", value: "Aliment" },
    { title: "Complément", value: "Complément" },
    { title: "Soin", value: "Soin" },
    { title: "Matériels", value: "Matériels" },
    { title: "Autres", value: "Autres" },
];

const recurrenceUnits = [
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];

const loadProducts = async () => {
    isLoading.value = true;
    try {
        products.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading products:", error);
    } finally {
        isLoading.value = false;
    }
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return (
            (error.response?.data as { error?: string } | undefined)?.error ??
            "Création impossible."
        );
    }
    return "Création impossible.";
};

const resetForm = () => {
    form.value = {
        name: "",
        category: "",
        brand: "",
        note: "",
        isRecurring: false,
        recurrenceInterval: 1,
        recurrenceUnit: "months",
    };
};

const createProduct = async () => {
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
    const normalizedName = form.value.name.trim().toLowerCase();
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
    if (
        products.value.some(
            (product) =>
                product.name?.trim().toLowerCase() === normalizedName,
        )
    ) {
        snackbar.value = {
            show: true,
            message: "Ce produit existe déjà.",
            color: "error",
        };
        return;
    }
    try {
        isSubmitting.value = true;
        const intervalMonths =
            form.value.isRecurring && form.value.recurrenceUnit === "months"
                ? form.value.recurrenceInterval
                : undefined;
        const intervalYears =
            form.value.isRecurring && form.value.recurrenceUnit === "years"
                ? form.value.recurrenceInterval
                : undefined;
        await materialsApi.create({
            name: form.value.name.trim(),
            category:
                (form.value.category as Product["category"]) || undefined,
            brand: form.value.brand.trim() || undefined,
            used_for_horses: undefined,
            horse_id: undefined,
            note: form.value.note.trim() || undefined,
            needs_repurchase: false,
            purchase_interval_months: intervalMonths,
            purchase_interval_years: intervalYears,
        });
        snackbar.value = {
            show: true,
            message: "Produit ajouté.",
            color: "success",
        };
        resetForm();
        goBack();
    } catch (error) {
        console.error("Error creating product:", error);
        snackbar.value = {
            show: true,
            message: getErrorMessage(error),
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    const horseId = route.params.id as string | undefined;
    if (horseId) {
        router.push({ name: "Products", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

onMounted(async () => {
    await loadProducts();
});
</script>
