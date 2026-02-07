<template>
    <div class="horse-profile-card" :style="backgroundStyle">
      <div class="overlay pa-4 d-flex flex-column justify-end">
  
        <!-- Nom + switcher -->
        <div class="d-flex align-center ga-2">
          <h2 class="horse-name">
            {{ horseProfile?.name || "Mon cheval" }}
          </h2>
  
          <v-menu v-if="showHorseSwitcher" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="x-small"
                variant="text"
                color="white"
              >
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
  
            <v-list density="compact">
              <v-list-item
                v-for="horse in horses"
                :key="horse.id"
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
  
        <!-- Infos secondaires -->
        <div class="d-flex ga-2 mt-2 flex-wrap">
          <v-chip
            v-if="horseProfile?.age"
            size="small"
            variant="tonal"
            color="white"
          >
            {{ horseProfile.age }} ans
          </v-chip>
  
          <v-chip
            v-if="horseProfile?.breed"
            size="small"
            variant="tonal"
            color="white"
          >
            {{ horseProfile.breed }}
          </v-chip>
        </div>
  
      </div>
    </div>
  </template>
  

  <script setup lang="ts">
  import { computed } from "vue";
  import type { Horse } from "@/types";
  import { filesBaseUrl } from "@/api/client";
  
  const props = defineProps<{
    horseProfile: Horse | null;
    horses: Horse[];
  }>();
  
  const emit = defineEmits<{
    (event: "select", horse: Horse): void;
  }>();
  
  const profileBackgroundUrl = "/view-wild-horse.jpg";
  
  const resolveFilesOrigin = (): string => {
    if (filesBaseUrl.startsWith("http")) {
      try {
        const url = new URL(filesBaseUrl);
        const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname);
        return isLocal ? window.location.origin : url.origin;
      } catch {
        return window.location.origin;
      }
    }
    return window.location.origin;
  };
  
  const normalizePhotoUrl = (path?: string): string | null => {
    if (!path) return null;
    if (path.startsWith("http")) {
      try {
        const url = new URL(path);
        const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname);
        return isLocal ? `${window.location.origin}${url.pathname}` : path;
      } catch {
        return path;
      }
    }
    if (path.startsWith("/")) return `${resolveFilesOrigin()}${path}`;
    return path;
  };
  
  const backgroundImageUrl = computed(() => {
    return normalizePhotoUrl(props.horseProfile?.photo_path) || profileBackgroundUrl;
  });
  
  const backgroundStyle = computed(() => ({
    backgroundImage: `
      linear-gradient(
        to top,
        rgba(0,0,0,0.55),
        rgba(0,0,0,0.15)
      ),
      url('${backgroundImageUrl.value}')
    `,
  }));
  
  const showHorseSwitcher = computed(() => (props.horses?.length ?? 0) > 1);
  const selectedHorseId = computed(() => props.horseProfile?.id ?? null);
  </script>
  