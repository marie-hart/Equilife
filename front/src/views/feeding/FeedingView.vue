<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Alimentation
                </v-card-title>
                
                <v-btn
                    color="#554338"
                    variant="flat"
                    rounded="lg"
                    :to="{ name: 'FeedingCreate', params: { id: horsesStore.horseId } }"
                    class="text-none"
                >
                    <v-icon icon="mdi-plus" class="me-2" />
                     ration
                </v-btn>
            </div>

            <div class="d-flex flex-column ga-4">
                <v-card 
                    variant="flat" 
                    rounded="lg"
                    class="pa-2"
                    :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
                >
                    <v-card-text class="pa-2">
                        <v-row dense align="center">
                            <v-col cols="12" md="4">
                                <div class="text-caption font-weight-bold mb-1" :style="{ color: '#554338' }">
                                    FILTRER PAR CHEVAL
                                </div>
                                <v-select
                                    v-model="horsesStore.horseId"
                                    :items="horsesStore.horseFilterOptions"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    hide-details
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
                    :get-horse-name="horsesStore.getHorseNameById"
                    :get-product-name="getProductName"
                    :item-type-label="itemTypeLabel"
                    @edit="openFeedingEdit"
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
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { rationsApi } from "@/api/rations";
import { materialsApi } from "@/api/materials";
import type { Product, Ration } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";
import { FeedingList } from "@/views/feeding";

const router = useRouter();
const route = useRoute();
const horsesStore = useHorsesStore(); // Initialisation du Store

const products = ref<Product[]>([]);
const rations = ref<Ration[]>([]);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

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
        const horseFilter= horsesStore.horseId && horsesStore.horseId !== "all" 
            ? horsesStore.horseId 
            : undefined;
        
        rations.value = await rationsApi.getAll(horseFilter);
    } catch (error) {
        console.error("Error loading rations:", error);
    } finally {
        isLoading.value = false;
    }
};

// --- Logique de chargement réactif ---
watch(() => horsesStore.horseId, () => {
    loadProducts();
    loadRations();
});

onMounted(async () => {
    await loadProducts();
    await loadRations();
});

const openFeedingEdit = (ration: Ration) => {
    router.push({
        name: "FeedingEdit",
        params: { id: ration.id },
        query: { horseId: ration.horse_id },
    });
};

// --- Actions ---
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
    
    // Utilisation du store pour obtenir le nom du cheval de la ration spécifique
    const horseName = horsesStore.getHorseNameById(ration.horse_id) || "Cheval inconnu";
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