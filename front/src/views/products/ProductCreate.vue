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
import { materialsApi } from '@/api/materials';
import { Product } from '@/types/product';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHorsesStore } from '@/stores/HorsesStore';
import { useRouter } from 'vue-router';

const router = useRouter()
const isSubmitting = ref(false);
const form = ref<Partial<Product>>({});

const { horseId } = storeToRefs(useHorsesStore())

const createProduct = async () => {
  await materialsApi.create(form.value);
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
