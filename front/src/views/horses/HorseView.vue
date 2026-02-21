<script setup lang="ts">
import { ref } from "vue";
import { useHorsesStore } from "@/stores/HorsesStore"; 
import { HorseList } from ".";

const { loadHorses } = useHorsesStore();

const isLoading = ref(true);
const loadingFailed = ref(false); // à implémenter

async function loadHorseData() {
    isLoading.value = true
    loadingFailed.value = false

    try {
        await loadHorses()
    } catch (error) {
        loadingFailed.value = true
    } finally {
        isLoading.value = false
    }
}

loadHorseData()
</script>

<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <v-card-title class="text-h6 mb-2 font-weight-bold" :style="{ color: '#6B4F3A' }">
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

        <HorseList v-else />
        </v-container>
</template>