<template>
  <v-app class="safe-layout">
    <transition name="splash-fade">
      <div v-if="!isAppReady" class="splash-screen">
        <div class="splash-content">
          <v-img
            src="/splash-logo.png" 
            width="120"
            height="120"
            class="splash-logo"
          />
        </div>
      </div>
    </transition>

    <template v-if="isAppReady">
      <template v-if="!isLoginRoute">
        <Header class="mobile-header-fix" />
      </template>
      <v-main scrollable class="main-content-fix" id="main-scroll">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <div class="route-page">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </v-main>
    </template>
  </v-app>
</template>

<script setup lang="ts">
/// <reference path="./pwa-register.d.ts" />
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { registerSW } from "virtual:pwa-register";
// @ts-ignore Vue SFC default export is provided by vue-tsc
import Header from "@/views/header/TheHeader.vue";
import { startReminderNotifications } from "@/utils/notifications";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useAuthStore } from "@/stores/AuthStore";
import { logger } from "@/services/LoggerService";

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const isLoginRoute = computed(
    () => route.name === "Login" || route.name === "Register",
);
const authStore = useAuthStore();

const isAppReady = ref(false);
const horsesStore = useHorsesStore();

const handleUnauthorized = () => {
    authStore.logout();
    router.replace({ name: "Login" });
};

onMounted(async () => {
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    registerSW({
        immediate: true,
        onNeedRefresh() {
            window.location.reload();
        },
    });

    const needLogin = await authStore.checkAuthStatus();
    if (needLogin && !authStore.isAuthenticated) {
        router.replace({ name: "Login" });
        isAppReady.value = true;
        return;
    }
    try {
    await horsesStore.loadHorses();
    setTimeout(() => {
      isAppReady.value = true;
    }, 1500);
    
  } catch (error) {
    logger.error("Erreur au chargement:", error);
    isAppReady.value = true; 
  }
    startReminderNotifications();
    notificationStore.checkCurrentPermission();
});

onUnmounted(() => {
    window.removeEventListener("auth:unauthorized", handleUnauthorized);
});
</script>

<style>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f3eadf;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; 
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.splash-logo {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.splash-fade-leave-active {
  transition: all 0.5s ease-in-out;
}
.splash-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

html,
body {
    overflow: hidden;
    height: 100%;
    margin: 0;
    /* Évite le délai 300ms et le double-tap requis sur mobile */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}

/* Zones tactiles réactives (boutons, liens, cartes cliquables) */
button,
a,
[role="button"],
.v-btn,
.v-list-item,
.v-list-item--link {
    touch-action: manipulation;
}

html,
body,
#app,
.v-application,
.v-application__wrap,
.v-main,
.v-main__wrap,
.v-main__scroller {
    background-color: #f3eadf !important;
}

/* Permet au contenu flex de gérer correctement le scroll (évite espace vide) */
.v-main {
    min-height: 0;
}

/* Remplit l'espace visible sans forcer un scroll inutile (100vh créait du défilement vide) */
.route-page {
    min-height: 100%;
}
.route-page > * {
    min-height: 100%;
}

#app {
    min-height: 100%;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
}

/* Barre de navigation en bas avec léger espace (mobile) */
.bottom-nav-fix.v-bottom-navigation {
    margin-bottom: 0 !important;
    bottom: 14px !important;
}

@supports (-webkit-touch-callout: none) {
    #app {
        min-height: -webkit-fill-available;
    }
}
</style>
