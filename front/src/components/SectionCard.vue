<template>
  <v-card class="card section-card" variant="outlined">
    <v-card-title :class="['section-title', { 'section-title-row': showAdd }]">
      <div class="section-title-row-content">
        <div class="title-content">
          <svg
            v-if="icon === 'alarm-clock'"
            class="fa-icon alarm-clock-icon"
            viewBox="0 0 64 64"
            width="1em"
            height="1em"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <g fill="currentColor">
              <path d="M20 16c-5 2-8 6-9 12l6 2c.7-4.3 3.2-7.2 7-8.8L20 16z" />
              <path d="M44 16c5 2 8 6 9 12l-6 2c-.7-4.3-3.2-7.2-7-8.8L44 16z" />
              <circle cx="32" cy="36" r="18" />
              <rect x="18" y="50" width="8" height="6" rx="3" />
              <rect x="38" y="50" width="8" height="6" rx="3" />
            </g>
            <g fill="#ffffff">
              <rect x="30" y="26" width="4" height="14" rx="2" />
              <rect x="32" y="36" width="10" height="4" rx="2" transform="rotate(45 32 36)" />
            </g>
          </svg>
          <font-awesome-icon v-else :icon="icon" class="fa-icon" />
          <span>{{ title }}</span>
        </div>
        <v-btn
          v-if="showAdd"
          icon="mdi-plus"
          size="small"
          variant="text"
          color="inherit"
          class="section-add-btn"
          @click="emit('add')"
        />
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

const emit = defineEmits<{
  (event: 'add'): void
}>()
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped>
.title-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-add-btn {
  margin-left: auto;
  color: currentColor;
}

.alarm-clock-icon {
  font-size: 1.35em;
  vertical-align: -0.125em;
}
</style>
