<template>
  <v-card
    rounded="xl"
    variant="flat"
    class="pa-4"
  >
    <div class="d-flex align-start ga-4">

      <!-- Avatar -->
      <v-avatar size="56">
        <v-img
          v-if="horseAvatar"
          :src="horseAvatar"
          cover
        />
        <v-icon v-else size="32">mdi-horse</v-icon>
      </v-avatar>

      <!-- Infos cheval -->
      <div class="flex-grow-1">

        <!-- Nom + switcher -->
        <div class="d-flex align-center ga-2">
          <h3 class="text-h6 font-weight-medium">
            {{ horseProfile?.name || "Mon cheval" }}
          </h3>

          <v-menu v-if="showHorseSwitcher" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="x-small"
                variant="text"
              >
                <v-icon size="18">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list density="compact">
              <v-list-item
                v-for="horse in horses"
                :key="horse.id"
                @click="emit('select', horse)"
              >
                <v-list-item-title>
                  {{ horse.name }}
                </v-list-item-title>

                <template #append>
                  <v-icon
                    v-if="horse.id === selectedHorseId"
                    size="16"
                    color="primary"
                  >
                    mdi-check
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Chips -->
        <div class="d-flex ga-2 mt-2 flex-wrap">
          <v-chip
            v-if="horseProfile?.age"
            size="small"
            variant="tonal"
          >
            {{ horseProfile.age }} ans
          </v-chip>

          <v-chip
            v-if="horseProfile?.breed"
            size="small"
            variant="tonal"
          >
            {{ horseProfile.breed }}
          </v-chip>
        </div>

      </div>
    </div>
  </v-card>
</template>

  

<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "@/types";

const props = defineProps<{
  horseProfile: Horse | null;
  horses: Horse[];
}>();

const emit = defineEmits<{
  (event: "select", horse: Horse): void;
}>();

const normalizePhotoUrl = (path?: string): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  if (path.startsWith("/")) return path;
  
  return path;
};

const horseAvatar = computed(() =>
  normalizePhotoUrl(props.horseProfile?.photo_path)
);

const showHorseSwitcher = computed(() => props.horses.length > 1);
const selectedHorseId = computed(() => props.horseProfile?.id ?? null);
</script>

  