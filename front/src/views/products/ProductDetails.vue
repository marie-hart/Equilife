<template>
  <v-sheet
    color="#EDE4D8"
    min-height="100vh"
    class="pa-0"
  >
    <v-container class="px-4 py-2">
      
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" :style="{ color: '#2E4B36', fontFamily: 'Playfair Display, serif' }">
            Détails
          </h1>
          <div :style="{ width: '30px', height: '3px', backgroundColor: '#7B5B3E', borderRadius: '2px' }"></div>
        </div>
        
        <v-btn 
          variant="text" 
          icon="mdi-close"
          color="#2E4B36"
          :to="{ name: 'Products' }"
        ></v-btn>
      </div>

      <v-card v-if="isLoading" color="#F5EFE6" variant="flat" rounded="xl" class="pa-4">
        <v-skeleton-loader type="article" bg-color="transparent" />
      </v-card>

      <div v-else-if="product">
        <v-card 
          class="mb-6 shadow-subtle" 
          variant="flat" 
          rounded="xl"
          color="#F5EFE6"
        >
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-overline font-weight-bold mb-1" :style="{ color: '#A89F94', letterSpacing: '1px' }">
                  {{ product.category.toUpperCase() }}
                </div>
                <h2 class="text-h5 font-weight-bold" :style="{ color: '#2E4B36' }">
                  {{ product.name }}
                </h2>
                <span class="text-body-2" :style="{ color: '#7B5B3E' }">{{ product.brand || 'Marque non spécifiée' }}</span>
              </div>
              <v-chip :color="stockInfo.color" variant="flat" size="small" class="font-weight-bold">
                {{ stockInfo.label }}
              </v-chip>
            </div>

            <v-divider class="mb-4" style="opacity: 0.1"></v-divider>

            <div v-if="isManaged" class="pa-3 rounded-lg mb-4" :style="{ backgroundColor: 'rgba(46, 75, 54, 0.05)'}">
              <div class="d-flex align-center mb-3">
                <v-icon size="18" color="#2E4B36" class="me-2">mdi-clover</v-icon>
                <span class="text-caption font-weight-bold" :style="{color:'#2E4B36'}">SUIVI D'AUTONOMIE</span>
              </div>
              
              <div class="d-flex justify-space-between mb-2">
                <span class="text-caption" :style="{ color: '#7B5B3E' }">Dernière réception</span>
                <span class="text-body-2 font-weight-bold">{{ formattedPurchaseDate }}</span>
              </div>

              <div class="d-flex justify-space-between align-center">
                <span class="text-caption" :style="{ color: '#7B5B3E' }">Estimation restante</span>
                <div class="text-right">
                  <div class="text-body-1 font-weight-black" :style="{ color: stockInfo.color === 'grey' ? '#7B5B3E' : stockInfo.color }">
                    {{ remainingDays !== null ? `${remainingDays} jours` : 'Non calculé' }}
                  </div>
                  <div v-if="endDateFormatted" class="text-caption font-italic" :style="{ fontSize: '0.7rem !important' }">
                    Fin estimée le {{ endDateFormatted }}
                  </div>
                </div>
              </div>
            </div>

            <v-list bg-color="transparent" density="compact" class="pa-0">
              <v-list-item class="px-0 border-b-light">
                <template v-slot:prepend>
                  <v-icon size="18" color="#A89F94" class="me-2">mdi-scale-balanced</v-icon>
                </template>
                <v-list-item-title class="text-body-2" style="color: #2E4B36">
                  {{ product.daily_usage }} {{ product.unit }} / jour
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">Consommation quotidienne</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="product.note" class="px-0">
                <template v-slot:prepend>
                  <v-icon size="18" color="#A89F94" class="me-2">mdi-note-text-outline</v-icon>
                </template>
                <v-list-item-title class="text-body-2" style="color: #2E4B36; white-space: normal;">
                  {{ product.note }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">Notes</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <div class="d-flex ga-3">
          <v-btn
            variant="flat"
            color="#2E4B36"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            size="large"
            prepend-icon="mdi-pencil"
            :to="{ name: 'ProductEdit', params: { id: productId }}"
          >
            Modifier
          </v-btn>
          <v-btn
            variant="tonal"
            color="#B00020"
            rounded="xl"
            class="text-none font-weight-bold"
            size="large"
            prepend-icon="mdi-trash-can-outline"
            @click="deleteDialogOpen = true"
          >
            Supprimer
          </v-btn>
        </div>
      </div>

      <ConfirmDeleteDialog
          v-model="deleteDialogOpen"
          title="Supprimer le produit"
          :message="`Voulez-vous vraiment supprimer ${product?.name} ?`"
          @confirm="handleDelete"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2000">
          {{ snackbar.message }}
      </v-snackbar>

    </v-container>
  </v-sheet>
</template>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}

.border-b-light {
  border-bottom: 1px solid rgba(168, 159, 148, 0.1);
}
</style>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productApi } from "@/api/product";
import { logger } from "@/services/LoggerService";
import type { Product } from "@/types";
import { ConfirmDeleteDialog } from "@/components";

const route = useRoute();
const router = useRouter();

const product = ref<Product | null>(null);
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({ show: false, message: "", color: "success" });

const productId = route.params.id as string;

const isManaged = computed(() => {
    const cats = ["Granulés", "Complément", "Aliments"];
    return product.value && cats.includes(product.value.category || "");
});

const remainingDays = computed(() => {
    const p = product.value;
    if (!p || !p.last_purchase_date || !p.quantity_purchased || !p.daily_usage || p.daily_usage <= 0) return null;

    const startDate = new Date(p.last_purchase_date).getTime();
    const today = new Date().getTime();
    const totalDaysDuration = (p.quantity_purchased / p.daily_usage) * (1000 * 60 * 60 * 24);
    const expiryDate = startDate + totalDaysDuration;
    
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

const formattedPurchaseDate = computed(() => {
  if (!product.value?.last_purchase_date) return "Non renseignée";
  
  try {
    const date = new Date(product.value.last_purchase_date);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return product.value.last_purchase_date; 
  }
});

const handleDelete = async () => {
    try {
        await productApi.delete(productId);
        snackbar.value = {
            show: true,
            message: "Produit supprimé avec succès",
            color: "success"
        };
        setTimeout(() => router.push({ name: 'Products' }), 1000);
    } catch (error) {
        logger.error("Erreur suppression:", error);
        snackbar.value = {
            show: true,
            message: "Erreur lors de la suppression",
            color: "error"
        };
    } finally {
        deleteDialogOpen.value = false;
    }
};

const stockInfo = computed(() => {
    const days = remainingDays.value;
    if (!isManaged.value) return { label: 'Suivi manuel', color: 'grey' };
    if (days === null) return { label: 'En attente de données', color: 'grey' };
    if (days <= 0) return { label: 'Rupture', color: 'red' };
    if (days <= 14) return { label: 'Stock bas', color: 'orange' };
    return { label: 'En stock', color: 'green' };
});

const endDateFormatted = computed(() => {
    const p = product.value;
    if (!p || !p.last_purchase_date || !p.quantity_purchased || !p.daily_usage) return null;
    
    const start = new Date(p.last_purchase_date);
    const days = p.quantity_purchased / p.daily_usage;
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    
    return end.toLocaleDateString('fr-FR');
});

const loadProduct = async () => {
    try {
        product.value = await productApi.getById(productId);
    } catch (error) {
        logger.error("Error loading product:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadProduct);
</script>