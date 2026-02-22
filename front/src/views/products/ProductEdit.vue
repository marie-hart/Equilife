<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="safe-area-top">
    <v-container class="px-4 py-2">
      <div class="mb-6">
        <h1 class="text-h4 font-weight-black mb-0" :style="{ color: '#2E4B36', fontFamily: 'Playfair Display, serif' }">
          Modifier
        </h1>
        <div :style="{ width: '30px', height: '3px', backgroundColor: '#7B5B3E', borderRadius: '2px' }"></div>
      </div>

      <ProductForm
        v-model="form"
        :loading="isSubmitting"
        submit-label="Enregistrer les modifs"
        show-cancel
        @submit="updateProduct"
        @cancel="goBack"
      />
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productApi } from "@/api/product";
import type { Product } from "@/types";
import ProductForm from "@/views/products/ProductForm.vue";

const route = useRoute();
const router = useRouter();
const isSubmitting = ref(false);

const form = ref<Partial<Product>>({});

const loadProduct = async () => {
  const id = route.params.id as string;
  form.value = await productApi.getById(id);
};

const updateProduct = async () => {
  const id = route.params.id as string;
  await productApi.update(id, form.value);
  goBack();
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    loadProduct();
});
</script>
