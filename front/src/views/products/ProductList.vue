<template>
    <div :style="{ color: '#554338' }">
        <div class="text-h6 font-weight-bold mb-4" :style="{ color: '#3c3226' }">
            Liste des produits
        </div>
        
        <div class="pt-2">
            <v-list
                v-if="products.length"
                density="comfortable"
                class="bg-transparent d-flex flex-column ga-2"
            >
                <v-list-item
                    v-for="product in products"
                    :key="product.id"
                    class="rounded-lg mb-2"
                    :style="{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #efe5d9',
                        boxShadow: 'none'
                    }"
                >
                    <v-row class="w-100 align-center" dense>
                        <v-col cols="auto" class="pa-0">
                            <v-checkbox
                                v-model="product.needs_repurchase"
                                density="compact"
                                hide-details
                                color="primary"
                                @update:model-value="toggleRepurchase(product)"
                                class="ma-0 pa-0"
                            />
                        </v-col>
                        
                        <v-col class="pa-2">
                            <div class="text-subtitle-1 font-weight-medium" :style="{ color: '#3c3226' }">
                                {{ product.name }}
                            </div>
                            
                            <div class="text-caption text-grey-darken-2 d-flex flex-wrap align-center ga-1">
                                <v-chip v-if="product.category" size="x-small" variant="tonal" color="brown-darken-2">
                                    {{ product.category }}
                                </v-chip>
                                
                                <span v-if="product.brand" class="text-grey-darken-1">
                                    • {{ product.brand }}
                                </span>
                                
                                <span v-if="product.used_for_horses?.length" class="text-grey-darken-1">
                                    • {{ product.used_for_horses.map(getHorseName).filter(Boolean).join(", ") }}
                                </span>
                                
                                <span v-if="recurrenceLabel(product)" class="text-primary font-weight-medium">
                                    • {{ recurrenceLabel(product) }}
                                </span>
                            </div>
                        </v-col>
                        
                        <v-col cols="auto" class="text-right pa-0">
                            <ActionButtons
                                class="d-none d-md-flex align-center ga-1"
                                mode="inline"
                                button-size="small"
                                :actions="getProductActions(product)"
                            />
                            <ActionButtons
                                class="d-md-none"
                                mode="auto"
                                button-size="small"
                                menu-button-size="small"
                                :actions="getProductActions(product)"
                            />
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
            
            <p v-else class="empty-state text-center text-grey-darken-1 pa-4">
                Aucun produit pour le moment.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import type { Product } from "@/types";
import { ProductAction } from '../../types/product';

defineProps<{
    products: Product[];
    getHorseName: (horseId?: string) => string | undefined;
    recurrenceLabel: (product: Product) => string;
    getProductActions: (product: Product) => ProductAction[];
    toggleRepurchase: (product: Product) => void;
}>();
</script>
