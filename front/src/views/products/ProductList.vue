<template>
    <div>
        <div class="text-subtitle-1 mb-2">Liste des produits</div>
        <div class="pt-2">
            <v-list
                v-if="materials.length"
                density="compact"
                class="d-flex flex-column ga-2"
            >
                <v-list-item
                    v-for="material in materials"
                    :key="material.id"
                    class="rounded-lg bg-grey-lighten-4"
                >
                    <v-row class="w-100 align-center" dense>
                        <v-col cols="auto">
                            <v-checkbox
                                v-model="material.needs_repurchase"
                                density="compact"
                                hide-details
                                @update:model-value="toggleRepurchase(material)"
                            />
                        </v-col>
                        <v-col>
                            <div class="text-subtitle-2">
                                {{ material.name }}
                            </div>
                            <div class="text-body-2 text-grey-darken-1">
                                <span v-if="material.category">{{
                                    material.category
                                }}</span>
                                <span v-if="material.brand"
                                    >• {{ material.brand }}</span
                                >
                                <span v-if="material.used_for_horses?.length">
                                    •
                                    {{
                                        material.used_for_horses
                                            .map(getHorseName)
                                            .filter(Boolean)
                                            .join(", ")
                                    }}
                                </span>
                                <span v-if="recurrenceLabel(material)"
                                    >• {{ recurrenceLabel(material) }}</span
                                >
                            </div>
                        </v-col>
                        <v-col cols="auto" class="text-right">
                            <ActionButtons
                                class="d-none d-md-flex align-center ga-2"
                                mode="inline"
                                button-size="x-small"
                                :actions="getMaterialActions(material)"
                            />
                            <ActionButtons
                                class="d-md-none"
                                mode="auto"
                                button-size="x-small"
                                menu-button-size="x-small"
                                :actions="getMaterialActions(material)"
                            />
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun produit pour le moment.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import type { Material } from "@/types";

type MaterialAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

defineProps<{
    materials: Material[];
    getHorseName: (horseId?: string) => string | undefined;
    recurrenceLabel: (material: Material) => string;
    getMaterialActions: (material: Material) => MaterialAction[];
    toggleRepurchase: (material: Material) => void;
}>();
</script>
