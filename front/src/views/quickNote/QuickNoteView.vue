<template>
    <div>
        <QuickNoteCard
            v-model="quickNote"
            :notes="notes"
            @save="saveQuickNote"
            @edit="openEditNote"
            @delete="deleteNote"
        />

        <QuickNoteDialog
            v-model="editNoteDialogOpen"
            :text="editNoteText"
            @update:text="editNoteText = $event"
            @save="saveEditedNote"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { saveNotes, loadNotes } from "@/libs/note";
import { logger } from "@/services/LoggerService";
import type { DashboardNote } from "@/types/note";
import { QuickNoteCard, QuickNoteDialog } from "./";

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
        logger.warn("Unable to clear quick note:", error);
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

onMounted(() => {
    try {
        quickNote.value = localStorage.getItem("dashboardQuickNote") || "";
    } catch (error) {
        logger.warn("Unable to load quick note:", error);
    }
    notes.value = loadNotes();
});
</script>
