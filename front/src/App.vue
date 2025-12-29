<template>
  <div id="app">
    <v-app>
      <Header />
      <v-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </v-main>
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { Header } from '@/components'
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #F2F2F2;
  width: 100%;
  overflow-x: hidden;
  padding-bottom: 70px; /* Espace pour la navigation du bas sur mobile */
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

