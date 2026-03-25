<template>
    <div>
      <v-app-bar 
        app 
        flat 
        color="#f3eadf" 
        height="56"
        style="border-bottom: none !important;"
      >
        <div class="d-flex align-center gap-1 shadow-none ms-2" style="flex: 1;">
          <v-btn
            v-if="showAccountEntry"
            icon
            variant="text"
            color="grey-darken-3"
            aria-label="Compte"
            @click="accountSheetOpen = true"
          >
            <v-icon icon="mdi-account-circle" size="28" />
          </v-btn>
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
  
        <div class="d-flex justify-end align-center me-3" style="flex: 1;">
          <NotificationBell />
        </div>
      </v-app-bar>

      <AccountMobileSheet v-model="accountSheetOpen" />

      <HeaderNavigation
        :nav-items="navItems"
        :is-more-open="isMoreOpen"
        @navigate-horse="navigate"
        @update:isMoreOpen="isMoreOpen = $event"
      />
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import type { NavItem } from "@/types";
import { useAuthStore } from "@/stores/AuthStore";
import { HeaderNavigation } from "./index";
import NotificationBell from "@/components/NotificationBell.vue";
import AccountMobileSheet from "@/components/account/AccountMobileSheet.vue";

const router = useRouter();
const { lgAndUp } = useDisplay();
const authStore = useAuthStore();
const { authMode, isAuthenticated } = storeToRefs(authStore);
const isMoreOpen = ref(false);
const accountSheetOpen = ref(false);

const showAccountEntry = computed(
    () => !lgAndUp.value && authMode.value === "user" && isAuthenticated.value,
);

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
  router.push({ name });
};
</script>