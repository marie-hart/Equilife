<template>
  <v-card
    class="mb-3"
    rounded="xl"
    :to="{ name: 'ProductEdit', params: { id: product.id } }"
    link
    :style="{
      backgroundColor: '#ffffff',
      border: '1px solid #efe5d9'
    }"
  >
    <v-card-text>
      <div class="d-flex align-center justify-space-between">

        <div class="flex-grow-1">

          <div class="d-flex align-center justify-space-between">

            <!-- NOM -->
            <div class="text-subtitle-1 font-weight-medium">
              {{ product.name }}
            </div>

            <!-- CHIP -->
            <v-chip
              :color="chipColor"
              size="small"
              variant="flat"
            >
              {{ chipLabel }}
            </v-chip>

          </div>

          <!-- TYPE -->
          <div class="text-caption text-grey-darken-1 mt-1">
            {{ product.category }}
          </div>

          <!-- AUTONOMIE -->
          <div
            v-if="remainingDays !== null"
            class="text-caption mt-1"
            :class="{
              'text-red': status === 'rupture',
              'text-orange': status === 'low'
            }"
          >
            {{ remainingDays }} jours restants
          </div>

        </div>

        <!-- CHEVRON -->
        <v-icon icon="mdi-chevron-right" class="ms-3" />

      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types";

const props = defineProps<{ product: Product }>();

const STOCK_TYPES = ["Granulés", "Complément"];

const isStockManaged = computed(() =>
  STOCK_TYPES.includes(props.product.category || "")
);

const endDate = computed(() => {
  if (!isStockManaged.value) return null;
  if (!props.product.purchase_date || !props.product.quantity_purchased || !props.product.daily_usage) return null;

  const start = new Date(props.product.purchase_date);
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