<template>
  <div class="horse-profile-card rounded-xl pa-4" :style="backgroundStyle">
    <div class="horse-profile-overlay d-flex align-center justify-space-between">
      <div class="horse-profile-info">
        <div class="d-flex align-center ga-1 ma-1">
          <div class="horse-profile-name text-white font-weight-bold">
            {{ horseProfile?.name || 'Nom du cheval' }}
          </div>
          <v-menu v-if="showHorseSwitcher" location="bottom">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-chevron-down"
                size="x-small"
                variant="text"
                color="white"
              />
            </template>
            <v-list density="compact" class="py-0">
            <v-list-item
              v-for="horse in horses"
              :key="horse.id"
              :active="horse.id === selectedHorseId"
              @click="emit('select', horse)"
            >
              <v-list-item-title>{{ horse.name }}</v-list-item-title>
              <template #append>
                <v-icon
                  v-if="horse.id === selectedHorseId"
                  size="18"
                  color="primary"
                >
                  mdi-check
                </v-icon>
              </template>
            </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-1">
          <v-chip
            v-if="horseProfile?.age"
            size="small"
            variant="flat"
            color="white"
            class="text-caption ma-1"
          >
            {{ horseProfile.age }} ans
          </v-chip>
          <v-chip
            v-if="horseProfile?.breed"
            size="small"
            variant="flat"
            color="white"
            class="text-caption ma-1"
          >
            {{ horseProfile.breed }}
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Horse } from '../../types'

const props = defineProps<{
  horseProfile: Horse | null
  horses: Horse[]
}>()

const emit = defineEmits<{
  (event: 'select', horse: Horse): void
}>()

const profileBackgroundUrl = '/view-wild-horse.jpg'

const backgroundStyle = computed(() => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('${profileBackgroundUrl}')`,
}))

const showHorseSwitcher = computed(() => (props.horses?.length ?? 0) > 1)

const selectedHorseId = computed(() => props.horseProfile?.id ?? null)
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped>
.horse-profile-card {
  background-position: 65% 20%;
  background-size: 100% auto;
  min-height: 150px;
 
}

.horse-profile-overlay {
  min-height: 82px;
}

.horse-profile-name {
  font-size: 1.15rem;
  line-height: 1.35;
}
</style>
