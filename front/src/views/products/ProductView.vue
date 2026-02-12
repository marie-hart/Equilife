<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Produits
                </v-card-title>
            </div>
            
            <div class="d-flex flex-column ga-4">
                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn 
                        variant="outlined" 
                        :to="{ name: 'Dashboard'}"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        variant="flat"
                        rounded="lg"
                        :to="{ name: 'ProductCreate', params: { id: horsesStore.horseId } }"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                        class="text-none"
                    >
                        <v-icon start icon="mdi-plus" />
                        Ajouter
                    </v-btn>
                </div>

                <v-card 
                    class="pa-2" 
                    variant="flat" 
                    rounded="lg"
                    :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
                >
                    <v-card-title class="text-subtitle-1 font-weight-bold" :style="{ color: '#3c3226' }">
                        Filtres
                    </v-card-title>
                    <v-card-text class="pt-3">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchQuery"
                                    label="Rechercher par nom"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    prepend-inner-icon="mdi-magnify"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="selectedCategory"
                                    :items="categoryFilterOptions"
                                    label="Catégorie"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    clearable
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                
                <v-skeleton-loader
                    v-if="isLoading"
                    type="list-item-two-line, list-item-two-line, list-item-two-line"
                />
                
                <ProductList
                    v-else
                    :products="filteredProducts"
                    :get-horse-name="horsesStore.getHorseNameById"
                    :recurrence-label="recurrenceLabel"
                    :get-product-actions="getProductActions"
                    :toggle-repurchase="toggleRepurchase"
                />
            </div>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                timeout="2500"
            >
                {{ snackbar.message }}
            </v-snackbar>

            <ConfirmDeleteDialog
                v-model="isDeleteOpen"
                title="Supprimer le produit"
                :message="deleteMessage"
                @confirm="confirmDelete"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { materialsApi } from "@/api/materials";
import { eventsApi } from "@/api/events";
import { ConfirmDeleteDialog } from "@/components";
import { useHorsesStore } from "@/stores/HorsesStore";
import type { Product, ProductAction } from "@/types";
import type { Event } from "@/types";
import { ProductList } from "@/views/products";
// REMOVED: import { storeToRefs } from 'pinia';

const products = ref<Product[]>([]);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});
const selectedProduct = ref<Product | null>(null);
const isDeleteOpen = ref(false);
const selectedCategory = ref<string>("all");
const searchQuery = ref<string>("");

const horsesStore = useHorsesStore(); // Initialisation du Store

const categoryFilterOptions = [
    { title: "Toutes", value: "all" },
    { title: "Aliment", value: "Aliment" },
    { title: "Complément", value: "Complément" },
    { title: "Soin", value: "Soin" },
    { title: "Matériels", value: "Matériels" },
    { title: "Autres", value: "Autres" },
];

const deleteMessage = computed(() =>
    selectedProduct.value
        ? `Confirmer la suppression de ${selectedProduct.value.name} ?`
        : "Confirmer la suppression de ce produit ?",
);

const recurrenceLabel = (product: Product): string => {
    if (product.purchase_interval_years) {
        return `Tous les ${product.purchase_interval_years} an${product.purchase_interval_years > 1 ? "s" : ""}`;
    }
    if (product.purchase_interval_months) {
        return `Tous les ${product.purchase_interval_months} mois`;
    }
    return "";
};

const getProductActions = (product: Product): ProductAction[] => [
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        to: { name: 'ProductEdit', params: { id: product.id }}
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDelete(product),
    },
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

const normalizeText = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

// UPDATED: Use store horseId directly
const getReminderHorseId = (): string | undefined =>
    horsesStore.horseId !== "all" ? horsesStore.horseId || undefined : undefined;

const getProductReminder = (
    reminders: Event[],
    productId: string,
): Event | undefined =>
    reminders.find(
        (reminder) =>
            reminder.product_id === productId &&
            reminder.reminder_type === "alimentation",
    );

const syncRepurchaseReminder = async (product: Product) => {
    const horseId = getReminderHorseId();
    if (!horseId) return; // Pas de cheval spécifique sélectionné
    
    const reminders = await eventsApi.getReminders(horseId);
    const existing = getProductReminder(reminders, product.id);

    if (product.needs_repurchase) {
        if (existing) return;
        await eventsApi.create({
            name: product.name,
            description: "À racheter",
            event_date: new Date().toISOString(),
            horse_id: horseId,
            product_id: product.id,
            reminder_type: "alimentation",
            reminder_enabled: true,
        });
        return;
    }

    if (existing) {
        await eventsApi.update(existing.id, { reminder_enabled: false });
    }
};

const filteredProducts = computed(() => {
    const normalizedQuery = normalizeText(searchQuery.value.trim());
    const categoryFiltered =
        selectedCategory.value === "all"
            ? products.value
            : products.value.filter(
                  (product) => product.category === selectedCategory.value,
              );
    if (!normalizedQuery) return categoryFiltered;
    return categoryFiltered.filter((product) =>
        normalizeText(product.name || "").includes(normalizedQuery),
    );
});

const toggleRepurchase = async (product: Product) => {
    try {
        await materialsApi.update(product.id, {
            needs_repurchase: product.needs_repurchase ?? false,
        });
        await syncRepurchaseReminder(product);
    } catch (error) {
        console.error("Error updating repurchase state:", error);
        snackbar.value = {
            show: true,
            message: "Mise à jour impossible.",
            color: "error",
        };
    }
};

const openDelete = (product: Product) => {
    selectedProduct.value = product;
    isDeleteOpen.value = true;
};

const confirmDelete = async () => {
    if (!selectedProduct.value) return;
    try {
        await materialsApi.delete(selectedProduct.value.id);
        await loadProducts();
        isDeleteOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Produit supprimé.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting product:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

onMounted(async () => {
    await loadProducts();
    await horsesStore.loadHorses(); // Ensure horses are loaded for the getter
});
</script>