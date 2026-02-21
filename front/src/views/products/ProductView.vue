<template>
  <v-container class="py-6">

    <v-card rounded="xl" class="pa-6">

      <div class="d-flex justify-space-between align-center">

        <div>
          <div class="text-h5 font-weight-bold">
            {{ product?.name }}
          </div>

          <div class="text-caption text-grey-darken-1">
            {{ product?.category }}
          </div>
        </div>

        <v-chip
          :color="chipColor"
          size="small"
          variant="flat"
        >
          {{ chipLabel }}
        </v-chip>

      </div>

      <v-divider class="my-4" />

      <!-- STOCK SECTION -->
      <template v-if="isManaged">

        <div class="text-subtitle-1 font-weight-medium mb-2">
          Gestion du stock
        </div>

        <div class="mb-2">
          Date réception : {{ product?.purchase_date }}
        </div>

        <div class="mb-2">
          Quantité achetée :
          {{ product?.quantity_purchased }} {{ product?.unit }}
        </div>

        <div class="mb-2">
          Consommation / jour :
          {{ product?.daily_usage }} {{ product?.unit }}
        </div>

        <div
          v-if="remainingDays !== null"
          class="mt-3"
        >
          <strong>{{ remainingDays }} jours restants</strong><br />
          Fin estimée : {{ endDateFormatted }}
        </div>

      </template>

      <v-divider class="my-4" />

      <!-- NOTE -->
      <div v-if="product?.note">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Notes
        </div>
        <div>{{ product.note }}</div>
      </div>

      <div class="d-flex justify-end mt-6">
        <v-btn
          :to="{ name: 'ProductEdit', params: { id: product?.id } }"
          variant="flat"
          color="primary"
          rounded="lg"
        >
          Modifier
        </v-btn>
      </div>

    </v-card>

  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Product } from "@/types";
import {
  getRemainingDays,
  getStockStatus,
  getEndDate,
  isStockManaged
} from "@/utils/productStock";
import { productApi } from "@/api/product";
import { useNotificationStore } from '@/stores/NotificationStore';


const store = useNotificationStore();
const route = useRoute();
const product = ref<Product | null>(null);

const isManaged = computed(() =>
  product.value ? isStockManaged(product.value) : false
);

const remainingDays = computed(() =>
  product.value ? getRemainingDays(product.value) : null
);

const status = computed(() =>
  product.value ? getStockStatus(product.value) : "manual"
);

const chipLabel = computed(() => {
  if (status.value === "rupture") return "Rupture";
  if (status.value === "low") return "Stock bas";
  if (status.value === "ok") return "En stock";
  return "Suivi manuel";
});

const chipColor = computed(() => {
  if (status.value === "rupture") return "red";
  if (status.value === "low") return "orange";
  if (status.value === "ok") return "green";
  return "grey";
});

const endDateFormatted = computed(() => {
  if (!product.value) return "";
  const end = getEndDate(product.value);
  if (!end) return "";

  return end.toLocaleDateString("fr-FR");
});

onMounted(async () => {
  const id = route.params.id as string;
  product.value = await productApi.getById(id);
  store.markStockAsRead(id);
});
</script>