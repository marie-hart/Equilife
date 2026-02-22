<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pa-0 safe-area-top"
  >
    <v-container class="px-4 py-2">
      
      <div class="mb-4">
        <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
          Produits
        </h1>
        <p class="text-body-2" style="color: #7B5B3E;">
          Gérez les produits de vos chevaux
        </p>
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

      <v-row class="mb-6" no-gutters align="center">
        <v-col>
          <v-text-field
            placeholder="Rechercher un produit..."
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            flat
            density="compact"
            rounded="xl"
            hide-details
            bg-color="#F5EFE6"
          ></v-text-field>
        </v-col>
      </v-row>

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
          color="#F5EFE6"
          variant="flat"
          rounded="xl" 
          class="mb-2 shadow-subtle"
        >
          <ProductItem :product="product" is-critical />
        </v-card>
      </div>

      <div class="w-100 pb-16">
        <div class="mb-3 ps-1">
          <h2 class="text-h6 font-weight-black" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Le Catalogue
          </h2>
          <div style="width: 30px; height: 2px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-card
          v-for="product in normalProducts"
          :key="product.id"
          color="#F5EFE6"
          variant="flat"
          rounded="xl" 
          class="mb-2 shadow-subtle"
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
/* Gestion de l'encoche iPhone (Dynamic Island) */
.safe-area-top {
  padding-top: env(safe-area-inset-top, 20px) !important;
}

.shadow-subtle {
  box-shadow: 0 2px 8px rgba(123, 91, 62, 0.05) !important;
  border: 1px solid rgba(168, 159, 148, 0.12) !important;
}

/* On réduit la taille des titres pour le mobile */
.text-h4 {
  font-size: 1.75rem !important;
  line-height: 1.2;
}

/* Pour éviter que le contenu ne soit caché par la barre de navigation du bas */
.pb-16 {
  padding-bottom: 80px !important;
}
</style>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue"; // Ajout de ref et onMounted
import type { Product } from "@/types";
import ProductItem from "./ProductItem.vue";
import { getStockStatus } from "@/utils/productStock";
import { productApi } from "@/api/product";

// 1. On rend la prop optionnelle avec une valeur par défaut pour éviter le crash au rendu initial
const props = withDefaults(defineProps<{ 
  products?: Product[] 
}>(), {
  products: () => []
});

// 2. État local au cas où la vue est utilisée comme une page directe (via router)
const localProducts = ref<Product[]>([]);
const isLoading = ref(true);

// On utilise soit les props (si fournies), soit les données chargées localement
const currentProducts = computed(() => 
  props.products && props.products.length > 0 ? props.products : localProducts.value
);

// 3. Sécurité : On vérifie TOUJOURS si l'array existe avant le filter
const criticalProducts = computed(() => 
  (currentProducts.value || []).filter(p => ['rupture', 'low'].includes(getStockStatus(p)))
);

const normalProducts = computed(() => 
  (currentProducts.value || []).filter(p => !['rupture', 'low'].includes(getStockStatus(p)))
);

// 4. Chargement des données si on arrive sur la vue via le router
onMounted(async () => {
  if (!props.products || props.products.length === 0) {
    try {
      isLoading.value = true;
      localProducts.value = await productApi.getAll();
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});
</script>