<template>
  <div>

    <!-- SECTION STOCKS À SURVEILLER -->
    <div v-if="criticalProducts.length" class="mb-6">
      <div class="text-h6 font-weight-bold mb-3">
        Stocks à surveiller
      </div>

      <ProductItem
        v-for="product in criticalProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- SECTION CATALOGUE -->
    <div>
      <div class="text-h6 font-weight-bold mb-3">
        Catalogue
      </div>

      <ProductItem
        v-for="product in normalProducts"
        :key="product.id"
        :product="product"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types";
import ProductItem from "./ProductItem.vue";

const props = defineProps<{
  products: Product[];
}>();

const STOCK_TYPES = ["Granulés", "Complément"];

const isStockManaged = (product: Product) =>
  STOCK_TYPES.includes(product.category || "");

const getEndDate = (product: Product): Date | null => {
  if (!isStockManaged(product)) return null;
  if (!product.purchase_date || !product.quantity_purchased || !product.daily_usage) return null;

  const start = new Date(product.purchase_date);
  const totalDays = product.quantity_purchased / product.daily_usage;

  const end = new Date(start);
  end.setDate(start.getDate() + totalDays);

  return end;
};

const getStockStatus = (product: Product): "rupture" | "low" | "ok" | "manual" => {
  if (!isStockManaged(product)) return "manual";

  const endDate = getEndDate(product);
  if (!endDate) return "ok";

  const today = new Date();
  const lowDate = new Date(endDate);
  lowDate.setDate(endDate.getDate() - 14);

  if (today >= endDate) return "rupture";
  if (today >= lowDate) return "low";
  return "ok";
};

const sortedProducts = computed(() => {
  return [...props.products].sort((a, b) => {
    const order = {
      rupture: 0,
      low: 1,
      ok: 2,
      manual: 3,
    };

    return order[getStockStatus(a)] - order[getStockStatus(b)];
  });
});

const criticalProducts = computed(() =>
  sortedProducts.value.filter(p => {
    const status = getStockStatus(p);
    return status === "rupture" || status === "low";
  })
);

const normalProducts = computed(() =>
  sortedProducts.value.filter(p => {
    const status = getStockStatus(p);
    return status === "ok" || status === "manual";
  })
);
</script>