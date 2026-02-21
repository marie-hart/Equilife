<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    {{ isEdit ? "Modifier le soin" : "Ajouter un soin" }}
                </v-card-title>
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
                                variant="outlined" 
                                rounded="lg"
                                class="mr-2"
                                @click="goBack"
                            >
                                Annuler
                            </v-btn>
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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { productApi } from "@/api/product";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Product, Event, RecurrenceUnit, CreateEventDto } from "@/types";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { useHorsesStore } from "@/stores/HorsesStore";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore(); // Initialisation du Store

// État
const isLoading = ref(true);
const isSubmitting = ref(false);
const products = ref<Product[]>([]);
const event = ref<Event | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });

const eventId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => Boolean(route.name === 'HealthEdit'));

// Formulaire
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

// Logique Métier
const loadData = async () => {
    isLoading.value = true;
    try {
        await horsesStore.loadHorses(); // Chargement via le store
        await productApi.getAll(false).then(res => products.value = res);
        
        if (isEdit.value && eventId.value) {
            const event = await eventsApi.getById(eventId.value);
            fillForm(event);
        } else {
            // Initialisation création: logique du composable répliquée
            const horseIdFromUrl = route.params.id as string;
            if (horseIdFromUrl) {
                form.value.horseIds = [horseIdFromUrl];
            } else if (horsesStore.horseId && horsesStore.horseId !== "all") {
                form.value.horseIds = [horsesStore.horseId];
            }
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
    // 1. Validation des champs
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseIds", label: "au moins un cheval", value: form.value.horseIds },
        { key: "careDescription", label: "une description", value: form.value.careDescription.trim() },
        { key: "date", label: "une date", value: form.value.date },
    ]);

    fieldErrors.value = errors;

    if (firstError) {
        snackbar.value = { show: true, message: firstError, color: "error" };
        return;
    }

    try {
        isSubmitting.value = true;

        // Préparation du payload commun
        const basePayload = {
            name: form.value.careDescription.trim(),
            event_date: fromDateInputValue(form.value.date),
            product_id: form.value.productId || undefined, 
            note: form.value.note.trim() || undefined,
            
            // Correction des noms de propriétés ici :
            reminder_enabled: recurrence.value.isRecurring,
            reminder_interval_value: recurrence.value.recurrenceInterval || undefined,
            reminder_interval_unit: recurrence.value.recurrenceUnit || undefined,
        };

        if (isEdit.value) {
            // Mode édition : on met à jour un seul soin
            const eventId = route.params.eventId as string;
            await eventsApi.update(eventId, {
                ...basePayload,
                horse_id: form.value.horseIds[0] // En édition, un seul cheval
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
            snackbar.value = { 
                show: true, 
                message: `${form.value.horseIds.length > 1 ? 'Soins ajoutés' : 'Soin ajouté'}.`, 
                color: "success" 
            };
        }

        // Petit délai pour laisser l'utilisateur voir le message de succès
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
    // On retourne à la vue santé du cheval (ou à la liste globale)
    if (horsesStore.horseId && horsesStore.horseId !== 'all') {
        router.push({ name: 'HealthView', params: { id: horsesStore.horseId } });
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

const loadEvent = async () => {
    try {
        const id = route.params.id as string;
        event.value = await eventsApi.getById(id);
    } catch (error) {
        console.error("Error loading event:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            horsesStore.loadHorses(),
            loadProducts()
        ]);

        const horseIdFromQuery = route.query.horseId as string;
        if (horseIdFromQuery && !isEdit.value) {
            form.value.horseIds = [horseIdFromQuery];
        }

        if (isEdit.value) {
            await loadEvent(); 
        }
    } finally {
        isLoading.value = false;
    }
});
</script>