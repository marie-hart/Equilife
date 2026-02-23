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
    category: 'Autres',
    horse_id: '',
});

const { horseId } = storeToRefs(useHorsesStore())

const createProduct = async () => {
  if (!form.value.name || !form.value.category) return;

  isSubmitting.value = true;
  try {
    const payload: any = {
      name: form.value.name,
      description: null, // Attendu par le repo
      category: form.value.category,
      brand: form.value.brand || null,
      note: form.value.note || null,
      last_purchase_date: form.value.last_purchase_date ? new Date(form.value.last_purchase_date).toISOString() : null,
      purchase_interval_months: (form.value as any).purchase_interval_months || null,
      purchase_interval_years: null, // Attendu par le repo
      estimated_cost: null, // Attendu par le repo
      horse_id: horseId.value !== 'all' ? horseId.value : null,
      needs_repurchase: false
    };

    console.log("Payload envoyé :", payload);
    await productApi.create(payload);
    goBack();
  } catch (error: any) {
    console.error("Erreur serveur :", error.response?.data);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  if (horseId.value && horseId.value !== 'all') {
    router.push({ name: "Products", query: { horseId: String(horseId.value) } });
    return;
  }
  router.push("/horses");
};
</script>
