<template>
    <ProductForm
        v-model="form"
        :loading="isSubmitting"
        submit-label="Créer"
        show-cancel
        @submit="createProduct"
        @cancel="goBack"
    />
</template>

<script setup lang="ts">
import { productApi } from '@/api/product.js';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHorsesStore } from '@/stores/HorsesStore';
import type { CreateProductDto } from "@/types";
import { useRouter } from 'vue-router';

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
