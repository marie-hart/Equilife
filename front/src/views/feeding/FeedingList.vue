<template>
    <div>
        <div class="text-subtitle-1 mb-2">Rations</div>
        <div class="pt-2">
            <v-row v-if="rations.length" dense class="ga-4">
                <v-col
                    v-for="ration in rations"
                    :key="ration.id"
                    cols="12"
                    md="6"
                    lg="4"
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
            <p v-else class="empty-state">Aucune ration pour le moment.</p>
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
