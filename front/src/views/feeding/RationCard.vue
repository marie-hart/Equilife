<template>
    <v-card 
        variant="flat" 
        rounded="lg"
        class="pa-4 mb-4"
        :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
    >
        <div class="d-flex align-start justify-space-between mb-4">
            <div>
                <div class="d-flex align-center ga-2">
                    <div class="text-h6 font-weight-bold" :style="{ color: '#3c3226' }">
                        {{ ration.name }}
                    </div>
                    <v-chip 
                        :color="ration.is_active ? 'green' : 'grey'" 
                        size="x-small" 
                        variant="tonal"
                        label
                        class="font-weight-bold"
                    >
                        {{ ration.is_active ? 'Active' : 'Inactive' }}
                    </v-chip>
                </div>
                <div class="text-body-2 text-grey-darken-1">
                    {{ horseName }}
                </div>
            </div>

            <v-menu>
                <template #activator="{ props: menuProps }">
                    <v-btn
                        icon="mdi-dots-vertical"
                        v-bind="menuProps"
                        variant="text"
                        :style="{ color: '#554338' }"
                    />
                </template>
                <v-list density="compact" rounded="lg">
                    <v-list-item @click="emit('share', ration)">
                        <template #prepend><v-icon icon="mdi-share-variant" class="me-2" /></template>
                        <v-list-item-title>Partager</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="emit('edit', ration)">
                        <template #prepend><v-icon icon="mdi-pencil" class="me-2" /></template>
                        <v-list-item-title>Modifier</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item class="text-error" @click="confirmDelete = true">
                        <template #prepend><v-icon icon="mdi-delete" class="me-2" /></template>
                        <v-list-item-title>Supprimer</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>

        <v-expansion-panels variant="accordion" flat>
            <v-expansion-panel
                v-for="meal in meals"
                :key="meal.key"
                :style="{ backgroundColor: '#fdfaf6' }"
                rounded="lg"
                class="mb-2"
                v-show="meal.items.length"
            >
                <v-expansion-panel-title class="font-weight-bold" :style="{ color: '#554338' }">
                    {{ meal.label }}
                    <template #actions>
                        <v-icon color="brown-darken-3" icon="mdi-chevron-down" />
                    </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-list v-if="meal.items.length" density="compact" class="bg-transparent">
                        <v-list-item v-for="item in meal.items" :key="item.id" class="px-0">
                            <v-list-item-title class="font-weight-medium" :style="{ color: '#3c3226' }">
                                {{ item.name }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-caption">
                                {{ item.subtitle }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                    <div v-else class="text-caption text-grey pa-2">
                        Aucun aliment
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-dialog v-model="confirmDelete" max-width="360">
            <v-card rounded="lg">
                <v-card-title class="font-weight-bold" :style="{ color: '#3c3226' }">
                    Supprimer la ration ?
                </v-card-title>
                <v-card-text>Cette action est définitive et ne peut pas être annulée.</v-card-text>
                <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn variant="outlined" rounded="lg" @click="confirmDelete = false">
                        Annuler
                    </v-btn>
                    <v-btn color="error" variant="flat" rounded="lg" @click="confirmAndDelete">
                        Supprimer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { MealGroup, MealItem, MealKey, Ration, RationItem } from "@/types";

const props = defineProps<{
    ration: Ration;
    horseName: string;
    getProductName: (productId?: string) => string | undefined;
    itemTypeLabel: (value?: string) => string;
}>();

const emit = defineEmits<{
    (event: "edit", ration: Ration): void;
    (event: "share", ration: Ration): void;
    (event: "delete", ration: Ration): void;
}>();

const confirmDelete = ref(false);

const getItemSubtitle = (item: RationItem): string => {
    const parts = [];
    if (item.quantity) parts.push(item.quantity);
    if (item.type) parts.push(props.itemTypeLabel(item.type));
    return parts.join(" • ") || "-";
};

const normalizeMealItems = (key: MealKey): MealItem[] =>
    props.ration.items
        .filter((item) => item.frequency.includes(key))
        .map((item) => ({
            id: item.id,
            name: props.getProductName(item.product_id) || "Produit",
            subtitle: getItemSubtitle(item),
        }));

const meals = computed<MealGroup[]>(() => [
    { key: "matin", label: "Matin", items: normalizeMealItems("matin") },
    { key: "midi", label: "Midi", items: normalizeMealItems("midi") },
    { key: "soir", label: "Soir", items: normalizeMealItems("soir") },
]);

const confirmAndDelete = () => {
    confirmDelete.value = false;
    emit("delete", props.ration);
};
</script>