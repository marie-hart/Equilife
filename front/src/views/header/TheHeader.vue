<template>
    <div>
      <v-app-bar 
        app 
        flat 
        color="#f3eadf" 
        height="56"
        style="border-bottom: none !important;"
      >
        <div class="d-flex align-center shadow-none" style="flex: 1;">
          <v-app-bar-nav-icon
            v-if="lgAndUp"
            color="grey-darken-3"
            @click="isMoreOpen = !isMoreOpen"
          />
        </div>
  
        <div class="d-flex justify-center align-center">
          <img
            src="/equilife.png"
            alt="EquiLife"
            :height="lgAndUp ? 50 : 32"
          />
        </div>
  
        <div class="d-flex justify-end align-center" style="flex: 1;">
          <NotificationBell />
        </div>
      </v-app-bar>
  
      <HeaderNavigation
        :nav-items="navItems"
        :is-more-open="isMoreOpen"
        @navigate-horse="navigate"
        @update:isMoreOpen="isMoreOpen = $event"
      />
    </div>
</template>
  
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import type { Horse, NavItem } from "@/types";
import { HeaderNavigation } from "./index";
import NotificationBell from "@/components/NotificationBell.vue"; 

const router = useRouter();
const { lgAndUp } = useDisplay();

const horseProfile = ref<Horse | null>(null);
const isMoreOpen = ref(false);

const navItems: NavItem[] = [
  { tab: "dashboard", label: "Accueil", routeName: "HorseDashboardView", icon: "house" },
  { tab: "reminders", label: "Rappels", routeName: "Reminders", icon: "bell" },
  { tab: "health", label: "Soins", routeName: "HealthView", icon: "house-chimney-medical" },
  { tab: "activities", label: "Activités", routeName: "HorseActivities", icon: "heart-pulse" },
  { tab: "feeding", label: "Alimentation", routeName: "FeedingView", icon: "bowl-food" },
  { tab: "products", label: "Produits", routeName: "Products", icon: "box-open" },
  { tab: "horses", label: "Chevaux", routeName: "Horses", icon: "horse" },
];

const navigate = (name: NavItem["routeName"]) => {
  if (name === "Reminders" || name === "Horses") {
      router.push({ name });
      return;
  }
  
  const horseId = horseProfile.value?.id;
  if (horseId) {
      router.push({ name, params: { id: horseId } });
      return;
  }
  router.push({ name: "Dashboard" });
};
</script>