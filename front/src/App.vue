<template>
    <div id="app">
        <v-app>
            <Header />
            <v-main>
                <router-view v-slot="{ Component }">
                    <component :is="Component" />
                    <slot name="context-left" />
                </router-view>
            </v-main>
        </v-app>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { registerSW } from "virtual:pwa-register";
// @ts-ignore Vue SFC default export is provided by vue-tsc
import Header from "@/views/header/TheHeader.vue";
import { startReminderNotifications } from "@/utils/notifications";

onMounted(() => {
    registerSW({
        immediate: true,
        onNeedRefresh() {
            // Force reload to ensure the latest app shell is used.
            window.location.reload();
        },
    });
    startReminderNotifications();
});
</script>

<style>
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

/* Optimisation pour le viewport mobile */
@supports (-webkit-touch-callout: none) {
    #app {
        min-height: -webkit-fill-available;
    }
}

/* Desktop - retirer le padding bottom */
@media (min-width: 1024px) {
    #app {
        padding-bottom: 0;
    }
}
</style>
