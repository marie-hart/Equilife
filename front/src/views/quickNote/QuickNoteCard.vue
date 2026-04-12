<template>
  <v-col cols="12" class="pa-2">
    <v-card
      rounded="xl"
      elevation="0"
      class="pa-2"
    >

      <!-- Header -->
      <div class="d-flex align-center mb-3">
        <v-icon
          icon="mdi-note-text-outline"
          size="20"
          class="mr-2"
          :style="{ color: '#6B4E3D' }"
        />
        <span class="text-subtitle-1 font-weight-medium">
          Note rapide
        </span>
      </div>

      <!-- Zone de saisie -->
      <v-textarea
        v-model="noteText"
        placeholder="Ajouter une petite note…"
        variant="solo"
        bg-color="#F3EFEA"
        rounded="lg"
        density="compact"
        auto-grow
        rows="1"
        hide-details
        class="mb-2"
        @keydown.enter.prevent
      />

      <!-- Bouton -->
      <v-btn
        block
        rounded="xl"
        height="40"
        class="text-none"
        :style="{
          backgroundColor: '#2E4B36',
          color: '#FFFFFF'
        }"
        @click="$emit('save')"
      >
        Ajouter la note
      </v-btn>

      <v-divider class="my-3" />

      <!-- Notes existantes -->
      <v-list
        v-if="notes.length"
        density="compact"
        class="pa-0"
        style="background-color: transparent"
      >
        <v-list-item
          v-for="note in notes"
          :key="note.id"
          rounded="lg"
          class="mb-2"
          :style="{ backgroundColor: '#F3EFEA' }"
        >
          <v-list-item-title class="text-body-2">
            {{ note.text }}
          </v-list-item-title>

          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            {{ formatDateLong(note.createdAt) }}
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              icon="mdi-pencil-outline"
              size="x-small"
              variant="text"
              @click="$emit('edit', note)"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="$emit('delete', note.id)"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- Empty state -->
      <div
        v-else
        class="text-caption text-medium-emphasis text-center py-3"
      >
        Aucune note pour le moment
      </div>

    </v-card>
  </v-col>
</template>
  

<script setup lang="ts">
import { computed } from "vue";
import { formatDateLong } from "@/libs/date";
import type { DashboardNote } from "@/types/note";

const props = defineProps<{
    modelValue: string;
    notes: DashboardNote[];
}>();

const emit = defineEmits(["update:modelValue", "save", "edit", "delete"]);

const noteText = computed({
    get: () => props.modelValue,
    set: (value: string) => {
        emit("update:modelValue", value);
    },
});
</script>
