<template>
     <v-col cols="12" class="pa-0">
          <SectionCard
            title="Note rapide"
            icon="pen"
            class="dashboard-card--primary"
          >
            <v-textarea
              v-model="quickNote"
              label="Ajouter une note"
              rows="4"
              variant="outlined"
              auto-grow
              @blur="saveQuickNote"
            />
            <div class="d-flex justify-end">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="saveQuickNote"
              >
                Enregistrer
              </v-btn>
            </div>
            <v-divider class="my-4" />
            <v-list
              v-if="notes.length"
              density="compact"
              class="d-flex flex-column ga-2"
            >
              <v-list-item
                v-for="note in notes"
                :key="note.id"
                class="rounded-lg bg-grey-lighten-4 px-3 py-2"
              >
                <v-list-item-title class="text-subtitle-2">{{
                  note.text
                }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey-darken-1">
                  {{ formatDateLong(note.createdAt) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="openEditNote(note)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="deleteNote(note.id)"
                  />
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucune note enregistrée</p>
          </SectionCard>
        </v-col>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { SectionCard } from "../../components/index.js";
import { formatDateLong } from '../../libs/date.js';
import { DashboardNote } from '../../types/note.js';
import { saveNotes, loadNotes } from '../../libs/note';

const quickNote = ref("");
const notes = ref<DashboardNote[]>([]);
const editNoteDialogOpen = ref(false);
const editNoteId = ref<string | null>(null);
const editNoteText = ref("");

const saveQuickNote = () => {
  const text = quickNote.value.trim();
  if (!text) return;

  const nextNotes = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      createdAt: new Date().toISOString(),
    },
    ...notes.value,
  ];
  notes.value = nextNotes;
  saveNotes(nextNotes);
  quickNote.value = "";

  try {
    localStorage.removeItem("dashboardQuickNote");
  } catch (error) {
    console.warn("Unable to clear quick note:", error);
  }
};

const deleteNote = (noteId: string) => {
  const nextNotes = notes.value.filter((note) => note.id !== noteId);
  notes.value = nextNotes;
  saveNotes(nextNotes);
};

const openEditNote = (note: DashboardNote) => {
  editNoteId.value = note.id;
  editNoteText.value = note.text;
  editNoteDialogOpen.value = true;
};

onMounted(async () => {
  try {
    quickNote.value = localStorage.getItem("dashboardQuickNote") || "";
  } catch (error) {
    console.warn("Unable to load quick note:", error);
  }
  notes.value = loadNotes();
});
</script>