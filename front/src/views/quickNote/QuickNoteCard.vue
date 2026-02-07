<template>
    <v-col cols="12" class="pa-0">
      <SectionCard
        title="Note rapide"
        icon="book"
      >
  
        <!-- Zone de saisie -->
        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-4 border-md"
        >
          <v-textarea
            v-model="noteText"
            placeholder="Ajouter une petite note…"
            variant="solo"
            density="comfortable"
            auto-grow
            rows="2"
            hide-details
            @blur="$emit('save')"
          />
  
          <div class="d-flex justify-end mt-3">
            <v-btn
              variant="outlined"
              rounded="lg"
              color="#a4afb5"
              class="text-none"
              :style="{ backgroundColor: '#f6f0ea' }"
              @click="$emit('save')"
            >
              Ajouter la note
            </v-btn>
          </div>
        </v-card>
  
        <v-divider class="my-4" />
  
        <!-- Notes existantes -->
        <v-list
          v-if="notes.length"
          density="compact"
          style="background-color: transparent"
        >
          <v-list-item
            v-for="note in notes"
            :key="note.id"
            variant="tonal"
            rounded="lg"
            class="mb-2"
          >
            <v-list-item-title class="text-body-2">
              {{ note.text }}
            </v-list-item-title>
  
            <v-list-item-subtitle class="text-caption">
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
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="comfortable"
          text="Aucune note pour le moment"
        />
  
      </SectionCard>
    </v-col>
  </template>
  

<script setup lang="ts">
import { computed } from "vue";
import { SectionCard } from "../../components/index.js";
import { formatDateLong } from "../../libs/date.js";
import type { DashboardNote } from "../../types/note.js";

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
