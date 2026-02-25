<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="safe-area-top pb-10">
    <v-container class="px-4">
      
      <div class="d-flex align-center mb-6 mt-2">
        <v-btn icon="mdi-arrow-left" variant="text" color="#2E4B36" class="me-2" @click="goBack" />
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            {{ isEdit ? "Modifier" : "Nouveau soin" }}
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
      </div>

      <v-card variant="flat" rounded="xl" class="pa-4 shadow-subtle border-light bg-white">
        <v-skeleton-loader v-if="isLoading" type="article, actions" />
        
        <v-form v-else @submit.prevent="handleSubmit">
          <v-row dense>
            <v-col cols="12">
              <div class="text-caption font-weight-bold mb-2 ms-1" style="color: #7B5B3E">IDENTITÉ</div>
              <v-select
                v-model="form.horseIds"
                :items="horseOptions"
                label="Choisir le(s) cheval/chevaux *"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                :multiple="!isEdit"
                chips
                closable-chips
                :error-messages="fieldErrors.horseIds"
              />
            </v-col>
            
            <v-col cols="12">
               <div class="text-caption font-weight-bold mb-2 mt-2 ms-1" style="color: #7B5B3E">DÉTAILS DU SOIN</div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.careDescription"
                label="Type de soin *"
                placeholder="Ex: Maréchal-ferrant, Vaccins..."
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                :error-messages="fieldErrors.careDescription"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="form.productId"
                :items="productOptions"
                label="Produit utilisé (optionnel)"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                clearable
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <DatePickerField
                v-model="form.date"
                label="Date du soin *"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                :error-messages="fieldErrors.date"
              />
            </v-col>
            
            <v-col cols="12" class="mt-2">
              <div class="pa-4 rounded-xl bg-grey-lighten-5 border-light">
                <RecurrenceFields
                  v-model="recurrence"
                  :units="recurrenceUnits"
                  :checkbox-md="12"
                  :fields-md="6"
                />
              </div>
            </v-col>
            
            <v-col cols="12" class="mt-4">
              <v-textarea
                v-model="form.note"
                label="Notes & Observations"
                placeholder="Comment s'est déroulé le soin ? Un conseil du pro ?"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                rows="3"
                hide-details
              />
            </v-col>
          </v-row>
          
          <div class="d-flex flex-column ga-2 mt-8">
            <v-btn
              block
              size="large"
              variant="flat"
              color="#2E4B36"
              rounded="xl"
              class="text-none font-weight-black shadow-subtle"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              {{ isEdit ? "Enregistrer les modifications" : "Enregistrer le soin" }}
            </v-btn>
            
            <v-btn 
              block
              variant="text" 
              color="#554338"
              class="text-none font-weight-bold"
              @click="goBack"
            >
              Annuler
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" elevation="10">
        {{ snackbar.message }}
      </v-snackbar>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { productApi } from "@/api/product";
import type { Product, Event, RecurrenceUnit, CreateEventDto } from "@/types";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { useHorsesStore } from "@/stores/HorsesStore";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore();

const isLoading = ref(true);
const isSubmitting = ref(false);
const products = ref<Product[]>([]);
const event = ref<Event | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });

const isEdit = computed(() => Boolean(route.name === 'HealthEdit'));

const form = ref({
    horseIds: [] as string[],
    productId: "",
    careDescription: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
    note: "",
});

const horseOptions = computed(() =>
    horsesStore.horses.map((horse) => ({ title: horse.name, value: horse.id })),
);

const productOptions = computed(() => {
    const excluded = new Set(["Aliment", "Complément"]);
    return products.value
        .filter((p) => p.is_active && (!p.category || !excluded.has(p.category)))
        .map((p) => ({
            title: `${p.name} ${p.brand ? `(${p.brand})` : ''}`,
            value: p.id
        }));
});

const recurrenceUnits = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];

const recurrence = computed({
    get: () => ({
        isRecurring: form.value.isRecurring,
        recurrenceInterval: form.value.recurrenceInterval,
        recurrenceUnit: form.value.recurrenceUnit,
    }),
    set: (value) => {
        form.value = { ...form.value, ...value };
    },
});

const fillForm = (event: Event) => {
    const hasMonthly = Boolean(event.reminder_interval_months);
    const hasYearly = Boolean(event.reminder_interval_years);
    const hasDaily = Boolean(event.reminder_interval_days);
    
    const recurrenceUnit: RecurrenceUnit = hasYearly ? "years" : hasMonthly ? "months" : "days";
    const recurrenceInterval = hasYearly 
        ? event.reminder_interval_years || 1 
        : hasMonthly ? event.reminder_interval_months || 1 
        : event.reminder_interval_days || 1;

    form.value = {
        horseIds: [event.horse_id || ""],
        productId: event.product_id || "",
        careDescription: event.name || "",
        date: toDateInputValue(event.event_date),
        isRecurring: Boolean(event.reminder_enabled) && (hasMonthly || hasYearly || hasDaily),
        recurrenceInterval,
        recurrenceUnit,
        note: event.description || "",
    };
};

const handleSubmit = async () => {
    try {
        isSubmitting.value = true;

        const localDate = new Date(form.value.date);

    localDate.setHours(12, 0, 0);

        const basePayload = {
            name: form.value.careDescription.trim(),
            event_date: localDate.toISOString(),
            product_id: form.value.productId || undefined, 
            note: form.value.note.trim() || undefined,
            is_care: true,
            
            reminder_enabled: form.value.isRecurring,
            reminder_interval_days: form.value.isRecurring && form.value.recurrenceUnit === 'days' ? form.value.recurrenceInterval : 0,
            reminder_interval_months: form.value.isRecurring && form.value.recurrenceUnit === 'months' ? form.value.recurrenceInterval : 0,
            reminder_interval_years: form.value.isRecurring && form.value.recurrenceUnit === 'years' ? form.value.recurrenceInterval : 0,
        };

        if (isEdit.value) {
            const idToUpdate = route.params.id as string;

            if (!idToUpdate || idToUpdate === "undefined") {
                throw new Error("ID du soin manquant dans l'URL");
            }

            await eventsApi.update(idToUpdate, {
                ...basePayload,
                horse_id: form.value.horseIds[0] 
            });
            
            snackbar.value = { show: true, message: "Soin mis à jour.", color: "success" };
        } else {
            await Promise.all(
                form.value.horseIds.map(horseId => 
                    eventsApi.create({
                        ...basePayload,
                        horse_id: horseId
                    } as CreateEventDto)
                )
            );
            snackbar.value = { show: true, message: "Soin(s) ajouté(s).", color: "success" };
        }

        setTimeout(() => goBack(), 1000);

    } catch (error) {
        console.error("Error saving event:", error);
        snackbar.value = { 
            show: true, 
            message: "Erreur lors de l'enregistrement.", 
            color: "error" 
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    if (horsesStore.horseId && horsesStore.horseId !== 'all') {
        router.push({ name: 'HealthView' });
    } else {
        router.push('/health');
    }
};

const loadProducts = async () => {
    try {
        products.value = await productApi.getAll(false);
    } catch (error) {
        console.error("Error loading products:", error);
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            horsesStore.loadHorses(),
            loadProducts()
        ]);

        if (isEdit.value) {
            const id = route.params.id as string;
            const fetchedEvent = await eventsApi.getById(id);
            event.value = fetchedEvent;
            
            fillForm(fetchedEvent); 
        } else {
            const horseIdFromQuery = route.query.horseId as string;
            if (horseIdFromQuery) {
                form.value.horseIds = [horseIdFromQuery];
            }
        }
    } catch (error) {
        console.error("Erreur au montage:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>