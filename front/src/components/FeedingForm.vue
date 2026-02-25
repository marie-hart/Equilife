<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="safe-area-top pb-10">
    <v-container class="px-4 py-2">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            {{ isEditMode ? 'Modifier' : 'Nouvelle ration' }}
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
        
        <v-btn variant="text" icon="mdi-close" color="#2E4B36" @click="goBack"></v-btn>
      </div>

      <v-skeleton-loader v-if="isLoading" type="article, card" bg-color="transparent" />

      <v-form v-else @submit.prevent="saveRation">
        <v-row dense>
          
          <v-col cols="12">
            <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Informations générales</div>
            <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 mb-4 shadow-subtle">
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Nom de la ration (ex: Hiver)"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                    :error-messages="fieldErrors.name ? [fieldErrors.name] : undefined"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-select
                    :model-value="horsesStore.horseId"
                    @update:model-value="horsesStore.sethorseId"
                    :items="horsesStore.horseOptions"
                    label="Cheval"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                    :disabled="isEditMode"
                    prepend-inner-icon="mdi-horse"
                    :error-messages="fieldErrors.horseId ? [fieldErrors.horseId] : undefined"
                  />
                </v-col>

                <v-col cols="6">
                  <DatePickerField v-model="form.startDate" label="Début" />
                </v-col>
                <v-col cols="6">
                  <DatePickerField v-model="form.endDate" label="Fin (optionnel)" />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="form.isActive"
                    :items="activeOptions"
                    label="État de la ration"
                    variant="solo"
                    flat
                    bg-color="white"
                    rounded="lg"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-2 ps-1">
              <div class="text-overline" style="color: #7B5B3E">Composition</div>
              <v-btn 
                variant="text" 
                size="small" 
                prepend-icon="mdi-plus-circle"
                color="#2E4B36"
                class="text-none font-weight-bold"
                @click="addItem"
              >
                Ajouter
              </v-btn>
            </div>

            <div class="d-flex flex-column ga-4">
              <v-card 
                v-for="(item, index) in form.items"
                :key="item.key"
                variant="flat"
                color="#F5EFE6"
                rounded="xl"
                class="pa-4 shadow-subtle border-light"
              >
                <v-row dense>
                  <v-col cols="12">
                    <v-select
                      v-model="item.productId"
                      :items="productOptions"
                      label="Produit"
                      variant="solo"
                      flat
                      bg-color="white"
                      rounded="lg"
                      density="comfortable"
                      hide-details
                      class="mb-3"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="item.quantity"
                      label="Quantité"
                      placeholder="Ex: 2L"
                      variant="solo"
                      flat
                      bg-color="white"
                      rounded="lg"
                      density="comfortable"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="item.type"
                      :items="itemTypeOptions"
                      label="Catégorie"
                      variant="solo"
                      flat
                      bg-color="white"
                      rounded="lg"
                      density="comfortable"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="item.frequency"
                      :items="frequencyOptions"
                      label="Repas"
                      multiple
                      chips
                      variant="solo"
                      flat
                      bg-color="white"
                      rounded="lg"
                      density="comfortable"
                      hide-details
                      class="mt-3"
                    />
                  </v-col>
                </v-row>
                
                <div class="d-flex justify-end mt-2">
                  <v-btn
                    variant="text"
                    size="small"
                    color="#B00020"
                    prepend-icon="mdi-trash-can-outline"
                    @click="removeItem(index)"
                    class="text-none"
                    v-if="form.items.length > 1"
                  >
                    Supprimer cet aliment
                  </v-btn>
                </div>
              </v-card>
            </div>
          </v-col>

          <v-col cols="12" class="mt-4">
            <div class="text-overline mb-2 ps-1" style="color: #7B5B3E">Notes & Recommandations</div>
            <v-textarea
              v-model="form.note"
              placeholder="Précisions pour l'écurie..."
              variant="solo"
              flat
              bg-color="#F5EFE6"
              rounded="xl"
              rows="3"
            />
          </v-col>
        </v-row>

        <div class="d-flex ga-3 mt-8">
          <v-btn
            variant="text"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            color="#7B5B3E"
            @click="goBack"
          >
            Annuler
          </v-btn>

         <v-btn
            variant="flat"
            color="#2E4B36"
            rounded="xl"
            class="flex-grow-1 text-none font-weight-bold"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="saveRation"
        >
            Enregistrer
        </v-btn>
        </div>
      </v-form>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
        <div class="text-center w-100 font-weight-bold">{{ snackbar.message }}</div>
      </v-snackbar>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top, 20px) !important;
}
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
/* Style pour les chips dans les selects multi */
:deep(.v-chip) {
  background-color: #2E4B36 !important;
  color: white !important;
  font-weight: bold !important;
  font-size: 10px !important;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter, useRoute } from "vue-router";
import { rationsApi } from "@/api/rations";
import { productApi } from "@/api/product";
import { toDateInputValue } from "@/libs/date";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Product, Ration, RationFormItem } from "@/types";
import { useHorsesStore } from '@/stores/HorsesStore'; 

