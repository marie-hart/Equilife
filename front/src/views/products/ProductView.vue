<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5">Produits</v-card-title>
            </div>
            <div class="d-flex flex-column ga-4">
                <v-card class="section-card" variant="outlined">
                    <v-card-title class="text-subtitle-1">Filtres</v-card-title>
                    <v-card-text class="pt-3">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchQuery"
                                    label="Rechercher par nom"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="selectedCategory"
                                    :items="categoryFilterOptions"
                                    label="Catégorie"
                                    density="compact"
                                    variant="outlined"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn variant="outlined" @click="goToDashboard">
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        class="primary-btn"
                        color="primary"
                        variant="flat"
                        @click="goToProductCreate"
                    >
                        <v-icon icon="mdi-plus" class="me-2" />
                        Ajouter
                    </v-btn>
                </div>

                <v-skeleton-loader
                    v-if="isLoading"
                    type="list-item-two-line, list-item-two-line, list-item-two-line"
                />
                <ProductList
                    v-else
                    :materials="filteredMaterials"
                    :get-horse-name="getHorseName"
                    :recurrence-label="recurrenceLabel"
                    :get-material-actions="getMaterialActions"
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
import { useRoute, useRouter } from "vue-router";
import { materialsApi } from "@/api/materials";
import { eventsApi } from "@/api/events";
import { ConfirmDeleteDialog } from "@/components";
import { useHorseSelection } from "@/composable/useHorseSelection";
import type { Material } from "@/types";
import type { Event } from "@/types";
import { ProductList } from "@/views/products";

const route = useRoute();
const router = useRouter();
const { horses, getHorseNameById, getHorseIdsFromParamsOrStored } =
    useHorseSelection();
const materials = ref<Material[]>([]);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});
const selectedMaterial = ref<Material | null>(null);
const isDeleteOpen = ref(false);
const selectedCategory = ref<string>("all");
const searchQuery = ref<string>("");

type MaterialAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

const categoryFilterOptions = [
    { title: "Toutes", value: "all" },
    { title: "Aliment", value: "Aliment" },
    { title: "Complément", value: "Complément" },
    { title: "Soin", value: "Soin" },
    { title: "Matériels", value: "Matériels" },
    { title: "Autres", value: "Autres" },
];

const deleteMessage = computed(() =>
    selectedMaterial.value
        ? `Confirmer la suppression de ${selectedMaterial.value.name} ?`
        : "Confirmer la suppression de ce produit ?",
);

const getHorseName = (horseId?: string): string | undefined =>
    getHorseNameById(horseId);

const recurrenceLabel = (material: Material): string => {
    if (material.purchase_interval_years) {
        return `Tous les ${material.purchase_interval_years} an${material.purchase_interval_years > 1 ? "s" : ""}`;
    }
    if (material.purchase_interval_months) {
        return `Tous les ${material.purchase_interval_months} mois`;
    }
    return "";
};

const getMaterialActions = (material: Material): MaterialAction[] => [
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => openEdit(material),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDelete(material),
    },
];

const loadMaterials = async () => {
    isLoading.value = true;
    try {
        materials.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading materials:", error);
    } finally {
        isLoading.value = false;
    }
};

const normalizeText = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const getReminderHorseId = (): string | undefined =>
    getHorseIdsFromParamsOrStored()[0];

const getMaterialReminder = (
    reminders: Event[],
    materialId: string,
): Event | undefined =>
    reminders.find(
        (reminder) =>
            reminder.product_id === materialId &&
            reminder.reminder_type === "alimentation",
    );

const syncRepurchaseReminder = async (material: Material) => {
    const horseId = getReminderHorseId();
    const reminders = await eventsApi.getReminders(horseId);
    const existing = getMaterialReminder(reminders, material.id);

    if (material.needs_repurchase) {
        if (existing) return;
        await eventsApi.create({
            name: material.name,
            description: "À racheter",
            event_date: new Date().toISOString(),
            horse_id: horseId,
            product_id: material.id,
            reminder_type: "alimentation",
            reminder_enabled: true,
        });
        return;
    }

    if (existing) {
        await eventsApi.update(existing.id, { reminder_enabled: false });
    }
};

const filteredMaterials = computed(() => {
    const normalizedQuery = normalizeText(searchQuery.value.trim());
    const categoryFiltered =
        selectedCategory.value === "all"
            ? materials.value
            : materials.value.filter(
                  (material) => material.category === selectedCategory.value,
              );
    if (!normalizedQuery) return categoryFiltered;
    return categoryFiltered.filter((material) =>
        normalizeText(material.name || "").includes(normalizedQuery),
    );
});

const toggleRepurchase = async (material: Material) => {
    try {
        await materialsApi.update(material.id, {
            needs_repurchase: material.needs_repurchase ?? false,
        });
        await syncRepurchaseReminder(material);
    } catch (error) {
        console.error("Error updating repurchase state:", error);
        snackbar.value = {
            show: true,
            message: "Mise à jour impossible.",
            color: "error",
        };
    }
};

const openEdit = (material: Material) => {
    router.push({ name: "MaterialEdit", params: { id: material.id } });
};

const openDelete = (material: Material) => {
    selectedMaterial.value = material;
    isDeleteOpen.value = true;
};

const confirmDelete = async () => {
    if (!selectedMaterial.value) return;
    try {
        await materialsApi.delete(selectedMaterial.value.id);
        await loadMaterials();
        isDeleteOpen.value = false;
        snackbar.value = {
            show: true,
            message: "Produit supprimé.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting material:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const goToProductCreate = () => {
    const horseId = route.params.id as string | undefined;
    if (horseId) {
        router.push({ name: "HorseProductCreate", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

onMounted(async () => {
    await loadMaterials();
});
</script>
