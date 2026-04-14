<template>
  <div class="pt-2">
    <v-row v-if="rations.length" dense>
      <v-col v-for="ration in rations" :key="ration.id" cols="12" md="6" lg="4" class="mb-4">
        <RationCard
          :ref="(el) => (cardRefs[ration.id] = el)"
          :ration="ration"
          :horse-name="getHorseName(ration.horse_id)"
          :get-product-name="getProductName"
          :item-type-label="itemTypeLabel"
          :get-ration-actions="getRationActions"
          @details="$emit('details', $event)"
          @delete="$emit('delete', $event)"
        />
      </v-col>
    </v-row>
    <div v-else class="text-center py-12">
      <v-icon size="64" color="#D1C7BC" class="mb-4">mdi-silverware-variant</v-icon>
      <p style="color: #A89F94; font-style: italic;">Aucune ration enregistrée.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import RationCard from "@/views/feeding/RationCard.vue";
import type { Ration } from "@/types";

const props = defineProps<{
    rations: Ration[];
    getHorseName: (horseId?: string) => string;
    getProductName: (productId?: string) => string | undefined;
    itemTypeLabel: (value?: string) => string;
}>();

const emit = defineEmits(["details", "edit", "share", "delete"]);
const cardRefs = ref<Record<string, any>>({});

const getRationActions = (ration: Ration) => [
    {
        key: "view",
        title: "Détails",
        icon: "mdi-eye",
        onClick: () => emit("details", ration),
    },
    {
        key: "share",
        title: "Partager",
        icon: "mdi-share-variant",
        onClick: () => emit("share", ration),
    },
    {
        key: "edit",
        title: "Modifier",
        icon: "mdi-pencil",
        onClick: () => emit("edit", ration),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        onClick: () => cardRefs.value[ration.id]?.openDelete(),
    },
];
</script>