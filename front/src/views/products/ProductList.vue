<template>
  <v-sheet
    color="#EDE4D8"
    class="pa-0"
  >
    <v-container class="pa-4 pt-4">
      
      <div v-if="criticalProducts.length" class="mb-10">
        <div class="d-flex align-center mb-4 ps-1">
          <v-icon color="#7B5B3E" size="20" class="me-2">mdi-leaf-alert</v-icon>
          <span class="text-overline font-weight-bold" style="color: #6B4F3A; letter-spacing: 2px;">
            À SURVEILLER
          </span>
        </div>
        
        <v-card
          v-for="product in criticalProducts"
          :key="product.id"
          variant="flat"
          rounded="xl" 
          class="mb-4 shadow-subtle border-light bg-white"
        >
          <ProductItem :product="product" is-critical />
        </v-card>
      </div>

      <div class="w-100">
        <div class="mb-6 ps-1">
          <h2 class="text-h5 font-weight-black" style="color: #2E4B36; font-family: 'serif', 'Playfair Display', Georgia, serif;">
            Le Catalogue
          </h2>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;" class="mt-1"></div>
        </div>
        
        <v-card
          v-for="product in normalProducts"
          :key="product.id"
          variant="flat"
          rounded="xl" 
          class="mb-4 shadow-subtle border-light bg-white"
        >
          <ProductItem :product="product" />
        </v-card>

        <div v-if="products.length === 0" class="text-center py-12">
          <v-icon size="64" color="#A89F94" class="mb-4">mdi-horse-variant</v-icon>
          <p class="text-subtitle-1" style="color: #A89F94; font-style: italic;">
            Votre sellerie est vide pour le moment...
          </p>
        </div>
      </div>

    </v-container>
  </v-sheet>
</template>

<style scoped>
/* Ajout d'une ombre très légère pour donner du relief sans être froid */
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}

.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}

/* On force un rendu plus doux des textes */
h2 {
  letter-spacing: -0.5px;
}
</style>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types";
import ProductItem from "./ProductItem.vue";
import { getStockStatus } from "@/utils/productStock";

const props = defineProps<{ products: Product[] }>();

const criticalProducts = computed(() => 
  props.products.filter(p => ['rupture', 'low'].includes(getStockStatus(p)))
);

const normalProducts = computed(() => 
  props.products.filter(p => !['rupture', 'low'].includes(getStockStatus(p)))
);
</script>