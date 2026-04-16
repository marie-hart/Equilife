<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pa-0"
    @touchstart.passive="onPullStart"
    @touchend.passive="onPullEnd"
    @touchcancel.passive="resetPullState"
  >
    <v-container class="px-4 pb-10">
      <v-progress-linear
        v-if="isPullRefreshing"
        indeterminate
        color="#7B5B3E"
        rounded
        class="mb-3"
      />
      
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Produits
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
        :to="{ name: 'ProductCreate' }"
      >
        Ajouter un produit
      </v-btn>

      <v-text-field
        v-model="searchQuery"
        placeholder="Rechercher un produit..."
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        flat
        density="comfortable"
        rounded="xl"
        clearable
        hide-details
        bg-color="#FFFFFF"
        class="mb-6 shadow-subtle"
      />

      <div class="mb-4 d-flex align-center">
        <v-icon icon="mdi-filter-variant" size="18" color="#7B5B3E" class="me-2" />
        <span class="text-overline font-weight-bold" style="color: #7B5B3E">Résultats</span>
      </div>

      <div v-if="criticalProducts.length" class="mb-6">
        <div class="d-flex align-center mb-2 ps-1">
          <v-icon color="#7B5B3E" size="18" class="me-2">mdi-leaf-alert</v-icon>
          <span class="text-caption font-weight-bold" style="color: #7B5B3E; letter-spacing: 1px;">
            À SURVEILLER
          </span>
        </div>
        
        <v-card
          v-for="product in criticalProducts"
          :key="product.id"
          variant="flat"
          rounded="xl" 
          class="mb-2 shadow-subtle border-light bg-white"
        >
          <ProductItem :product="product" is-critical />
        </v-card>
      </div>

      <div class="w-100">
        <div class="mb-3 ps-1">
          <h2 class="text-h6 font-weight-black" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Le Catalogue
          </h2>
          <div style="width: 30px; height: 2px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-card
          v-for="product in normalProducts"
          :key="product.id"
          variant="flat"
          rounded="xl" 
          class="mb-2 shadow-subtle border-light bg-white"
        >
          <ProductItem :product="product" />
        </v-card>

        <div v-if="!isLoading && criticalProducts.length === 0 && normalProducts.length === 0" class="text-center py-8">
          <v-icon size="48" color="#A89F94" class="mb-2">mdi-horse-variant</v-icon>
          <p class="text-body-2" style="color: #A89F94; font-style: italic;">
            Votre sellerie est vide...
          </p>
        </div>
      </div>

    </v-container>
  </v-sheet>
</template>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}

.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}

.text-h4 {
  font-size: 1.75rem !important;
  line-height: 1.2;
}

</style>
<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from "vue";
import { logger } from "@/services/LoggerService";
import type { Product } from "@/types";
import ProductItem from "./ProductItem.vue";
import { getStockStatus } from "@/utils/productStock";
import { productApi } from "@/api/product";
import { usePullToRefresh } from "@/composables/usePullToRefresh";

const props = withDefaults(defineProps<{ 
  products?: Product[] 
}>(), {
  products: () => []
});

const localProducts = ref<Product[]>([]);
const isLoading = ref(!props.products || props.products.length === 0);
const searchQuery = ref("");

const allProducts = computed(() => 
  props.products && props.products.length > 0 ? props.products : localProducts.value
);

const searchedProducts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  // Si la barre de recherche est vide, on affiche tout le catalogue
  if (!query) return allProducts.value;
  
  return allProducts.value.filter(p => {
    // On récupère uniquement le nom, avec une sécurité si p.name est null/undefined
    const productName = (p.name || '').toLowerCase();
    
    // On vérifie si la saisie est incluse dans le nom
    return productName.includes(query);
  });
});

const criticalProducts = computed(() => 
  searchedProducts.value.filter(p => ['rupture', 'low'].includes(getStockStatus(p)))
);

const normalProducts = computed(() => 
  searchedProducts.value.filter(p => !['rupture', 'low'].includes(getStockStatus(p)))
);

async function loadProducts() {
  if (props.products && props.products.length > 0) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    localProducts.value = await productApi.getAll();
  } catch (error) {
    logger.error("Erreur:", error);
  } finally {
    isLoading.value = false;
  }
}

const { isPullRefreshing, onPullStart, onPullEnd, resetPullState } =
    usePullToRefresh(async () => {
        await loadProducts();
    });

onMounted(loadProducts);
onActivated(loadProducts);
</script>