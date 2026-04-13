<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pb-10"
    @touchstart.passive="onPullStart"
    @touchend.passive="onPullEnd"
    @touchcancel.passive="resetPullState"
  >
    <v-container class="px-4 py-2">
      <v-progress-linear
        v-if="isPullRefreshing"
        indeterminate
        color="#7B5B3E"
        rounded
        class="mb-3"
      />
      
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Alimentation
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
        :to="{ name: 'FeedingCreate' }"
      >
        Ajouter une ration
      </v-btn>

      <FiltersPanel
        v-if="filterDefinitions.length"
        :filters="filterDefinitions"
        v-model="filterValues"
        class="mb-6"
      />

      <div v-if="filterDefinitions.length" class="mb-4 d-flex align-center">
        <v-icon icon="mdi-filter-variant" size="18" color="#7B5B3E" class="me-2" />
        <span class="text-overline font-weight-bold" style="color: #7B5B3E">Filtres</span>
      </div>

      <v-skeleton-loader
        v-if="isLoading"
        type="card, card"
        bg-color="transparent"
      />
      
      <FeedingList
        v-else
        :rations="rations"
        :get-horse-name="horsesStore.getHorseNameById"
        :get-product-name="getProductName"
        :item-type-label="itemTypeLabel"
        @details="openDetails"
        @edit="openFeedingEdit"
        @share="shareRation"
        @delete="deleteRation"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
        <div class="text-center w-100 font-weight-bold">{{ snackbar.message }}</div>
      </v-snackbar>

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { rationsApi } from "@/api/rations";
import { productApi } from "@/api/product";
import { logger } from "@/services/LoggerService";
import type { Product, Ration } from "@/types";
import type { FilterDefinition } from "@/types/filters";
import { useHorsesStore } from "@/stores/HorsesStore";
import { FeedingList } from "@/views/feeding";
import { generateRationPDF } from "@/utils/RationPdfService";
import { usePullToRefresh } from "@/composables/usePullToRefresh";
import { FiltersPanel } from "@/components";
import { useFilters } from "@/composables/useFilters";

const router = useRouter();
const horsesStore = useHorsesStore(); 

const products = ref<Product[]>([]);
const rations = ref<Ration[]>([]);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const filters: readonly FilterDefinition<string>[] = [
    {
        key: "horseId",
        type: "select",
        label: "Cheval",
        defaultValue: "all",
        options: [],
    },
];

const { filterValues } = useFilters(filters);
const showHorseFilter = computed(() => horsesStore.horses.length > 1);
const filterDefinitions = computed(() => [
    ...(showHorseFilter.value
        ? [{ ...filters[0], options: horsesStore.horseFilterOptions }]
        : []),
]);

const itemTypeLabel = (value?: string): string => {
    switch (value) {
        case "Granulés":
            return "Granulés";
        case "Complément":
            return "Complément";
        default:
            return "Autres";
    }
};

const getProductName = (productId?: string): string | undefined =>
    products.value.find((product) => product.id === productId)?.name;

const loadProducts = async () => {
    try {
        products.value = await productApi.getAll(false);
    } catch (error) {
        logger.error("Error loading products:", error);
    }
};

const loadRations = async () => {
    isLoading.value = true;
    try {
        const horseFilter = (horsesStore.horseId && horsesStore.horseId !== "all") 
            ? horsesStore.horseId 
            : undefined;
        
        const data = await rationsApi.getAll(horseFilter);
        rations.value = data;
    } catch (error) {
        logger.error("Error loading rations:", error);
    } finally {
        isLoading.value = false;
    }
};

const { isPullRefreshing, onPullStart, onPullEnd, resetPullState } =
    usePullToRefresh(async () => {
        await Promise.all([loadProducts(), loadRations()]);
    });

const shareRation = async (ration: Ration) => {
    const horseName = horsesStore.getHorseNameById(ration.horse_id) || "mon cheval";
    
    try {
        isLoading.value = true;
        await generateRationPDF(ration, horseName, getProductName);
        
        snackbar.value = {
            show: true,
            message: "PDF généré et téléchargé.",
            color: "success",
        };
    } catch (error) {
        logger.error("Erreur PDF:", error);
        snackbar.value = {
            show: true,
            message: "Erreur lors de la génération du PDF.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
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
        logger.error("Error deleting ration:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const openDetails = (ration: Ration) => {
    if (ration.horse_id) horsesStore.sethorseId(ration.horse_id);
    router.push({ name: "FeedingDetails", params: { rationId: ration.id } });
};

const openFeedingEdit = (ration: Ration) => {
    if (ration.horse_id) horsesStore.sethorseId(ration.horse_id);
    router.push({ name: "FeedingEdit", params: { rationId: ration.id } });
};

watch(() => horsesStore.horseId, () => {
    loadProducts();
    loadRations();
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
watch(
    () => filterValues.horseId,
    (value) => {
        if (value && horsesStore.horseId !== value) {
            horsesStore.sethorseId(value);
        }
    },
);

onMounted(async () => {
    await loadProducts();
    await loadRations();
});

</script>