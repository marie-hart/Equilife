<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { horsesApi } from "@/api/horses";
import type { Horse } from "@/types";
import { HorseList } from "./";

const horses = ref<Horse[]>([]);
const isLoading = ref(true);

const { xs } = useDisplay();

const cardHeight = computed(() => (xs.value ? 200 : 230));
const cardMaxWidth = "100%";
const photoWidth = computed(() => (xs.value ? 120 : 140));
const photoHeight = computed(() => (xs.value ? 90 : 110));


const loadHorses = async () => {
    isLoading.value = true;
    try {
        horses.value = await horsesApi.getAll();
    } catch (error) {
        console.error("Error loading horses:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadHorses);
</script>

<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <v-card-title class="text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                Fiches chevaux
            </v-card-title>

            <v-btn
                class="text-none"
                variant="flat"
                rounded="lg"
                :to="{ name: 'HorseCreate' }"
                :style="{ backgroundColor: '#554338', color: 'white' }"
            >
                <v-icon start icon="mdi-plus" />
                Ajouter
            </v-btn>
        </div>

        <v-skeleton-loader
            v-if="isLoading"
            type="image, image, image"
        />

        <HorseList
            v-else
            :horses="horses"
            :card-height="cardHeight"
            :card-max-width="cardMaxWidth"
            :photo-width="photoWidth"
            :photo-height="photoHeight"
            @deleted="loadHorses"
        />

        </v-container>
</template>