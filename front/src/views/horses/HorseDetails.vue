<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" color="#2E4B36" class="me-2" @click="$router.push({ name: 'Horses' })" />
          <div>
            <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
              {{ horse?.name || 'Fiche Cheval' }}
            </h1>
            <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
          </div>
        </div>

        <v-btn
          color="#2E4B36"
          variant="flat"
          rounded="xl"
          class="text-none font-weight-bold shadow-subtle"
          :to="{ name: 'HorseEdit', params: { id: horse?.id } }"
        >
          <v-icon start icon="mdi-pencil" size="18" />
          Modifier
        </v-btn>
      </div>

      <v-card variant="flat" rounded="xl" class="pa-0 shadow-subtle border-light bg-white overflow-hidden">
        <v-skeleton-loader v-if="isLoading" type="image, article" />
        
        <div v-else-if="horse">
          <v-row no-gutters>
            <v-col cols="12" md="5" class="relative">
              <v-img
                :src="horse.photoBase64 || horse.photo_path || '/avatar.jpg'"
                height="100%"
                min-height="400"
                cover
                class="horse-detail-image"
              >
                <div class="image-overlay d-flex align-end pa-6">
                  <v-chip color="white" variant="flat" class="font-weight-black" size="large">
                    {{ horse.age }} ans
                  </v-chip>
                </div>
              </v-img>
            </v-col>

            <v-col cols="12" md="7" class="pa-6 pa-md-10">
              <div class="text-overline mb-2" style="color: #7B5B3E">Informations générales</div>
              
              <v-row dense>
                <v-col v-for="(item, i) in horseInfo" :key="i" cols="12" sm="6" class="mb-4">
                  <div class="d-flex align-start">
                    <v-icon :icon="item.icon" color="#BDB4A8" size="20" class="mt-1 me-3" />
                    <div>
                      <div class="text-caption font-weight-bold text-uppercase" style="color: #BDB4A8; letter-spacing: 1px;">
                        {{ item.title }}
                      </div>
                      <div class="text-body-1 font-weight-bold" style="color: #2E4B36">
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="bg-grey-lighten-5 pa-4 rounded-xl border-light">
                <div class="text-caption font-weight-bold mb-1" style="color: #7B5B3E">NOTES & OBSERVATIONS</div>
                <div class="text-body-2 italic" style="color: #554338; line-height: 1.6">
                  "{{ horse.additional_info || 'Aucune note particulière pour le moment.' }}"
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <div v-else class="pa-10 text-center">
          <v-icon size="64" color="grey-lighten-1">mdi-horse-variant-off</v-icon>
          <p class="mt-4">Cheval introuvable.</p>
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useHorsesStore } from "@/stores/HorsesStore";
import type { Horse } from "@/types";

const route = useRoute();
const horsesStore = useHorsesStore();
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

const horseInfo = computed(() => {
    if (!horse.value) return [];
    const h = horse.value;
    return [
        { title: "Sexe", value: h.sex || "-", icon: "mdi-gender-male-female" },
        { title: "Race", value: h.breed || "-", icon: "mdi-dna" },
        { title: "Robe", value: h.coat || "-", icon: "mdi-palette" },
        { title: "Naissance", value: h.birth_date ? formatDate(h.birth_date) : "-", icon: "mdi-calendar-star" },
        { title: "Lieu", value: h.stable_location || "-", icon: "mdi-map-marker-outline" },
        { title: "Alimentation", value: h.feed || "-", icon: "mdi-food-apple-outline" },
    ];
});

const loadHorse = async () => {
    isLoading.value = true;
    try {
        const id = route.params.id as string;
        
        const foundHorse = horsesStore.horses.find(h => h.id === id) 
                           || await horsesStore.loadHorseById(id);
        
        horse.value = (foundHorse as Horse) || null;
        
    } catch (error) {
        console.error("Error loading horse details:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadHorse();
});
</script>

<style scoped>
.shadow-subtle {
  box-shadow: 0 10px 30px rgba(46, 75, 54, 0.08) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
.horse-detail-image {
  transition: transform 0.5s ease;
}
.image-overlay {
  background: linear-gradient(to top, rgba(46, 75, 54, 0.6), transparent);
  height: 100%;
  width: 100%;
}
.text-overline {
    letter-spacing: 2px !important;
    font-weight: 800 !important;
}
.italic {
    font-style: italic;
}
</style>