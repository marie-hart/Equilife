<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div
                class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4 mb-6"
            >
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Détails du cheval
                </v-card-title>
                
                <div class="d-flex justify-space-between ga-2 w-100">
                    <v-btn 
                        variant="outlined" 
                        :to="{ name: 'Horses' }"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        <v-icon start icon="mdi-arrow-left" />
                        Retour
                    </v-btn>
                    
                    <v-btn 
                        color="primary" 
                        variant="flat" 
                        :to="{ name: 'HorseEdit', params: { id: horse?.id } }"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: 'white',  backgroundColor: '#554338',  }"
                    >
                        <v-icon start icon="mdi-pencil" />
                        Modifier
                    </v-btn>
                </div>
            </div>

            <v-card 
                class="pa-2" 
                variant="flat" 
                rounded="lg"
                :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
            >
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="list-item-two-line, list-item-two-line, image"
                    />
                    <div v-else-if="horse">
                        <v-row dense class="ga-4">
                            <v-col cols="12" md="7">
                                <v-list density="comfortable" bg-color="transparent">
                                    <v-list-item v-for="(item, i) in horseInfo" :key="i">
                                        <v-list-item-title class="font-weight-bold text-caption" :style="{ color: '#7a6e61' }">
                                            {{ item.title }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-body-1 font-weight-medium" :style="{ color: '#3c3226' }">
                                            {{ item.value }}
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-col>
                            
                            <v-col cols="12" md="4" class="d-flex justify-center align-start">
                                <v-img
                                    :src="getPhotoUrl(horse)"
                                    :alt="horse.name"
                                    max-width="300"
                                    height="300"
                                    cover
                                    class="rounded-xl elevation-2"
                                />
                            </v-col>
                        </v-row>
                    </div>
                    <p v-else class="empty-state text-center py-4" :style="{ color: '#7a6e61' }">Cheval introuvable.</p>
                </v-card-text>
            </v-card>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                timeout="2500"
            >
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useHorsesStore } from "@/stores/HorsesStore";
import type { Horse } from "../../types";

const route = useRoute();
const horsesStore = useHorsesStore(); // Initialisation du Store
const horse = ref<Horse | null>(null);
const isLoading = ref(true);
const snackbar = ref({
    show: false,
    message: "",
    color: "error",
});

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const getPhotoUrl = (horseData: Horse): string => {
    if (!horseData.photo_path) return "/avatar.jpg";
    return horseData.photo_path; 
};

const horseInfo = computed(() => {
    if (!horse.value) return [];
    const h = horse.value;
    return [
        { title: "Nom", value: h.name },
        { title: "Surnom", value: h.nickname || "-" },
        { title: "Sexe", value: h.sex || "-" },
        { title: "Date de naissance", value: h.birth_date ? `${formatDate(h.birth_date)} (${h.age} ans)` : "-" },
        { title: "Race", value: h.breed || "-" },
        { title: "Robe", value: h.coat || "-" },
        { title: "Écurie / Lieu", value: h.stable_location || "-" },
        { title: "Alimentation", value: h.feed || "-" },
        { title: "Note libre", value: h.additional_info || "-" },
    ];
});

const loadHorse = async () => {
    isLoading.value = true;
    try {
        const id = route.params.id as string;
        
        // Optimisation : chercher d'abord dans le store
        let foundHorse = horsesStore.horses.find(h => h.id === id);
        
        if (!foundHorse) {
            // Si absent, charger via le store (qui appelle l'API)
            foundHorse = await horsesStore.loadHorseById(id);
        }
        
        horse.value = foundHorse || null;
    } catch (error) {
        console.error("Error loading horse details:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de charger la fiche.",
            color: "error",
        };
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadHorse();
});
</script>