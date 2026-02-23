<template>
  <div class="pt-2">
    <v-row v-if="rations.length" dense>
      <v-col
        v-for="ration in rations"
        :key="ration.id"
        cols="12"
        md="6"
        lg="4"
        class="mb-4"
      >
        <RationCard
          :ration="ration"
          :horse-name="getHorseName(ration.horse_id)"
          :get-product-name="getProductName"
          :item-type-label="itemTypeLabel"
          @edit="$emit('edit', ration)"
          @share="$emit('share', ration)"
          @delete="$emit('delete', ration)"
        />
      </v-col>
    </v-row>
    
    <div v-else class="text-center py-12">
      <v-icon size="64" color="#D1C7BC" class="mb-4">mdi-silverware-variant</v-icon>
      <p style="color: #A89F94; font-style: italic;">Aucune ration enregistrée pour le moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import RationCard  from "@/views/feeding/RationCard.vue";
import type { Ration } from "@/types";

defineProps<{
    rations: Ration[];
    getHorseName: (horseId?: string) => string;
    getProductName: (productId?: string) => string | undefined;
    itemTypeLabel: (value?: string) => string;
}>();

defineEmits(["edit", "share", "delete"]);
</script>
