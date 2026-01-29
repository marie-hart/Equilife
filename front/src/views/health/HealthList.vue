<template>
    <div>
        <div class="text-subtitle-1 mb-2">Liste des soins</div>
        <div class="pt-2">
            <v-list
                v-if="items.length"
                density="compact"
                class="d-flex flex-column ga-2"
            >
                <v-list-item
                    v-for="care in items"
                    :key="care.id"
                    class="rounded-lg bg-grey-lighten-4"
                >
                    <v-row class="w-100 align-center" dense>
                        <v-col
                            cols="4"
                            class="text-caption text-grey-darken-1 d-md-none"
                        >
                            {{ formatDateMobile(care.event_date) }}
                        </v-col>
                        <v-col cols="6" class="d-md-none">
                            <div class="text-subtitle-2">{{ care.name }}</div>
                            <div class="text-body-2 text-grey-darken-1">
                                {{ getHorseName(care) }}
                            </div>
                            <div
                                class="text-caption text-grey-darken-1"
                                v-if="recurrenceLabel(care) !== '-'"
                            >
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

                        <v-col
                            cols="2"
                            class="text-caption text-grey-darken-1 d-none d-md-block"
                        >
                            {{ formatDate(care.event_date) }}
                        </v-col>
                        <v-col
                            cols="4"
                            class="text-subtitle-2 d-none d-md-block"
                        >
                            {{ care.name }}
                        </v-col>
                        <v-col
                            cols="2"
                            class="text-body-2 text-grey-darken-1 d-none d-md-block"
                        >
                            {{ getHorseName(care) }}
                        </v-col>
                        <v-col
                            cols="2"
                            class="text-body-2 text-grey-darken-1 d-none d-md-block"
                        >
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
                </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun soin pour le moment.</p>
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
