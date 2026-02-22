<template>
  <v-sheet 
    color="#EDE4D8" 
    min-height="100vh" 
    class="safe-area-top pb-10"
  >
    <v-container class="px-4 py-2">
      
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Nouveau produit
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn 
          variant="text" 
          icon="mdi-close"
          color="#2E4B36"
          @click="goBack"
        ></v-btn>
      </div>

      <p class="text-body-2 mb-6 px-1" style="color: #7B5B3E">
        Ajoutez un nouvel aliment ou équipement à votre sellerie pour commencer le suivi.
      </p>

      <ProductForm
        v-model="form"
        :loading="isSubmitting"
        submit-label="Créer le produit"
        show-cancel
        @submit="createProduct"
        @cancel="goBack"
      />

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { productApi } from '@/api/product.js';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHorsesStore } from '@/stores/HorsesStore';
import type { CreateProductDto } from "@/types";
import { useRouter } from 'vue-router';
import ProductForm from "@/views/products/ProductForm.vue";

const router = useRouter()
const isSubmitting = ref(false);
const form = ref<CreateProductDto>({
    name: '',
    category: 'Autres'
});

const { horseId } = storeToRefs(useHorsesStore())

const createProduct = async () => {
  if (!form.value.name || !form.value.category) return;

  const payload: CreateProductDto = {
    name: form.value.name,
    category: form.value.category,
    brand: form.value.brand ?? "",
    note: form.value.note ?? "",
    purchase_date: form.value.purchase_date,
    quantity_purchased: form.value.quantity_purchased,
    daily_usage: form.value.daily_usage,
    unit: form.value.unit,
  };

  await productApi.create(payload);
  goBack();
};

const goBack = () => {
    if (horseId) {
        router.push({ name: "Products", params: { id: String(horseId) } });
        return;
    }
    router.push("/horses");
};
</script>
