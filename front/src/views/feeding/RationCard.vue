<template>
  <v-card variant="flat" rounded="xl" color="white" class="pa-4 mb-4 shadow-subtle border-light">
    <div class="d-flex align-start justify-space-between mb-2">
      <div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <h3 class="text-h6 font-weight-bold" style="color: #2E4B36;">
            {{ ration.name }}
          </h3>
          <v-chip 
            :color="ration.is_active ? '#2E4B36' : '#A89F94'" 
            size="x-small" 
            variant="flat"
            theme="dark"
            class="font-weight-black"
          >
            {{ ration.is_active ? 'ACTIVE' : 'INACTIVE' }}
          </v-chip>
        </div>
        <div class="text-caption font-weight-bold mt-1" style="color: #7B5B3E">
          <v-icon size="14" class="me-1">mdi-horse</v-icon>{{ horseName }}
        </div>
      </div>

      <ActionButtons
        mode="auto"
        button-size="small"
        menu-button-size="small"
        variant="text"
        color="#A89F94"
        :actions="getRationActions(ration)"
      />
    </div>

    <v-expansion-panels variant="accordion" flat class="mt-4">
      <v-expansion-panel
        v-for="meal in meals"
        :key="meal.key"
        v-show="meal.items.length"
        class="mb-2 custom-panel"
        rounded="lg"
      >
        <v-expansion-panel-title class="py-3">
          <template #default="{ expanded }">
            <div class="d-flex align-center w-100">
              <v-avatar size="32" :color="expanded ? '#2E4B36' : '#F5EFE6'" class="me-3 transition-swing">
                <v-icon size="18" :color="expanded ? 'white' : '#7B5B3E'">
                  {{ getMealIcon(meal.key) }}
                </v-icon>
              </v-avatar>
              <span class="font-weight-bold" :style="{ color: expanded ? '#2E4B36' : '#554338' }">
                {{ meal.label }}
              </span>
              <v-spacer></v-spacer>
              <v-chip size="x-small" variant="tonal" :color="expanded ? '#2E4B36' : '#A89F94'" class="me-2">
                {{ meal.items.length }} {{ meal.items.length > 1 ? 'ingrédients' : 'ingrédient' }}
              </v-chip>
            </div>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text color="#FDFBF9">
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item v-for="item in meal.items" :key="item.id" class="px-0 py-1 border-b-light">
              <div class="d-flex justify-space-between align-center w-100">
                <div>
                  <div class="text-body-2 font-weight-bold" style="color: #2E4B36">{{ item.name }}</div>
                  <div class="text-caption" style="color: #7B5B3E">{{ item.subtitle }}</div>
                </div>
                <v-icon size="16" color="#D1C7BC">mdi-shaker-outline</v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <ConfirmDeleteDialog
      v-model="confirmDelete"
      title="Supprimer la ration ?"
      message="Cette action est définitive."
      @confirm="confirmAndDelete"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ActionButtons, ConfirmDeleteDialog } from "@/components";
import type { MealGroup, MealItem, MealKey, Ration, RationItem } from "@/types";

const props = defineProps<{
    ration: Ration;
    horseName: string;
    getRationActions: (ration: Ration) => any[];
    getProductName: (productId?: string) => string | undefined;
    itemTypeLabel: (value?: string) => string;
}>();

const emit = defineEmits(["delete"]); // On n'émet plus que delete car les autres actions utilisent 'to' ou d'autres callbacks

const confirmDelete = ref(false);

// Expose confirmDelete pour que l'action injectée par le parent puisse l'ouvrir
defineExpose({ openDelete: () => confirmDelete.value = true });

const getMealIcon = (key: string) => {
  const icons: Record<string, string> = { matin: 'mdi-weather-sunset-up', midi: 'mdi-weather-sunny', soir: 'mdi-weather-night' };
  return icons[key] || 'mdi-food';
};

const getItemSubtitle = (item: RationItem): string => {
    const parts = [];
    if (item.quantity) parts.push(`${item.quantity}kg`);
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