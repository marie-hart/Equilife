<template>
    <div>
        <div class="text-subtitle-1 mb-2 font-weight-bold" :style="{ color: '#554338' }">Liste des soins</div>
        <div class="pt-2">
            <div v-if="items.length" class="d-flex flex-column ga-2">
                <v-card
                    v-for="care in items"
                    :key="care.id"
                    variant="tonal"
                    rounded="lg"
                    flat
                    class="pa-3"
                    :style="{
                        backgroundColor: '#fdfaf6',
                        color: '#554338',
                        border: 'none'
                    }"
                >
                    <v-row class="w-100 align-center" dense>
                        <v-col cols="4" class="text-caption d-md-none" :style="{ color: '#7a6e61' }">
                            {{ formatDateMobile(care.event_date) }}
                        </v-col>
                        <v-col cols="6" class="d-md-none">
                            <div class="text-subtitle-2 font-weight-medium">{{ care.name }}</div>
                            <div class="text-body-2" :style="{ color: '#7a6e61' }">
                                {{ getHorseName(care) }}
                            </div>
                            <div class="text-caption" v-if="recurrenceLabel(care) !== '-'" :style="{ color: '#7a6e61' }">
                                {{ recurrenceLabel(care) }}
                            </div>
                        </v-col>
                        <v-col cols="2" class="d-md-none text-right">
                            <ActionButtons
                                mode="auto"
                                button-size="x-small"
                                menu-button-size="x-small"
                                :actions="getCareActions(care)"
                            />
                        </v-col>

                        <v-col cols="2" class="text-caption d-none d-md-block" :style="{ color: '#7a6e61' }">
                            {{ formatDate(care.event_date) }}
                        </v-col>
                        <v-col cols="3" class="text-subtitle-2 font-weight-medium d-none d-md-block">
                            {{ care.name }}
                        </v-col>
                        <v-col cols="3" class="text-body-2 d-none d-md-block" :style="{ color: '#7a6e61' }">
                            {{ getHorseName(care) }}
                        </v-col>
                        <v-col cols="2" class="text-body-2 d-none d-md-block" :style="{ color: '#7a6e61' }">
                            {{ recurrenceLabel(care) }}
                        </v-col>
                        <v-col cols="2" class="text-right d-none d-md-block">
                            <ActionButtons
                                class="d-flex justify-end ga-2"
                                mode="inline"
                                button-size="x-small"
                                :actions="getCareActions(care)"
                            />
                        </v-col>
                    </v-row>
                </v-card>
            </div>
            <p v-else class="empty-state text-center py-4" :style="{ color: '#7a6e61' }">Aucun soin pour le moment.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import type { Event } from "@/types";

type CareAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

defineProps<{
    items: Event[];
    formatDate: (dateString: string) => string;
    formatDateMobile: (dateString: string) => string;
    getHorseName: (care: Event) => string;
    recurrenceLabel: (care: Event) => string;
    getCareActions: (care: Event) => CareAction[];
}>();
</script>