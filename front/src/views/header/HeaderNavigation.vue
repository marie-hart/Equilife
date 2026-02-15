<template>
    <div>
      <v-bottom-navigation
        v-if="!lgAndUp"
        class="mx-4 mb-4 pa-1" 
        rounded="pill"
        style="width: calc(100% - 32px)"
        app
        grow
      >
        <v-btn
          v-for="item in bottomNavItems"
          rounded="xl"
          :key="item.tab"
          :value="item.tab"
          :to="getRoute(item)"
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
  import { computed } from "vue";
  import { useDisplay } from "vuetify";
  import type { NavItem, NavTab } from "@/types";
  import { useHorsesStore } from "@/stores/HorsesStore";

  const horsesStore = useHorsesStore();
  
  const props = defineProps<{
    navItems: NavItem[];
    isMoreOpen: boolean;
  }>();
  
  // const emit = defineEmits<{
  //   (e: "navigate", routeName: NavItem["routeName"], params?: Record<string, any>): void;
  //   (e: "update:isMoreOpen", value: boolean): void;
  // }>();
  
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

  const isHorseIdReady = computed(() => {
    return horsesStore.horseId && horsesStore.horseId !== "all";
  });

  const getRoute = (item: NavItem) => {
    if (item.tab === "horses") {
      return {name: item.routeName }
    } else {
      if (!isHorseIdReady.value) {
        return;
      }
      return {name: item.routeName, params: { id: horsesStore.horseId }}
    }
  };
</script>
