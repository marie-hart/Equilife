<template>
    <div>
      <!-- HEADER -->
      <v-app-bar app flat height="72" color="#909185">
        <!-- DESKTOP : menu burger -->
        <v-app-bar-nav-icon
          v-if="lgAndUp"
          color="white"
          @click="isMoreOpen = !isMoreOpen"
        />
  
        <!-- MOBILE : logo à gauche -->
        <img
          v-if="!lgAndUp"
          src="/logo-equilife.png"
          alt="EquiLife"
          height="50"
          class="ml-3"
        />
  
        <v-spacer />
  
        <!-- DESKTOP : logo centré -->
        <img
          v-if="lgAndUp"
          src="/logo-equilife.png"
          alt="EquiLife"
          height="50"
        />
  
        <v-spacer />
  
        <!-- Notifications -->
        <v-btn icon="mdi-bell-outline" variant="text" color="white" />
      </v-app-bar>
  
      <!-- NAVIGATION -->
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
  import type { Horse } from "@/types";
  import { HeaderNavigation } from "./index";
  import type { NavItem } from "@/types";

  const router = useRouter();
  const { lgAndUp } = useDisplay();

  /* STATE */
  const horseProfile = ref<Horse | null>(null);
  const isMoreOpen = ref(false);
  
  /* NAV ITEMS */
  const navItems: NavItem[] = [
    { tab: "dashboard", label: "Accueil", routeName: "HorseDashboardView", icon: "house" },
    { tab: "reminders", label: "Rappels", routeName: "Reminders", icon: "bell" },
    { tab: "health", label: "Soins", routeName: "HorseHealth", icon: "house-chimney-medical" },
    { tab: "activities", label: "Activités", routeName: "HorseActivities", icon: "heart-pulse" },
    { tab: "feeding", label: "Alimentation", routeName: "HorseFeeding", icon: "bowl-food" },
    // { tab: "documents", label: "Documents", routeName: "HorseDocuments", icon: "file-lines", },
    { tab: "products", label: "Produits", routeName: "HorseProducts", icon: "box-open" },
    { tab: "horses", label: "Chevaux", routeName: "Horses", icon: "horse" },
  ];
  
  /* NAVIGATION */
  const navigate = (name: NavItem["routeName"]) => {
    if (name === "Reminders") {
        router.push({ name });
        return;
    }
    
    if (name === "Horses") {
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
  