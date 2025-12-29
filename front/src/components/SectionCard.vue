<template>
  <v-card class="card section-card" variant="outlined">
    <v-card-title :class="['section-title', { 'section-title-row': showAdd }]">
      <div class="title-content">
        <font-awesome-icon :icon="icon" class="fa-icon" />
        <span>{{ title }}</span>
      </div>
    </v-card-title>
    <v-divider class="section-divider" />
    <v-card-text class="section-content">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  showAdd?: boolean
  addIcon?: string
}>()
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
