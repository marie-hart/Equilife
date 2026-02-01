<template>
    <div class="page">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5"
                    >Modifier la ration</v-card-title
                >
                <v-btn variant="outlined" @click="goBack">Retour</v-btn>
            </div>
            <v-card class="card" variant="outlined">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="form.name"
                                label="Nom"
                                density="compact"
                                :error-messages="
                                    fieldErrors.name
                                        ? [fieldErrors.name]
                                        : undefined
                                "
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedHorseId"
                                :items="horseOptions"
                                label="Cheval"
                                density="compact"
                                variant="outlined"
                                disabled
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <DatePickerField
                                v-model="form.startDate"
                                label="Date de début"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <DatePickerField
                                v-model="form.endDate"
                                label="Date de fin"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="form.isActive"
                                :items="activeOptions"
                                label="Actif"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea
                                v-model="form.note"
                                label="Note"
                                density="compact"
                                variant="outlined"
                                rows="2"
                            />
                        </v-col>
                    </v-row>

                    <div
                        class="d-flex align-center justify-space-between ga-2 mt-4 mb-2"
                    >
                        <div class="text-subtitle-2">Aliments</div>
                        <v-btn variant="text" size="small" @click="addItem"
                            >+ Aliment</v-btn
                        >
                    </div>
                    <div class="d-flex flex-column ga-2">
                        <div
                            v-for="(item, index) in form.items"
                            :key="item.key"
                        >
                            <v-row dense>
                                <v-col cols="12" md="4">
                                    <v-select
                                        v-model="item.productId"
                                        :items="productOptions"
                                        label="Produit"
                                        density="compact"
                                        variant="outlined"
                                    />
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field
                                        v-model="item.quantity"
                                        label="Quantité"
                                        density="compact"
                                    />
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-select
                                        v-model="item.frequency"
                                        :items="frequencyOptions"
                                        label="Fréquence"
                                        density="compact"
                                        variant="outlined"
                                        multiple
                                        chips
                                    />
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select
                                        v-model="item.type"
                                        :items="itemTypeOptions"
                                        label="Type"
                                        density="compact"
                                        variant="outlined"
                                    />
                                </v-col>
                            </v-row>
                            <div class="d-flex justify-end">
                                <v-btn
                                    variant="text"
                                    size="small"
                                    color="error"
                                    prepend-icon="mdi-delete"
                                    @click="removeItem(index)"
                                >
                                    Supprimer
                                </v-btn>
                            </div>
                            <v-divider class="my-2" />
                        </div>
                    </div>
                    <div class="d-flex justify-space-between align-center">
                        <v-btn
                            variant="elevated"
                            color="primary"
                            size="small"
                            :loading="isSubmitting"
                            @click="saveRation"
                        >
                            Enregistrer
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                timeout="2500"
            >
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { rationsApi } from "@/api/rations";
import { materialsApi } from "@/api/materials";
import { toDateInputValue } from "@/libs/date";
import { DatePickerField } from "@/components";
import { validateRequiredFieldsMap } from "@/utils/validation";
import type { Material, Ration } from "@/types";
import { useHorseSelection } from "@/composables/useHorseSelection";

type RationFormItem = {
    key: string;
    productId: string;
    quantity: string;
    frequency: string[];
    type: "aliment" | "complement" | "autre";
};

const route = useRoute();
const router = useRouter();
const {
    horseOptions,
    selectedHorseId,
    loadHorses,
    getHorseIdsFromQuery,
    setHorseFromQueryOrStored,
} = useHorseSelection({ useRouteHorseId: false });
const materials = ref<Material[]>([]);
const isSubmitting = ref(false);
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

const routeHorseId = computed(() => route.query.horseId as string | undefined);

const productOptions = computed(() => {
    const allowed = new Set(["Aliment", "Complément"]);
    const seen = new Set<string>();
    const hasCategory = materials.value.some((material) =>
        Boolean(material.category),
    );
    return materials.value
        .filter((material) =>
            hasCategory
                ? material.category && allowed.has(material.category)
                : true,
        )
        .filter((material) => {
            const key = material.name?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((material) => ({ title: material.name, value: material.id }));
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
    { title: "Aliment", value: "aliment" },
    { title: "Complément", value: "complement" },
    { title: "Autre", value: "autre" },
];

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

const loadMaterials = async () => {
    try {
        materials.value = await materialsApi.getAll(false);
    } catch (error) {
        console.error("Error loading materials:", error);
    }
};

const loadRation = async () => {
    const rationId = route.params.id as string | undefined;
    if (!rationId) return;
    try {
        const ration: Ration = await rationsApi.getById(rationId);
        selectedHorseId.value = ration.horse_id;
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
        try {
            const fallbackHorseId = routeHorseId.value;
            if (fallbackHorseId) {
                const all = await rationsApi.getAll(fallbackHorseId);
                const fallback = all.find((item) => item.id === rationId);
                if (fallback) {
                    selectedHorseId.value = fallback.horse_id;
                    form.value = {
                        name: fallback.name || "",
                        startDate: toDateInputValue(fallback.start_date),
                        endDate: toDateInputValue(fallback.end_date),
                        note: fallback.note || "",
                        isActive: fallback.is_active,
                        items: fallback.items.map((item) => ({
                            key: `${item.id}-${Math.random()}`,
                            productId: item.product_id || "",
                            quantity: item.quantity || "",
                            frequency: item.frequency || [],
                            type: item.type || "aliment",
                        })),
                    };
                    if (!form.value.items.length) addItem();
                    return;
                }
            }
        } catch (fallbackError) {
            console.error("Error loading ration fallback:", fallbackError);
        }
        snackbar.value = {
            show: true,
            message: "Chargement impossible.",
            color: "error",
        };
    }
};

const saveRation = async () => {
    const rationId = route.params.id as string | undefined;
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "name", label: "un nom", value: form.value.name.trim() },
    ]);
    fieldErrors.value = errors;
    if (!rationId || firstError) {
        snackbar.value = {
            show: true,
            message: firstError ?? "Merci de renseigner un nom.",
            color: "error",
        };
        return;
    }
    const validItems = form.value.items.filter(
        (item) => item.productId || item.quantity || item.frequency.length,
    );
    if (!validItems.length) {
        snackbar.value = {
            show: true,
            message: "Merci d’ajouter au moins un aliment.",
            color: "error",
        };
        return;
    }

    try {
        isSubmitting.value = true;
        await rationsApi.update(rationId, {
            name: form.value.name.trim(),
            start_date: form.value.startDate || undefined,
            end_date: form.value.endDate || undefined,
            note: form.value.note.trim() || undefined,
            is_active: form.value.isActive,
            items: validItems.map((item) => ({
                product_id: item.productId || undefined,
                quantity: item.quantity || undefined,
                frequency: item.frequency,
                type: item.type,
            })),
        });
        snackbar.value = {
            show: true,
            message: "Ration mise à jour.",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error updating ration:", error);
        snackbar.value = {
            show: true,
            message: "Mise à jour impossible.",
            color: "error",
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () => {
    const fallbackHorseId = getHorseIdsFromQuery()[0];
    const horseId =
        selectedHorseId.value || routeHorseId.value || fallbackHorseId;
    if (horseId) {
        router.push({ name: "HorseFeeding", params: { id: horseId } });
        return;
    }
    router.push("/horses");
};

watch(selectedHorseId, () => {
    loadMaterials();
});

onMounted(async () => {
    await loadHorses();
    if (!selectedHorseId.value) {
        setHorseFromQueryOrStored("");
    }
    await loadRation();
    await loadMaterials();
});
</script>
