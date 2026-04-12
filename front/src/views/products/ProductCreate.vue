<template>
  <v-sheet 
    color="#EDE4D8" 
    min-height="100vh" 
    class="pb-10"
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

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-4"
      >
        {{ formError }}
      </v-alert>

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { productApi } from '@/api/product.js';
import { logger } from '@/services/LoggerService';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHorsesStore } from '@/stores/HorsesStore';
import type { CreateProductDto } from "@/types";
import { useRouter } from 'vue-router';
import ProductForm from "@/views/products/ProductForm.vue";

const router = useRouter()
const isSubmitting = ref(false);
const formError = ref("");
const form = ref<CreateProductDto>({
    name: '',
    category: 'Autres',
    horse_id: '',
});

const horsesStore = useHorsesStore();
const { horseId } = storeToRefs(horsesStore);

const createProduct = async () => {
  if (!form.value.name || !form.value.category) return;

  isSubmitting.value = true;
  formError.value = "";
  try {
    if (horsesStore.horses.length === 0) {
      await horsesStore.loadHorses();
    }
    const resolvedHorseId =
      horseId.value && horseId.value !== "all"
        ? horseId.value
        : horsesStore.horses[0]?.id || null;
    if (!resolvedHorseId) {
      throw new Error("Aucun cheval disponible pour associer ce produit.");
    }

    const payload: any = {
      ...form.value, // <--- FIX : On récupère TOUT (quantité, conso, unité, etc.)
      description: null,
      brand: form.value.brand || null,
      note: form.value.note || null,
      // La date est déjà au bon format grâce à notre fix précédent
      last_purchase_date: form.value.last_purchase_date || null,
      horse_id: resolvedHorseId,
      needs_repurchase: false
    };

    await productApi.create(payload);
    horsesStore.sethorseId(resolvedHorseId);
    goBack();
  } catch (error: any) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      "Création impossible.";
    logger.error("Erreur serveur :", error?.response?.data || error);
    formError.value = msg;
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push(horseId.value && horseId.value !== "all" ? { name: "Products" } : { name: "Horses" });
};
</script>
