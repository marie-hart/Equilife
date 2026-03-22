<template>
  <v-sheet color="#EDE4D8" class="pb-10">
    <v-container class="px-4 py-2">
      <div class="d-flex align-center justify-space-between mb-8">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            Détails du soin
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn 
          variant="text" 
          icon="mdi-arrow-left"
          color="#2E4B36"
          @click="router.back()"
        />
      </div>

      <v-skeleton-loader
        v-if="isLoading"
        type="article, actions"
        bg-color="transparent"
      />

      <div v-else-if="care">
        <v-card variant="flat" color="#2E4B36" theme="dark" rounded="xl" class="pa-6 mb-6 shadow-subtle">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-overline mb-1" style="color: rgba(255,255,255,0.7)">Type de soin</div>
              <div class="text-h5 font-weight-bold">{{ care.name }}</div>
              <div class="text-body-2 mt-2" style="color: rgba(255,255,255,0.9)">
                {{ formatDateLong(care.event_date) }}
              </div>
            </div>
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon size="28">mdi-medical-bag</v-icon>
            </v-avatar>
          </div>
        </v-card>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 text-center">
              <v-icon color="#7B5B3E" class="mb-1">mdi-horse</v-icon>
              <div class="text-caption" style="color: #7B5B3E">Cheval</div>
              <div class="text-subtitle-1 font-weight-bold" style="color: #2E4B36">
                {{ horsesStore.getHorseNameById(String(care.horse_id)) }}
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 text-center">
              <v-icon color="#7B5B3E" class="mb-1">mdi-pill</v-icon>
              <div class="text-caption" style="color: #7B5B3E">Produit</div>
              <div class="text-subtitle-1 font-weight-bold" style="color: #2E4B36">
                {{ productName || '—' }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card
          v-if="recurrenceLabel"
          variant="flat"
          color="#F5EFE6"
          rounded="xl"
          class="pa-4 mb-4 shadow-subtle border-light"
        >
          <div class="d-flex align-center">
            <v-icon color="#7B5B3E" class="me-2">mdi-refresh</v-icon>
            <span class="text-body-2 font-weight-medium" style="color: #2E4B36">
              Rappel : {{ recurrenceLabel }}
            </span>
          </div>
        </v-card>

        <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Notes & Observations</div>
        <v-card variant="flat" color="white" rounded="xl" class="pa-5 mb-8 shadow-subtle border-light">
          <p class="text-body-1 mb-0" style="color: #554338; line-height: 1.6;">
            {{ care.description || 'Aucune note pour ce soin.' }}
          </p>
        </v-card>

        <div class="d-flex ga-3">
          <v-btn
            variant="flat"
            color="#2E4B36"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            size="large"
            prepend-icon="mdi-pencil"
            :to="{ name: 'HealthEdit', params: { id } }"
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

      <div v-else class="text-center py-12">
        <v-icon size="64" color="#D1C7BC">mdi-alert-circle-outline</v-icon>
        <p class="mt-4" style="color: #7B5B3E">Soin introuvable</p>
        <v-btn variant="text" color="#2E4B36" class="mt-2" @click="router.back()">Retour</v-btn>
      </div>

      <ConfirmDeleteDialog
        v-model="deleteDialogOpen"
        title="Supprimer le soin ?"
        message="Cette action est irréversible."
        @confirm="confirmDelete"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
        <div class="text-center w-100">{{ snackbar.message }}</div>
      </v-snackbar>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { productApi } from "@/api/product";
import { formatDateLong } from "@/libs/date";
import { ConfirmDeleteDialog } from "@/components";
import { logger } from "@/services/LoggerService";
import type { Event } from "@/types";
import { useHorsesStore } from "@/stores/HorsesStore";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore();
const care = ref<Event | null>(null);
const productName = ref<string>("");
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({ show: false, message: "", color: "#2E4B36" });

const id = route.params.id as string;

const recurrenceLabel = computed(() => {
    const e = care.value;
    if (!e?.reminder_enabled) return "";
    const d = e.reminder_interval_days;
    const m = e.reminder_interval_months;
    const y = e.reminder_interval_years;
    if (y) return `Tous les ${y} an${y > 1 ? "s" : ""}`;
    if (m) return `Tous les ${m} mois`;
    if (d) return `Tous les ${d} jour${d > 1 ? "s" : ""}`;
    return "";
});

const loadCare = async () => {
    try {
        care.value = await eventsApi.getById(id);
        if (care.value?.product_id) {
            try {
                const p = await productApi.getById(care.value.product_id);
                productName.value = p?.name || "";
            } catch {
                productName.value = "";
            }
        }
    } catch (error) {
        logger.error("Error loading care details", error);
    } finally {
        isLoading.value = false;
    }
};

const confirmDelete = async () => {
    try {
        await eventsApi.delete(id);
        snackbar.value = { show: true, message: "Soin supprimé", color: "#2E4B36" };
        setTimeout(() => router.back(), 1000);
    } catch (error) {
        snackbar.value = { show: true, message: "Erreur lors de la suppression", color: "#B00020" };
    } finally {
        deleteDialogOpen.value = false;
    }
};

onMounted(loadCare);
</script>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
</style>
