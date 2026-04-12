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
import { useHorsesStore } from "@/stores/HorsesStore";

const authStore = useAuthStore();
const { authMode, isAuthenticated } = storeToRefs(authStore);
const horsesStore = useHorsesStore();

const useServerNotes = computed(
    () => authMode.value === "user" && isAuthenticated.value,
);
const selectedHorseId = computed(() => {
    const id = horsesStore.horseId;
    return id && id !== "all" ? id : null;
});

const quickNote = ref("");
const notes = ref<DashboardNote[]>([]);
const editNoteDialogOpen = ref(false);
const editNoteId = ref<string | null>(null);
const editNoteText = ref("");
const isCreatingNote = ref(false);
const lastCreated = ref<{ text: string; at: number } | null>(null);

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
    const horseId = selectedHorseId.value;
    if (!horseId) {
        notes.value = [];
        return;
    }
    if (useServerNotes.value) {
        try {
            const list = await quickNotesApi.list(horseId);
            notes.value = list.map(mapServerToDashboard);
        } catch (e) {
            logger.warn("Quick notes API load failed:", e);
            notes.value = [];
        }
        return;
    }
    notes.value = loadNotes(horseId);
}

const saveQuickNote = async () => {
    const horseId = selectedHorseId.value;
    const text = quickNote.value.trim();
    if (!text || !horseId || isCreatingNote.value) return;

    const now = Date.now();
    if (
        lastCreated.value &&
        lastCreated.value.text === text &&
        now - lastCreated.value.at < 1200
    ) {
        return;
    }
    isCreatingNote.value = true;

    try {
        if (useServerNotes.value) {
            const row = await quickNotesApi.create(horseId, text);
            notes.value = [mapServerToDashboard(row), ...notes.value];
            quickNote.value = "";
            lastCreated.value = { text, at: Date.now() };
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
        saveNotes(nextNotes, horseId);
        quickNote.value = "";
        lastCreated.value = { text, at: Date.now() };

        try {
            localStorage.removeItem("dashboardQuickNote");
        } catch (error) {
            logger.warn("Unable to clear quick note:", error);
        }
    } catch (e) {
        logger.warn("Quick note create failed:", e);
    } finally {
        isCreatingNote.value = false;
    }
};

const deleteNote = async (noteId: string) => {
    const horseId = selectedHorseId.value;
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
    saveNotes(nextNotes, horseId);
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
    saveNotes(nextNotes, selectedHorseId.value);
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

watch(
    () => horsesStore.horseId,
    () => {
        quickNote.value = "";
        void refreshNotes();
    },
);
</script>
