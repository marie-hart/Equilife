<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";
import { useHorsesStore } from "@/stores/HorsesStore";
import { HorseList } from "./";

const horsesStore = useHorsesStore();
const isLoading = ref(true);
const { xs } = useDisplay();

const cardHeight = computed(() => (xs.value ? 200 : 230));
const cardMaxWidth = "100%";
const photoWidth = computed(() => (xs.value ? 120 : 140));
const photoHeight = computed(() => (xs.value ? 90 : 110));


const loadHorses = async () => {
    await horsesStore.loadHorses();
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
            :horses="horsesStore.horses"
            :card-height="cardHeight"
            :card-max-width="cardMaxWidth"
            :photo-width="photoWidth"
            :photo-height="photoHeight"
            @deleted="loadHorses"
        />
        </v-container>
</template>