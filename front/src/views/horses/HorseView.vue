<script setup lang="ts">
import { ref } from "vue";
import { useHorsesStore } from "@/stores/HorsesStore"; 
import { HorseList } from ".";

const { loadHorses } = useHorsesStore();

const isLoading = ref(true);
const loadingFailed = ref(false); 

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
    <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
        <v-container>
            <div class="d-flex align-center justify-space-between mb-8 mt-2 px-2">
                <div>
                    <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                        Mes Chevaux
                    </h1>
                    <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
                </div>
            </div>

             <v-btn 
                block 
                color="#2E4B36"
                size="large" 
                rounded="pill" 
                class="mb-6 text-none font-weight-bold" 
                prepend-icon="mdi-plus"
                elevation="1"
                :to="{ name: 'HorseCreate' }"
                >
                Ajouter un cheval
            </v-btn>

            <v-skeleton-loader
                v-if="isLoading"
                type="card, card"
                bg-color="transparent"
            />

            <div v-else-if="loadingFailed" class="text-center py-10">
                <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
                <p class="mt-4">Erreur de chargement. Veuillez réessayer.</p>
                <v-btn variant="text" color="#2E4B36" @click="loadHorseData">Actualiser</v-btn>
            </div>

            <HorseList v-else />
        </v-container>
    </v-sheet>
</template>