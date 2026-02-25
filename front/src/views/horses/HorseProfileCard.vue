<template>
  <v-card
    rounded="xl"
    variant="flat"
    class="pa-4"
  >
    <div class="d-flex align-start ga-4">

     <v-avatar size="80">
        <v-img
          :src="selectedHorse?.photoBase64 || selectedHorse?.photo_path || '/avatar.jpg'"
          cover
        />
      </v-avatar>

      <div class="flex-grow-1">
        <div class="d-flex align-center ga-2">
          <h3 class="text-h6 font-weight-medium">
            {{ selectedHorse?.name || "Mon cheval" }}
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
                v-for="horse in horsesStore.horses"
                :key="horse.id"
                @click="horsesStore.sethorseId(horse.id)"
              >
                <template #prepend> 
                  <v-avatar size="32" class="me-2"> 
                    <v-img :src="horse.photoBase64 || horse.photo_path || '/avatar.jpg'" cover /> 
                  </v-avatar> 
                </template> 
                <v-list-item-title>
                  {{ horse.name }}
                </v-list-item-title>

                <template #append>
                  <v-icon
                    v-if="horse.id === horsesStore.horseId"
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

        <div class="d-flex ga-2 mt-2 flex-wrap">
          <v-chip
            v-if="selectedHorse?.age"
            size="small"
            variant="tonal"
          >
            {{ selectedHorse.age }} ans
          </v-chip>

          <v-chip
            v-if="selectedHorse?.breed"
            size="small"
            variant="tonal"
          >
            {{ selectedHorse.breed }}
          </v-chip>
        </div>

      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHorsesStore } from "@/stores/HorsesStore";

const horsesStore = useHorsesStore();

const selectedHorse = computed(() => horsesStore.selectedHorse);

const showHorseSwitcher = computed(() => horsesStore.horses.length > 1);
</script>