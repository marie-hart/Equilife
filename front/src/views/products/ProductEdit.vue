<template>
    <ProductForm
        v-model="form"
        :loading="isSubmitting"
        submit-label="Enregistrer"
        show-cancel
        @submit="updateProduct"
        @cancel="goBack"
    />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productApi } from "@/api/product";
import type { Product } from "@/types";

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
