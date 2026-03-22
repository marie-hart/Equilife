<template>
    <div>
      <v-bottom-navigation
        v-if="!lgAndUp"
        :key="`${route.path}-${horsesStore.horseId}`"
        v-model="activeTab"
        @update:model-value="activeTab = $event"
        class="mx-4 pa-1 bottom-nav-fix" 
        rounded="pill"
        style="width: calc(100% - 32px)"
        app
        grow
        mandatory
      >
        <v-btn
          v-for="item in bottomNavItems"
          rounded="xl"
          :key="item.tab"
          :value="item.tab"
          :to="getRoute(item)"
          active-class=""
          exact-active-class=""
        >
          <font-awesome-icon :icon="item.icon" />
          <span class="text-caption">{{ item.label }}</span>
        </v-btn>
      </v-bottom-navigation>
  
      <v-navigation-drawer
        v-else
        app
        temporary
        location="left"
        :model-value="isMoreOpen"
        style="border-right: none !important;"
      >
        <v-list nav>
          <v-list-item
            v-for="item in navItems"
            :key="item.tab"
            :to="getRoute(item)"
          >
            <template #prepend>
              <font-awesome-icon :icon="item.icon" />
            </template>
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </div>
  </template>
  
<script setup lang="ts">
  import { computed, watch, ref } from "vue";
  import { useDisplay } from "vuetify";
  import type { NavItem, NavTab } from "@/types";
  import { useHorsesStore } from "@/stores/HorsesStore"
  import { useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';

  const horsesStore = useHorsesStore();
  const route = useRoute();
  const { horseId } = storeToRefs(useHorsesStore());
  
  const props = defineProps<{
    navItems: NavItem[];
    isMoreOpen: boolean;
  }>();
  
  const { mdAndUp, lgAndUp } = useDisplay();
  
  const getItem = (tab: NavTab) =>
    props.navItems.find((item) => item.tab === tab);
  
  const bottomNavItems = computed(() => {
    const items: NavItem[] = [];
  
    ["dashboard", 'health', "products", "horses"].forEach((tab) => {
      const item = getItem(tab as NavTab);
      if (item) items.push(item);
    });
  
    if (mdAndUp.value) {
      ["activities", "feeding"].forEach((tab) => {
        const item = getItem(tab as NavTab);
        if (item) items.push(item);
      });
    }

    return items;
  });

 
  const activeTab = ref('dashboard');

  const updateActiveTab = () => {
    const name = route.name as string;
    if (!name) return;

    const mapping: Record<string, string> = {
      'Dashboard': 'dashboard',
      'Health': 'health',
      'Product': 'products',
      'Horse': 'horses'
    };

    for (const [routePart, tabValue] of Object.entries(mapping)) {
      if (name.includes(routePart)) {
        activeTab.value = tabValue;
        break;
      }
    }
  };

  watch(() => route.fullPath, updateActiveTab, { immediate: true });

  watch(horseId, () => {
    updateActiveTab();
  });

  const isHorseIdReady = computed(() => {
    return horsesStore.horseId && horsesStore.horseId !== "all";
  });

  const getRoute = (item: NavItem) => {
    if (item.tab === "horses") {
      return { name: item.routeName };
    }
    if (!isHorseIdReady.value) {
      return { name: "Horses" };
    }
    return { name: item.routeName };
  };
</script>
