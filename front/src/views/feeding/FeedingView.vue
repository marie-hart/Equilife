<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container class="px-4 py-2">
      
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
        :to="{ name: 'FeedingCreate', params: { id: horsesStore.horseId } }"
      >
        Ajouter une ration
      </v-btn>

      <div class="mb-8">
        <div class="text-overline mb-2 ps-1" style="color: #7B5B3E; letter-spacing: 1px;">Rations de :</div>
        <v-select
          v-model="horsesStore.horseId"
          :items="horsesStore.horseFilterOptions"
          variant="solo"
          flat
          bg-color="#F5EFE6"
          rounded="xl"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-horse"
          class="shadow-subtle"
        />
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
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { rationsApi } from "@/api/rations";
import { productApi } from "@/api/product";
import type { Product, Ration } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";
import { FeedingList } from "@/views/feeding";
import { generateRationPDF } from "@/utils/RationPdfService";

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
        console.error("Error loading products:", error);
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
        console.error("Error loading rations:", error);
    } finally {
        isLoading.value = false;
    }
};

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
        console.error("Erreur PDF:", error);
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
        console.error("Error deleting ration:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    }
};

const openDetails = (ration: Ration) => {
    router.push({
        name: "FeedingDetails",
        params: { rationId: ration.id },
        query: { horseId: ration.horse_id }
    });
}

const openFeedingEdit = (ration: Ration) => {
    router.push({
        name: "FeedingEdit",
        params: { rationId: ration.id }, 
        query: { horseId: ration.horse_id },
    });
}

watch(() => horsesStore.horseId, () => {
    loadProducts();
    loadRations();
});

onMounted(async () => {
    await loadProducts();
    await loadRations();
});

</script>