<template>
    <div>
        <v-row v-if="horses.length" class="mt-2" dense>
            <v-col
                v-for="horse in horses"
                :key="horse.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="d-flex"
            >
                <v-card
                    class="d-flex flex-column w-100 pa-3"
                    variant="outlined"
                    :height="cardHeight"
                    :style="{ maxWidth: cardMaxWidth }"
                >
                    <div class="d-flex align-center justify-space-between mb-3">
                        <div class="text-h6">{{ horse.name }}</div>
                        <ActionButtons
                            mode="auto"
                            button-size="x-small"
                            menu-button-size="x-small"
                            :actions="getHorseActions(horse)"
                        />
                    </div>
                    <v-card-text
                        class="pa-0"
                        @click="onOpenDashboard(horse.id)"
                    >
                        <div
                            class="d-flex align-start justify-space-between ga-3"
                        >
                            <div class="flex-grow-1 text-truncate">
                                <div class="text-body-2 text-grey-darken-1">
                                    <v-chip v-if="horse.breed" size="small" variant="outlined" class="mr-1">{{
                                        horse.breed
                                    }}</v-chip>
                                    <v-chip v-if="horse.age" size="small" variant="outlined"
                                        >{{ horse.age }} ans</v-chip
                                    >
                                </div>
                                <div
                                    v-if="horse.additional_info"
                                    class="text-caption text-grey-darken-1 mt-2"
                                >
                                    {{ horse.additional_info }}
                                </div>
                            </div>
                            <v-img
                                :src="getPhotoUrl(horse)"
                                :alt="horse.name"
                                :width="photoWidth"
                                :height="photoHeight"
                                class="rounded-lg"
                                cover
                            />
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <p v-else class="empty-state">Aucun cheval enregistré</p>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "../../components";
import type { Horse } from "../../types";

type HorseAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

defineProps<{
    horses: Horse[];
    cardHeight: number;
    cardMaxWidth: string;
    photoWidth: number;
    photoHeight: number;
    getPhotoUrl: (horse: Horse) => string;
    getHorseActions: (horse: Horse) => HorseAction[];
    onOpenDashboard: (horseId: string) => void;
}>();
</script>

