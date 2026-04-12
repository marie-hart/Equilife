<template>
  <v-form @submit.prevent="handleSubmit" class="product-form">
    <v-row dense>
      <v-col cols="12">
        <div class="text-overline mb-2 ps-1" :style="{ color: '#7B5B3E' }">Informations générales</div>
        <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 mb-4">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="localForm.name"
                label="Nom du produit *"
                placeholder="Ex: Granulés Performance"
                variant="solo"
                flat
                bg-color="white"
                rounded="lg"
                density="comfortable"
                :error-messages="errors.name"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="localForm.category"
                :items="typeOptions"
                label="Catégorie *"
                variant="solo"
                flat
                bg-color="white"
                rounded="lg"
                density="comfortable"
                :error-messages="errors.category"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="localForm.brand"
                label="Marque"
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

      <v-fade-transition>
        <v-col cols="12" v-if="isStockManaged">
          <div class="text-overline mb-2 ps-1" :style="{ color: '#7B5B3E' }">Suivi des stocks</div>
          <v-card variant="flat" color="#F5EFE6" rounded="xl" class="pa-4 mb-4">
            <v-switch
              v-model="stockTrackingEnabled"
              color="#2E4B36"
              inset
              hide-details
              class="mb-3"
              label="Activer le suivi des stocks"
            />

            <p v-if="!stockTrackingEnabled" class="text-caption mb-0" style="color: #7B5B3E;">
              Optionnel: vous pouvez enregistrer le produit sans suivi de stock.
            </p>

            <v-row dense>
              <v-col cols="12" v-if="stockTrackingEnabled">
                <v-menu :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      :model-value="formatDisplayDate(localForm.last_purchase_date || '')"
                      label="Date de réception *"
                      readonly
                      v-bind="props"
                      variant="solo"
                      flat
                      bg-color="white"
                      rounded="lg"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                      :error-messages="errors.last_purchase_date"
                    />
                  </template>
                  <v-date-picker
                    v-model="computedDate"
                    color="#2E4B36"
                    @update:model-value="onDateSelected"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="6" v-if="stockTrackingEnabled">
                <v-text-field
                  v-model.number="localForm.quantity_purchased"
                  label="Quantité reçue *"
                  type="number"
                  variant="solo"
                  flat
                  bg-color="white"
                  rounded="lg"
                  density="comfortable"
                  :error-messages="errors.quantity_purchased"
                />
              </v-col>

              <v-col cols="6" v-if="stockTrackingEnabled">
                <v-select
                  v-model="localForm.unit"
                  :items="unitOptions"
                  label="Unité"
                  variant="solo"
                  flat
                  bg-color="white"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" v-if="stockTrackingEnabled">
                <v-text-field
                  v-model.number="localForm.daily_usage"
                  :label="dailyUsageLabel"
                  placeholder="0.0"
                  type="number"
                  variant="solo"
                  flat
                  bg-color="white"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="mdi-silverware-fork-knife"
                  :suffix="dailyUsageSuffix"
                  :error-messages="errors.daily_usage"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-fade-transition>

      <v-col cols="12">
        <div class="text-overline mb-2 ps-1" :style="{ color: '#7B5B3E' }">Notes & Observations</div>
        <v-textarea
          v-model="localForm.note"
          placeholder="Dosage spécifique, préférence du cheval..."
          variant="solo"
          flat
          bg-color="#F5EFE6"
          rounded="xl"
          density="comfortable"
          rows="3"
          @keydown.enter.prevent
        />
      </v-col>
    </v-row>

    <div class="d-flex ga-3 mt-6">
      <v-btn
        v-if="showCancel"
        variant="text"
        rounded="xl"
        class="flex-grow-1 text-none"
        color="#7B5B3E"
        @click="$emit('cancel')"
      >
        Annuler
      </v-btn>

      <v-btn
        variant="flat"
        color="#2E4B36"
        rounded="xl"
        class="flex-grow-1 text-none font-weight-bold"
        size="large"
        :loading="loading"
        type="submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { Product } from "@/types";
import { toDateInputValue, formatDateShort } from "@/libs/date";

const props = withDefaults(
  defineProps<{
    modelValue: Partial<Product>;
    loading?: boolean;
    submitLabel?: string;
    showCancel?: boolean;
  }>(),
  {
    loading: false,
    submitLabel: "Enregistrer",
    showCancel: false,
  }
);

const emit = defineEmits(["update:modelValue", "submit", "cancel"]);

const localForm = reactive({ ...props.modelValue });
const errors = reactive<Record<string, string[]>>({});

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(localForm, newVal);
  },
  { deep: true }
);

watch(
  () => localForm,
  () => emit("update:modelValue", { ...localForm }),
  { deep: true }
);

const STOCK_TYPES = ["Granulés", "Complément"];

const isStockManaged = computed(() =>
  STOCK_TYPES.includes(localForm.category || "")
);

const asPositiveNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const hasStockTrackingData = computed(
  () =>
    Boolean(localForm.last_purchase_date) &&
    asPositiveNumber(localForm.quantity_purchased) !== null &&
    asPositiveNumber(localForm.daily_usage) !== null
);

const stockTrackingEnabled = ref(hasStockTrackingData.value);

watch(
  () => props.modelValue,
  () => {
    stockTrackingEnabled.value = hasStockTrackingData.value;
  },
  { deep: true }
);

watch(isStockManaged, (enabled) => {
  if (!enabled) {
    stockTrackingEnabled.value = false;
  }
});

const typeOptions = [
  "Granulés",
  "Complément",
  "Friandises",
  "Équipement",
  "Pharmacie",
  "Autres"
];

const formatDisplayDate = (date: string) => {
  if (!date) return "";
  return formatDateShort(date);
};

const computedDate = computed({
  get: () => localForm.last_purchase_date ? new Date(localForm.last_purchase_date) : new Date(),
  set: (val) => {
    if (val) {
      // On utilise ta méthode qui renvoie "YYYY-MM-DD" sans décalage
      localForm.last_purchase_date = toDateInputValue(val);
    }
  }
});

const onDateSelected = () => {
  // Le menu se ferme automatiquement si close-on-content-click est true
  // ou tu peux gérer un flag 'menuDate = false'
};

const unitOptions = ["kg", "L", "g"];

const dailyUsageSuffix = computed(() => {
  if (localForm.unit === "L") return "L/jour";
  if (localForm.unit === "kg") return "kg/jour";
  if (localForm.unit === "g") return "g/jour";
  return "/jour";
});

const dailyUsageLabel = computed(() => {
  if (localForm.unit === "L") return "Consommation journalière (L) *";
  if (localForm.unit === "kg") return "Consommation journalière (kg) *";
  if (localForm.unit === "g") return "Consommation journalière (g) *";
  return "Consommation journalière *";
});

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k]);

  if (!localForm.name) errors.name = ["Champ obligatoire"];
  
  if (!localForm.category) errors.category = ["Champ obligatoire"];

  if (isStockManaged.value && stockTrackingEnabled.value) {
    if (!localForm.last_purchase_date) errors.last_purchase_date = ["Champ obligatoire"];
    if (!localForm.quantity_purchased) errors.quantity_purchased = ["Champ obligatoire"];
    if (!localForm.daily_usage) errors.daily_usage = ["Champ obligatoire"];
  }

  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  if (isStockManaged.value && !stockTrackingEnabled.value) {
    localForm.last_purchase_date = undefined;
    localForm.quantity_purchased = undefined;
    localForm.daily_usage = undefined;
    localForm.unit = undefined;
  }
  emit("submit");
};
</script>