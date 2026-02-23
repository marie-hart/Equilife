<template>
  <v-card 
    variant="flat" 
    rounded="xl"
    color="white"
    class="pa-4 mb-4 shadow-subtle border-light"
  >
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

      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn icon="mdi-dots-vertical" v-bind="menuProps" variant="text" color="#A89F94" />
        </template>
        <v-list density="compact" rounded="lg">
          <v-list-item @click="emit('share', ration)" prepend-icon="mdi-share-variant">
            <v-list-item-title>Partager</v-list-item-title>
          </v-list-item>
          <v-list-item @click="emit('edit', ration)" prepend-icon="mdi-pencil">
            <v-list-item-title>Modifier</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item @click="confirmDelete = true" prepend-icon="mdi-delete" color="error">
            <v-list-item-title>Supprimer</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
              <v-avatar 
                size="32" 
                :color="expanded ? '#2E4B36' : '#F5EFE6'" 
                class="me-3 transition-swing"
              >
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
          <template #actions>
            <v-icon size="small" color="#A89F94" icon="mdi-chevron-down" />
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text color="#FDFBF9">
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item 
              v-for="item in meal.items" 
              :key="item.id" 
              class="px-0 py-1 border-b-light"
            >
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

    <v-dialog v-model="confirmDelete" max-width="340">
      <v-card color="#F5EFE6" rounded="xl" class="pa-4 text-center">
        <v-card-text>
          <v-avatar color="#F8D7DA" size="64" class="mb-4">
            <v-icon color="#B00020" size="32">mdi-food-off-outline</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold mb-2" style="color: #2E4B36">Supprimer la ration ?</h3>
          <p class="text-body-2 mb-6" style="color: #7B5B3E">Cette action est définitive.</p>
          <v-btn block flat rounded="pill" color="#2E4B36" class="mb-2" @click="confirmDelete = false">Annuler</v-btn>
          <v-btn block variant="text" rounded="pill" color="#B00020" class="font-weight-bold" @click="confirmAndDelete">Supprimer</v-btn>
        </v-card-text>
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

const getMealIcon = (key: string) => {
  const icons: Record<string, string> = { 
    matin: 'mdi-weather-sunset-up', 
    midi: 'mdi-weather-sunny', 
    soir: 'mdi-weather-night' 
  };
  return icons[key] || 'mdi-food';
};

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

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}

.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}

.custom-panel {
  border: 1px solid #F5EFE6 !important;
  overflow: hidden;
}

.custom-panel :deep(.v-expansion-panel-title) {
  min-height: 56px !important;
  background-color: white !important;
}

.border-b-light {
  border-bottom: 1px solid rgba(168, 159, 148, 0.1);
}

.border-b-light:last-child {
  border-bottom: none;
}

.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>