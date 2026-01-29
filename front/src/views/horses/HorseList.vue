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
                    class="overflow-hidden d-flex flex-column w-100"
                    variant="outlined"
                    :height="cardHeight"
                    :style="{ maxWidth: cardMaxWidth }"
                >
                    <v-card-title
                        class="bg-primary text-white text-subtitle-1 d-flex align-center justify-space-between"
                    >
                        <span>{{ horse.name }}</span>
                        <ActionButtons
                            class="d-md-none"
                            mode="auto"
                            button-size="x-small"
                            menu-button-size="x-small"
                            :actions="getHorseActions(horse)"
                        />
                    </v-card-title>
                    <v-card-text
                        class="pt-2 pb-2"
                        @click="onOpenDashboard(horse.id)"
                    >
                        <div
                            class="d-flex align-start justify-space-between ga-3"
                        >
                            <div class="flex-grow-1 text-truncate">
                                <div class="text-body-2 text-grey-darken-1">
                                    <span v-if="horse.breed">{{
                                        horse.breed
                                    }}</span>
                                    <span v-if="horse.age"
                                        >• {{ horse.age }} ans</span
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
                    <v-card-actions class="justify-end mt-auto">
                        <ActionButtons
                            class="d-none d-md-flex align-center ga-2"
                            mode="inline"
                            button-size="x-small"
                            :actions="getHorseActions(horse)"
                        />
                    </v-card-actions>
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
