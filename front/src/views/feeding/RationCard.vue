<template>
    <v-card variant="outlined" class="pa-3">
        <div class="d-flex align-center justify-space-between mb-3">
            <div>
                <div class="text-h6">{{ ration.name }}</div>
                <div class="text-caption text-grey">
                    Cheval : {{ horseName }}
                </div>
            </div>

            <v-menu>
                <template #activator="{ props: menuProps }">
                    <v-btn
                        icon="mdi-dots-vertical"
                        v-bind="menuProps"
                        variant="text"
                    />
                </template>
                <v-list density="compact">
                    <v-list-item @click="emit('share', ration)">
                        <v-list-item-title>Partager</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="emit('edit', ration)">
                        <v-list-item-title>Modifier</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item class="text-red" @click="confirmDelete = true">
                        <v-list-item-title>Supprimer</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>

        <v-expansion-panels variant="accordion">
            <v-expansion-panel
                v-for="meal in meals"
                v-show="meal.items.length"
                :key="meal.key"
            >
                <v-expansion-panel-title>
                    {{ meal.label }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-list v-if="meal.items.length" density="compact">
                        <v-list-item v-for="item in meal.items" :key="item.id">
                            <v-list-item-title>{{
                                item.name
                            }}</v-list-item-title>
                            <v-list-item-subtitle>
                                {{ item.subtitle }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                    <div v-else class="text-caption text-grey">
                        Aucun aliment
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-dialog v-model="confirmDelete" max-width="360">
            <v-card>
                <v-card-title>Supprimer la ration</v-card-title>
                <v-card-text>Cette action est définitive.</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="outlined" @click="confirmDelete = false"
                        >Annuler</v-btn
                    >
                    <v-btn
                        color="error"
                        variant="elevated"
                        @click="confirmAndDelete"
                    >
                        Supprimer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Ration, RationItem } from "@/types";

type MealKey = "matin" | "midi" | "soir";

type MealItem = {
    id: string;
    name: string;
    subtitle: string;
};

type MealGroup = {
    key: MealKey;
    label: string;
    items: MealItem[];
};

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
