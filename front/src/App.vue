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
      <Header class="mobile-header-fix" />
      <v-main class="main-content-fix">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-main>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { registerSW } from "virtual:pwa-register";
// @ts-ignore Vue SFC default export is provided by vue-tsc
import Header from "@/views/header/TheHeader.vue";
import { startReminderNotifications } from "@/utils/notifications";
import { useHorsesStore } from "@/stores/HorsesStore";

const isAppReady = ref(false);
const horsesStore = useHorsesStore();

onMounted(async () => {
    registerSW({
        immediate: true,
        onNeedRefresh() {
            window.location.reload();
        },
    });
    try {
    await horsesStore.loadHorses();
    setTimeout(() => {
      isAppReady.value = true;
    }, 1500);
    
  } catch (error) {
    console.error("Erreur au chargement:", error);
    isAppReady.value = true; 
  }
    startReminderNotifications();
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
body,
#app,
.v-application,
.v-application__wrap,
.v-main,
.v-main__wrap {
    background-color: #f3eadf !important;
}

#app {
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    padding-bottom: 15px;
}

@supports (-webkit-touch-callout: none) {
    #app {
        min-height: -webkit-fill-available;
    }
}

@media (min-width: 1024px) {
    #app {
        padding-bottom: 0;
    }
}
</style>
