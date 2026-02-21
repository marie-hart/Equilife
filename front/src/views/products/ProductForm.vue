<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row dense>

      <!-- NOM -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localForm.name"
          label="Nom *"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          :error-messages="errors.name"
        />
      </v-col>

      <!-- TYPE -->
      <v-col cols="12" md="6">
        <v-select
          v-model="localForm.type"
          :items="typeOptions"
          label="Type *"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          :error-messages="errors.type"
        />
      </v-col>

      <!-- MARQUE -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localForm.brand"
          label="Marque"
          density="comfortable"
          variant="outlined"
          rounded="lg"
        />
      </v-col>

      <!-- ================= STOCK SECTION ================= -->
      <template v-if="isStockManaged">

        <v-col cols="12">
          <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">
            Gestion du stock
          </div>
        </v-col>

        <!-- DATE -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="localForm.purchase_date"
            label="Date de réception *"
            type="date"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            :error-messages="errors.purchase_date"
          />
        </v-col>

        <!-- QUANTITE -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="localForm.quantity_purchased"
            label="Quantité achetée *"
            type="number"
            min="0"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            :error-messages="errors.quantity_purchased"
          />
        </v-col>

        <!-- CONSOMMATION -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="localForm.daily_usage"
            label="Consommation / jour *"
            type="number"
            min="0"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            :error-messages="errors.daily_usage"
          />
        </v-col>

        <!-- UNITE -->
        <v-col cols="12" md="4">
          <v-select
            v-model="localForm.unit"
            :items="unitOptions"
            label="Unité"
            density="comfortable"
            variant="outlined"
            rounded="lg"
          />
        </v-col>

      </template>

      <!-- NOTE -->
      <v-col cols="12">
        <v-textarea
          v-model="localForm.note"
          label="Note"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          rows="3"
        />
      </v-col>

    </v-row>

    <!-- ACTIONS -->
    <div class="d-flex justify-end mt-4 ga-2">
      <v-btn
        v-if="showCancel"
        variant="outlined"
        rounded="lg"
        @click="$emit('cancel')"
      >
        Annuler
      </v-btn>

      <v-btn
        variant="flat"
        :style="{ backgroundColor: '#554338', color: 'white' }"
        rounded="lg"
        :loading="loading"
        type="submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>

  </v-form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { Product } from "@/types";

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
  () => localForm,
  () => emit("update:modelValue", { ...localForm }),
  { deep: true }
);

const STOCK_TYPES = ["Granulés", "Complément"];

const isStockManaged = computed(() =>
  STOCK_TYPES.includes(localForm.type || "")
);

const typeOptions = [
  "Granulés",
  "Complément",
  "Friandises",
  "Équipement",
  "Pharmacie",
  "Autres"
];

const unitOptions = ["kg", "L", "g"];

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k]);

  if (!localForm.name) errors.name = ["Champ obligatoire"];
  if (!localForm.type) errors.type = ["Champ obligatoire"];

  if (isStockManaged.value) {
    if (!localForm.purchase_date)
      errors.purchase_date = ["Champ obligatoire"];

    if (!localForm.quantity_purchased)
      errors.quantity_purchased = ["Champ obligatoire"];

    if (!localForm.daily_usage)
      errors.daily_usage = ["Champ obligatoire"];
  }

  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  emit("submit");
};
</script>