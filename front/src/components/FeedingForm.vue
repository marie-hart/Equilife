<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    {{ pageTitle }}
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
                    
                    <template v-else>
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="form.name"
                                    label="Nom de la ration"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    :error-messages="fieldErrors.name ? [fieldErrors.name] : undefined"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="6">
                                <v-select
                                    :model-value="horsesStore.horseId"
                                    @update:model-value="horsesStore.sethorseId"
                                    :items="horsesStore.horseOptions"
                                    label="Cheval"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    :disabled="isEditMode"
                                    :error-messages="fieldErrors.horseId ? [fieldErrors.horseId] : undefined"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="3">
                                <DatePickerField
                                    v-model="form.startDate"
                                    label="Date de début"
                                    class="rounded-lg"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="3">
                                <DatePickerField
                                    v-model="form.endDate"
                                    label="Date de fin"
                                    class="rounded-lg"
                                />
                            </v-col>
                            
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="form.isActive"
                                    :items="activeOptions"
                                    label="État"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                />
                            </v-col>
                            
                            <v-col cols="12">
                                <v-textarea
                                    v-model="form.note"
                                    label="Notes"
                                    density="comfortable"
                                    variant="outlined"
                                    bg-color="white"
                                    rounded="lg"
                                    rows="2"
                                />
                            </v-col>
                        </v-row>

                        <div class="d-flex align-center justify-space-between ga-2 mt-6 mb-4">
                            <div class="text-subtitle-1 font-weight-bold" :style="{ color: '#3c3226' }">Aliments</div>
                            <v-btn 
                                variant="text" 
                                size="small" 
                                @click="addItem"
                                class="text-none"
                                :style="{ color: '#554338' }"
                            >
                                <v-icon start icon="mdi-plus" />
                                Ajouter un aliment
                            </v-btn>
                        </div>

                        <div class="d-flex flex-column ga-4">
                            <v-card 
                                v-for="(item, index) in form.items"
                                :key="item.key"
                                variant="outlined"
                                rounded="lg"
                                class="pa-4"
                                :style="{ borderColor: '#efe5d9', backgroundColor: '#fdfaf6' }"
                            >
                                <v-row dense>
                                    <v-col cols="12" md="4">
                                        <v-select
                                            v-model="item.productId"
                                            :items="productOptions"
                                            label="Produit"
                                            density="comfortable"
                                            variant="outlined"
                                            bg-color="white"
                                            rounded="lg"
                                        />
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field
                                            v-model="item.quantity"
                                            label="Quantité"
                                            density="comfortable"
                                            variant="outlined"
                                            bg-color="white"
                                            rounded="lg"
                                        />
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-select
                                            v-model="item.frequency"
                                            :items="frequencyOptions"
                                            label="Fréquence"
                                            density="comfortable"
                                            variant="outlined"
                                            bg-color="white"
                                            rounded="lg"
                                            multiple
                                            chips
                                        />
                                    </v-col>
                                    <v-col cols="12" md="2">
                                        <v-select
                                            v-model="item.type"
                                            :items="itemTypeOptions"
                                            label="Type"
                                            density="comfortable"
                                            variant="outlined"
                                            bg-color="white"
                                            rounded="lg"
                                        />
                                    </v-col>
                                </v-row>
                                <div class="d-flex justify-end mt-2">
                                    <v-btn
                                        variant="text"
                                        size="small"
                                        color="error"
                                        prepend-icon="mdi-delete"
                                        @click="removeItem(index)"
                                        class="text-none"
                                    >
                                        Supprimer
                                    </v-btn>
                                </div>
                            </v-card>
                        </div>
                    </template>
                </v-card-text>
                
                <v-card-actions class="justify-end pa-4">
                    <v-btn 
                        variant="outlined" 
                        @click="goBack"
                        rounded="lg"
                        class="text-none"
                        :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    >
                        Annuler
                    </v-btn>
                    <v-btn 
                        variant="flat" 
                        @click="saveRation"
                        rounded="lg"
                        class="text-none"
                        :loading="isSubmitting"
                        :style="{ backgroundColor: '#554338', color: 'white' }"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter, useRoute } from "vue-router";
import { rationsApi } from "@/api/rations";
import { materialsApi } from "@/api/materials";
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
const pageTitle = computed(() => isEditMode.value ? "Modifier la ration" : "Créer une ration");

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

// Options
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
    { title: "Aliment", value: "aliment" },
    { title: "Complément", value: "complement" },
    { title: "Autre", value: "autre" },
];

const productOptions = computed(() => {
    const allowed = new Set(["Aliment", "Complément"]);
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

// Gestion des items
const addItem = () => {
    form.value.items.push({
        key: `${Date.now()}-${Math.random()}`,
        productId: "",
        quantity: "",
        frequency: [],
        type: "aliment",
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

// API
const loadProducts = async () => {
    try {
        products.value = await materialsApi.getAll(false);
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
                type: item.type || "aliment",
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
            start_date: form.value.startDate,
            end_date: form.value.endDate,
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

// Lifecycle
onMounted(async () => {
    isLoading.value = true;
    try {
        await horsesStore.loadHorses();
        
        if (!isEditMode.value) {
            const horseIdFromUrl = route.query.horseId as string;
            if (horseIdFromUrl && horseIdFromUrl !== horsesStore.horseId) {
                horsesStore.sethorseId(horseIdFromUrl);
            }
            resetForm();
        } else {
            await loadRation();
        }
        await loadProducts();
    } finally {
        isLoading.value = false;
    }
});
</script>