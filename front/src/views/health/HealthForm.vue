<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    {{ isEdit ? "Modifier le soin" : "Ajouter un soin" }}
                </v-card-title>
                <v-btn 
                    variant="outlined" 
                    @click="goBack"
                    rounded="lg"
                    class="text-none"
                    :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                >
                    Retour
                </v-btn>
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
                        type="card, list-item-two-line"
                    />
                    <div v-else>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.horseIds"
                                    :items="horseOptions"
                                    label="Chevaux *"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    :multiple="!isEdit"
                                    chips
                                    closable-chips
                                    :error-messages="fieldErrors.horseIds ? [fieldErrors.horseIds] : undefined"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.productId"
                                    :items="productOptions"
                                    label="Produit (soin)"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    clearable
                                />
                            </v-col>
                            
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="form.careDescription"
                                    label="Description du soin *"
                                    placeholder="Ex: Maréchal, Ostéo..."
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    :error-messages="fieldErrors.careDescription ? [fieldErrors.careDescription] : undefined"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="4">
                                <DatePickerField
                                    v-model="form.date"
                                    label="Date *"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    :error-messages="fieldErrors.date ? [fieldErrors.date] : undefined"
                                />
                            </v-col>
                            
                            <RecurrenceFields
                                v-model="recurrence"
                                :units="recurrenceUnits"
                                :checkbox-md="4"
                                :fields-md="4"
                            />
                            
                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.note"
                                    label="Note libre"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    rows="3"
                                />
                            </v-col>
                        </v-row>
                        
                        <div class="d-flex justify-end mt-4">
                            <v-btn
                                variant="flat"
                                :style="{ backgroundColor: '#554338', color: 'white' }"
                                rounded="lg"
                                class="text-none"
                                :loading="isSubmitting"
                                @click="handleSubmit"
                            >
                                {{ isEdit ? "Enregistrer" : "Ajouter" }}
                            </v-btn>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { materialsApi } from "@/api/materials";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Material, Event, RecurrenceUnit, CreateEventDto } from "@/types";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { useHorseSelection } from "@/composables/useHorseSelection";

const route = useRoute();
const router = useRouter();
const { horses, getHorseIdsFromParamsOrStored } = useHorseSelection();

// État
const isLoading = ref(true);
const isSubmitting = ref(false);
const materials = ref<Material[]>([]);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });
const horseId = computed(() => route.params.id as string | undefined);

const eventId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => Boolean(route.name === 'HealthEdit')); // Ajuster selon le nom de la route

// Formulaire
const form = ref({
    horseIds: [] as string[], // Pour la création (multiple), stockera le seul ID en édition
    productId: "",
    careDescription: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
    note: "",
});

// Options
const horseOptions = computed(() =>
    horses.value.map((horse) => ({ title: horse.name, value: horse.id })),
);

const productOptions = computed(() => {
    const seen = new Set<string>();
    return materials.value
        .filter((material) => material.category === "Soin")
        .filter((material) => {
            const key = material.name?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((material) => ({ title: material.name, value: material.id }));
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

// Logique Métier
const loadData = async () => {
    isLoading.value = true;
    try {
        await materialsApi.getAll(false).then(res => materials.value = res);
        
        if (isEdit.value && eventId.value) {
            const event = await eventsApi.getById(eventId.value);
            fillForm(event);
        } else {
            // Initialisation création
            form.value.horseIds = getHorseIdsFromParamsOrStored();
        }
    } catch (error) {
        console.error("Error loading data:", error);
        snackbar.value = { show: true, message: "Erreur de chargement.", color: "error" };
    } finally {
        isLoading.value = false;
    }
};

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
        horseIds: [event.horse_id || ""], // En édition, un seul cheval
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
    const productName = materials.value.find(m => m.id === form.value.productId)?.name?.trim() || "";
    const careName = form.value.careDescription.trim() || productName;
    
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseIds", label: "au moins un cheval", value: form.value.horseIds },
        { key: "careDescription", label: "une description", value: careName },
        { key: "date", label: "une date", value: form.value.date },
    ]);
    
    fieldErrors.value = errors;
    if (firstError) {
        snackbar.value = { show: true, message: firstError, color: "error" };
        return;
    }

    isSubmitting.value = true;
    try {
        const payload: CreateEventDto = {
            horse_id: horseId.value,
            name: careName,
            description: form.value.note || "",
            event_date: fromDateInputValue(form.value.date),
            product_id: form.value.productId || "",
            is_care: true,
            reminder_type: "soin", 
            reminder_enabled: form.value.isRecurring,
            reminder_interval_days: form.value.isRecurring && form.value.recurrenceUnit === "days" ? form.value.recurrenceInterval : 0,
            reminder_interval_months: form.value.isRecurring && form.value.recurrenceUnit === "months" ? form.value.recurrenceInterval : 0,
            reminder_interval_years: form.value.isRecurring && form.value.recurrenceUnit === "years" ? form.value.recurrenceInterval : 0,
        };

        if (isEdit.value && eventId.value) {
            await eventsApi.update(eventId.value, { ...payload, horse_id: form.value.horseIds[0] });
            snackbar.value = { show: true, message: "Soin mis à jour.", color: "success" };
        } else {
            await Promise.all(
                form.value.horseIds.map(horseId => eventsApi.create({ ...payload, horse_id: horseId }))
            );
            snackbar.value = { show: true, message: "Soin(s) créé(s).", color: "success" };
        }
        goBack();
    } catch (error) {
        console.error("Error saving:", error);
        snackbar.value = { show: true, message: "Sauvegarde impossible.", color: "error" };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    const horseId = form.value.horseIds[0];
    if (horseId) {
        router.push({ name: "HorseHealth", params: { id: horseId } });
    } else {
        router.push("/horses");
    }
};

onMounted(loadData);
</script>