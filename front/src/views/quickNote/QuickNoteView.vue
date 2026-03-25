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
import { computed, onMounted, ref, watch } from "vue";
import { saveNotes, loadNotes } from "@/libs/note";
import { quickNotesApi } from "@/api/quickNotes";
import { logger } from "@/services/LoggerService";
import type { DashboardNote } from "@/types/note";
import { QuickNoteCard, QuickNoteDialog } from "./";
import { useAuthStore } from "@/stores/AuthStore";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { authMode, isAuthenticated } = storeToRefs(authStore);

const useServerNotes = computed(
    () => authMode.value === "user" && isAuthenticated.value,
);

const quickNote = ref("");
const notes = ref<DashboardNote[]>([]);
const editNoteDialogOpen = ref(false);
const editNoteId = ref<string | null>(null);
const editNoteText = ref("");

function mapServerToDashboard(
    row: Awaited<ReturnType<typeof quickNotesApi.list>>[number],
): DashboardNote {
    return {
        id: row.id,
        text: row.content,
        createdAt: row.created_at,
    };
}

async function refreshNotes() {
    if (useServerNotes.value) {
        try {
            const list = await quickNotesApi.list();
            notes.value = list.map(mapServerToDashboard);
        } catch (e) {
            logger.warn("Quick notes API load failed:", e);
            notes.value = [];
        }
        return;
    }
    notes.value = loadNotes();
}

const saveQuickNote = async () => {
    const text = quickNote.value.trim();
    if (!text) return;

    if (useServerNotes.value) {
        try {
            const row = await quickNotesApi.create(text);
            notes.value = [mapServerToDashboard(row), ...notes.value];
            quickNote.value = "";
        } catch (e) {
            logger.warn("Quick note create failed:", e);
        }
        return;
    }

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

const deleteNote = async (noteId: string) => {
    if (useServerNotes.value) {
        try {
            await quickNotesApi.remove(noteId);
            notes.value = notes.value.filter((note) => note.id !== noteId);
        } catch (e) {
            logger.warn("Quick note delete failed:", e);
        }
        return;
    }

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

const saveEditedNote = async () => {
    if (!editNoteId.value) return;
    const text = editNoteText.value.trim();
    if (!text) return;

    if (useServerNotes.value) {
        try {
            const row = await quickNotesApi.update(editNoteId.value, text);
            notes.value = notes.value.map((note) =>
                note.id === editNoteId.value
                    ? mapServerToDashboard(row)
                    : note,
            );
            closeEditNote();
        } catch (e) {
            logger.warn("Quick note update failed:", e);
        }
        return;
    }

    const nextNotes = notes.value.map((note) =>
        note.id === editNoteId.value ? { ...note, text } : note,
    );
    notes.value = nextNotes;
    saveNotes(nextNotes);
    closeEditNote();
};

onMounted(async () => {
    if (authStore.authMode === null) {
        await authStore.checkAuthStatus();
    }
    try {
        quickNote.value = localStorage.getItem("dashboardQuickNote") || "";
    } catch (error) {
        logger.warn("Unable to load quick note:", error);
    }
    await refreshNotes();
});

watch([authMode, isAuthenticated], () => {
    void refreshNotes();
});
</script>
