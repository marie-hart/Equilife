<template>
    <v-dialog v-model="editNoteDialogOpen" max-width="420">
      <v-card>
        <v-card-title>Modifier la note</v-card-title>
        <v-card-text>
          <v-textarea v-model="editNoteText" label="Note" rows="4" auto-grow />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="closeEditNote">Annuler</v-btn>
          <v-btn color="primary" variant="flat" @click="saveEditedNote"
            >Enregistrer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DashboardNote } from '../../types/note.js';
import  { saveNotes }  from '../../libs/note'

const notes = ref<DashboardNote[]>([]);
const editNoteDialogOpen = ref(false);
const editNoteId = ref<string | null>(null);
const editNoteText = ref("");

const closeEditNote = () => {
  editNoteDialogOpen.value = false;
  editNoteId.value = null;
  editNoteText.value = "";
};

const saveEditedNote = () => {
  if (!editNoteId.value) return;
  const text = editNoteText.value.trim();
  if (!text) return;
  const nextNotes = notes.value.map((note) =>
    note.id === editNoteId.value ? { ...note, text } : note,
  );
  notes.value = nextNotes;
  saveNotes(nextNotes);
  closeEditNote();
};
</script>