const props = defineProps<{
    rationId?: string;
}>();

const router = useRouter();
const route = useRoute()
const horsesStore = useHorsesStore();

const isEditMode = computed(() => Boolean(props.rationId));

const products = ref<Product[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(true);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const form = ref({
    name: "",
    startDate: "",
    endDate: "",
    note: "",
    isActive: true,
    items: [] as RationFormItem[],
});

const activeOptions = [
    { title: "Active", value: true },
    { title: "Inactive", value: false },
];
const frequencyOptions = [
    { title: "Matin", value: "matin" },
    { title: "Midi", value: "midi" },
    { title: "Soir", value: "soir" },
];
const itemTypeOptions = [
    { title: "Granulés", value: "Granulés" },
    { title: "Complément", value: "Complément" },
    { title: "Autre", value: "Autres" },
];

const productOptions = computed(() => {
    const allowed = new Set(["Granulés", "Complément"]);
    const seen = new Set<string>();
    const hasCategory = products.value.some((product) => Boolean(product.category));
    return products.value
        .filter((product) => hasCategory ? product.category && allowed.has(product.category) : true)
        .filter((product) => {
            const key = product.name?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((product) => ({ title: product.name, value: product.id }));
});

const addItem = () => {
    form.value.items.unshift({
        key: `${Date.now()}-${Math.random()}`,
        productId: "",
        quantity: "",
        frequency: [],
        type: "Granulés",
    });
};

const removeItem = (index: number) => {
    form.value.items.splice(index, 1);
};

const resetForm = () => {
    form.value = {
        name: "",
        startDate: "",
        endDate: "",
        note: "",
        isActive: true,
        items: [],
    };
    addItem();
};

const loadProducts = async () => {
    try {
        products.value = await productApi.getAll(false);
    } catch (error) {
        console.error("Error loading products:", error);
    }
};

const loadRation = async () => {
    if (!props.rationId) return;
    try {
        const ration: Ration = await rationsApi.getById(props.rationId);
        
        if (ration.horse_id && ration.horse_id !== horsesStore.horseId) {
            horsesStore.sethorseId(ration.horse_id);
        }

        form.value = {
            name: ration.name || "",
            startDate: toDateInputValue(ration.start_date),
            endDate: toDateInputValue(ration.end_date),
            note: ration.note || "",
            isActive: ration.is_active,
            items: ration.items.map((item) => ({
                key: `${item.id}-${Math.random()}`,
                productId: item.product_id || "",
                quantity: item.quantity || "",
                frequency: item.frequency || [],
                type: item.type || "Granulés",
            })),
        };
        if (!form.value.items.length) addItem();
    } catch (error) {
        console.error("Error loading ration:", error);
        snackbar.value = { show: true, message: "Chargement impossible.", color: "error" };
    }
};

const saveRation = async () => {
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseId", label: "un cheval", value: horsesStore.horseId },
        { key: "name", label: "un nom", value: form.value.name.trim() },
    ]);
    fieldErrors.value = errors;
    if (firstError) {
        snackbar.value = { show: true, message: firstError, color: "error" };
        return;
    }
    const validItems = form.value.items.filter(
        (item) => item.productId || item.quantity || item.frequency.length
    );
    if (!validItems.length) {
        snackbar.value = { show: true, message: "Ajoutez au moins un aliment.", color: "error" };
        return;
    }

    try {
        isSubmitting.value = true;
        const payload = {
            horse_id: horsesStore.horseId || "",
            name: form.value.name.trim(),
            start_date: form.value.startDate || null, 
            end_date: form.value.endDate || null,
            note: form.value.note.trim(),
            is_active: form.value.isActive,
            items: validItems.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                frequency: item.frequency,
                type: item.type,
            })),
        };

        if (isEditMode.value) {
            await rationsApi.update(props.rationId!, payload);
            snackbar.value = { show: true, message: "Ration mise à jour.", color: "success" };
        } else {
            await rationsApi.create(payload);
            snackbar.value = { show: true, message: "Ration enregistrée.", color: "success" };
            resetForm();
        }
        goBack();
    } catch (error) {
        console.error("Error saving ration:", error);
        snackbar.value = { show: true, message: "Action impossible.", color: "error" };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    if (horsesStore.horseId) {
        router.push({ name: "FeedingView", params: { id: horsesStore.horseId } });
        return;
    }
    router.push("/horses");
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await horsesStore.loadHorses();
        
        const horseIdFromUrl = route.query.horseId as string;
  
        const horseExists = horsesStore.horses.some(h => h.id === horseIdFromUrl);

        if (horseIdFromUrl && horseExists) {
            horsesStore.sethorseId(horseIdFromUrl);
        } else if (horsesStore.horses.length > 0 && !isEditMode.value) {
            horsesStore.sethorseId(horsesStore.horses[0].id);
        }

        if (isEditMode.value) {
            await loadRation();
        } else {
            resetForm();
        }
        await loadProducts();
    } finally {
        isLoading.value = false;
    }
});
</script>