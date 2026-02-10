<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-4">
                <v-card-title class="ma-0 text-h5">Alimentation</v-card-title>
            </div>
            <div class="d-flex flex-column ga-4">
                <div class="d-flex align-center justify-space-between ga-4">
                    <v-btn variant="outlined" @click="goToDashboard">
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn
                        class="primary-btn"
                        color="primary"
                        variant="flat"
                        @click="goToFeedingCreate"
                    >
                        <v-icon icon="mdi-plus" class="me-2" />
                        Ajouter
                    </v-btn>
                </div>

                <v-card class="section-card" variant="outlined">
                    <v-card-title class="text-subtitle-1">Filtres</v-card-title>
                    <v-card-text class="pt-3">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="selectedHorseId"
                                    :items="horseFilterOptions"
                                    label="Cheval"
                                    density="compact"
                                    variant="outlined"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-skeleton-loader
                    v-if="isLoading"
                    type="list-item-two-line, list-item-two-line, list-item-two-line"
                />
                <FeedingList
                    v-else
                    :rations="rations"
                    :get-horse-name="getHorseName"
                    :get-product-name="getProductName"
                    :item-type-label="itemTypeLabel"
                    @edit="openRationEdit"
                    @share="shareRation"
                    @delete="deleteRation"
                />
            </div>

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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { rationsApi } from "@/api/rations";
import { materialsApi } from "@/api/materials";
import type { Product, Ration } from "@/types";
import { useHorseSelection } from "@/composables/useHorseSelection";
import { FeedingList } from "@/views/feeding";

const route = useRoute();
const router = useRouter();
const {
    horses,
    horseFilterOptions,
    selectedHorseId,
    setHorseFromParamsOrStored,
    getHorseName,
} = useHorseSelection();
const products = ref<Product[]>([]);
const rations = ref<Ration[]>([]);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const horseById = computed(
    () => new Map(horses.value.map((horse) => [horse.id, horse])),
);

const itemTypeLabel = (value?: string): string => {
    switch (value) {
        case "aliment":
            return "Aliment";
        case "complement":
            return "Complément";
        default:
            return "Autre";
    }
};

const getProductName = (productId?: string): string | undefined =>
    products.value.find((product) => product.id === productId)?.name;

const loadProducts = async () => {
    try {
        products.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading products:", error);
    }
};

const loadRations = async () => {
    isLoading.value = true;
    try {
        const horseFilter =
            selectedHorseId.value !== "all" ? selectedHorseId.value : undefined;
        rations.value = await rationsApi.getAll(horseFilter);
    } catch (error) {
        console.error("Error loading rations:", error);
    } finally {
        isLoading.value = false;
    }
};

watch(selectedHorseId, () => {
    loadProducts();
    loadRations();
});

onMounted(async () => {
    setHorseFromParamsOrStored("all");
    await loadProducts();
    await loadRations();
});

const goToFeedingCreate = () => {
    const horseId = route.params.id as string | undefined;
    if (horseId) {
        router.push({ name: "HorseFeedingCreate", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

const shareRation = async (ration: Ration) => {
    const items = ration.items
        .map((item) => {
            const name = getProductName(item.product_id) || "Produit";
            const parts = [
                name,
                item.quantity ? item.quantity : null,
                item.frequency.length ? item.frequency.join(", ") : null,
                item.type ? itemTypeLabel(item.type) : null,
            ].filter(Boolean);
            return `• ${parts.join(" • ")}`;
        })
        .join("\n");
    const horseName = getHorseName();
    const text = `Ration: ${ration.name}\nCheval: ${horseName}\n${items}`;
    try {
        if (navigator.share) {
            await navigator.share({ title: `Ration ${ration.name}`, text });
            snackbar.value = {
                show: true,
                message: "Ration partagée.",
                color: "success",
            };
            return;
        }
        await navigator.clipboard.writeText(text);
        snackbar.value = {
            show: true,
            message: "Lien copié.",
            color: "success",
        };
    } catch (error) {
        console.error("Error sharing ration:", error);
        snackbar.value = {
            show: true,
            message: "Partage impossible.",
            color: "error",
        };
    }
};

const openRationEdit = (ration: Ration) => {
    router.push({
        name: "RationEdit",
        params: { id: ration.id },
        query: { horseId: ration.horse_id },
    });
};

const deleteRation = async (ration: Ration) => {
    try {
        await rationsApi.delete(ration.id);
        await loadRations();
        snackbar.value = {
            show: true,
            message: "Ration supprimée.",
            color: "success",
        };
    } catch (error) {
        console.error("Error deleting ration:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};
</script>
