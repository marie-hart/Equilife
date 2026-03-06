<template>
  <v-sheet color="#f3eadf" min-height="100vh" class="pb-10">
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Détails de la ration
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        <v-btn 
            variant="text" 
            icon="mdi-close"
            color="#2E4B36"
           @click="router.back()" 
          ></v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <v-card variant="flat" rounded="xl" class="pa-6 shadow-subtle border-light bg-white">
            <div class="text-overline mb-4" style="color: #7B5B3E">Composition</div>
            
            <v-skeleton-loader v-if="loading" type="article" />
            
            <div v-else-if="ration">
              <h2 class="text-h5 font-weight-bold mb-2" style="color: #2E4B36">
                {{ ration.name }}
              </h2>
              
              <v-chip 
                :color="ration.is_active ? '#2E4B36' : '#A89F94'" 
                size="small" 
                variant="flat" 
                class="mb-4 font-weight-bold text-white"
              >
                {{ ration.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </v-chip>

              <v-divider class="mb-4" />

              <div v-for="slot in ['Matin', 'Midi', 'Soir']" :key="slot" class="mb-6">
                <div class="d-flex align-center mb-2">
                  <v-icon 
                    size="small" 
                    class="me-2" 
                    :color="getSlotColor(slot)"
                  >
                    {{ getSlotIcon(slot) }}
                  </v-icon>
                  <span class="text-subtitle-1 font-weight-black" :style="{ color: '#554338' }">
                    {{ slot }}
                  </span>
                </div>

                <v-card variant="flat" color="#f9f5f0" rounded="lg" class="pa-0 border-light">
                  <v-list class="bg-transparent pa-0">
                    <template v-for="item in ration.items" :key="item.id">
                      <v-list-item 
                        v-if="item.frequency.map(f => f.toLowerCase()).includes(slot.toLowerCase())" 
                        class="border-b"
                      >
                        <template #prepend>
                          <v-icon size="small" color="#7B5B3E">mdi-scale-balanced</v-icon>
                        </template>
                        
                        <v-list-item-title class="font-weight-bold" style="color: #2E4B36">
                          {{ getProductName(item.product_id) }}
                        </v-list-item-title>
                        
                        <v-list-item-subtitle class="text-body-2">
                          <span class="font-weight-black" style="color: #7B5B3E">{{ item.quantity }}kg</span>
                          <span class="mx-2">•</span>
                          <span>{{ item.type || 'Aliment' }}</span>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>

                    <v-list-item v-if="!hasItemsForSlot(slot)">
                      <v-list-item-title class="text-caption text-italic text-grey">
                        Aucun produit prévu pour ce moment.
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="flat" rounded="xl" class="pa-6 shadow-subtle border-light bg-white mb-6">
            <div class="text-overline mb-4" style="color: #7B5B3E">Informations</div>
            
            <div class="d-flex align-center mb-3">
              <v-icon size="small" class="me-2" color="#2E4B36">mdi-horse</v-icon>
              <span class="text-body-2 font-weight-bold">Cheval : {{ horseName }}</span>
            </div>

            <div class="d-flex align-center mb-3">
              <v-icon size="small" class="me-2" color="#2E4B36">mdi-calendar-clock</v-icon>
              <span class="text-body-2">Dernière mise à jour : {{ formatDate(ration?.updated_at) }}</span>
            </div>
          </v-card>

          <v-btn
            block
            color="#2E4B36"
            variant="flat"
            rounded="xl"
            size="large"
            prepend-icon="mdi-pencil"
            class="text-none font-weight-bold shadow-subtle mb-4"
            @click="handleEdit"
          >
            Modifier la ration
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { rationsApi } from "@/api/rations";
import { productApi } from "@/api/product";
import { useHorsesStore } from "@/stores/HorsesStore";
import type { Ration, Product } from "@/types";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore();

const loading = ref(true);
const ration = ref<Ration | null>(null);
const products = ref<Product[]>([]);

const rationId = computed(() => route.params.rationId as string);

const horseName = computed(() => {
  if (!ration.value) return "...";
  return horsesStore.getHorseNameById(ration.value.horse_id);
});

const getProductName = (productId?: string) => {
  return products.value.find(p => p.id === productId)?.name || "Produit inconnu";
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

// On garde les labels d'affichage avec Majuscules pour le style
const slots = ['Matin', 'Midi', 'Soir'];

// Fonction de vérification "Case Insensitive"
const hasItemsForSlot = (slot: string) => {
  if (!ration.value?.items) return false;
  
  return ration.value.items.some(item => 
    // On vérifie si le tableau frequency contient le mot (en ignorant la casse)
    item.frequency.map(f => f.toLowerCase()).includes(slot.toLowerCase())
  );
};

// Icônes selon le moment
const getSlotIcon = (slot: string) => {
  if (slot === 'Matin') return 'mdi-weather-sunset-up';
  if (slot === 'Midi') return 'mdi-weather-sunny';
  return 'mdi-weather-night';
};

// Couleurs selon le moment
const getSlotColor = (slot: string) => {
  if (slot === 'Matin') return '#FFB74D'; // Orange
  if (slot === 'Midi') return '#FDD835';  // Jaune
  return '#5C6BC0';                       // Indigo/Bleu nuit
};

const loadData = async () => {
  loading.value = true;
  try {
    // On charge les produits et la ration en parallèle
    const [productsData, rationData] = await Promise.all([
      productApi.getAll(false),
      rationsApi.getById(rationId.value)
    ]);
    
    products.value = productsData;
    ration.value = rationData;
  } catch (error) {
    console.error("Erreur lors du chargement des détails de la ration:", error);
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  router.push({ 
    name: 'FeedingEdit', 
    params: { rationId: rationId.value },
    query: { horseId: ration.value?.horse_id }
  });
};

onMounted(loadData);
</script>

<style scoped>
.shadow-subtle {
    box-shadow: 0 10px 30px rgba(46, 75, 54, 0.08) !important;
}
.border-light {
    border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
.border-b {
  border-bottom: 1px solid rgba(168, 159, 148, 0.1) !important;
}
.border-b:last-child {
  border-bottom: none !important;
}
</style>