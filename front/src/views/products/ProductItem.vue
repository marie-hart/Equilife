<script lang="ts">
export default { name: "ProductItem" };
</script>

<template>
  <v-list-item
    class="py-2"
    :to="{ name: 'ProductDetails', params: { id: product.id } }"
  >
    <template v-slot:prepend>
      <v-avatar color="#EDE4D8" size="40" rounded="lg">
        <v-icon :icon="categoryIcon" color="#2E4B36"></v-icon>
      </v-avatar>
    </template>

    <v-list-item-title class="font-weight-bold" style="color: #2E4B36">
      {{ product.name }}
    </v-list-item-title>
    
    <v-list-item-subtitle style="color: #7B5B3E">
      {{ product.category }}
    </v-list-item-subtitle>

    <template v-slot:append>
      <div class="d-flex align-center">
        <v-chip :color="chipColor" size="small" variant="flat" class="me-2">
          {{ chipLabel }}
        </v-chip>
        <v-icon icon="mdi-chevron-right" color="#A89F94" size="small" />
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types";

const props = defineProps<{ product: Product }>();

const STOCK_TYPES = ["Granulés", "Complément"];

const asPositiveNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const hasStockTrackingData = computed(
  () =>
    Boolean(props.product.last_purchase_date) &&
    asPositiveNumber(props.product.quantity_purchased) !== null &&
    asPositiveNumber(props.product.daily_usage) !== null
);

const isStockManaged = computed(
  () =>
    STOCK_TYPES.includes(props.product.category || "") &&
    hasStockTrackingData.value
);

const endDate = computed(() => {
  if (!isStockManaged.value) return null;
  if (!props.product.last_purchase_date || !props.product.quantity_purchased || !props.product.daily_usage) return null;

  const start = new Date(props.product.last_purchase_date);
  const totalDays = props.product.quantity_purchased / props.product.daily_usage;

  const end = new Date(start);
  end.setDate(start.getDate() + totalDays);

  return end;
});

const status = computed(() => {
  if (!isStockManaged.value) return "manual";
  if (!endDate.value) return "ok";

  const today = new Date();
  const lowDate = new Date(endDate.value);
  lowDate.setDate(endDate.value.getDate() - 14);

  if (today >= endDate.value) return "rupture";
  if (today >= lowDate) return "low";
  return "ok";
});

const categoryIcon = computed(() => {
  const map: Record<string, string> = {
    'Granulés': 'mdi-grain',
    'Complément': 'mdi-pill',
    'Friandises': 'mdi-apple',
    'Équipement': 'mdi-toolbox-outline',
    'Pharmacie': 'mdi-medical-bag',
    'Autres': 'mdi-package-variant'
  };
  return map[props.product.category] || 'mdi-help-circle-outline';
});

const remainingDays = computed(() => {
  if (!endDate.value) return null;
  const diff = Math.ceil(
    (endDate.value.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
});

const chipLabel = computed(() => {
  if (!isStockManaged.value) return "Suivi manuel";
  if (status.value === "rupture") return "Rupture";
  if (status.value === "low") return "Stock bas";
  return "En stock";
});

const chipColor = computed(() => {
  if (!isStockManaged.value) return "grey";
  if (status.value === "rupture") return "red";
  if (status.value === "low") return "orange";
  return "green";
});
</script>