<template>
    <v-col cols="12" class="pa-0">
        <SectionCard
            title="Note rapide"
            icon="pen"
            class="dashboard-card--primary"
        >
            <v-textarea
                v-model="noteText"
                label="Ajouter une note"
                rows="4"
                variant="outlined"
                auto-grow
                @blur="$emit('save')"
            />
            <div class="d-flex justify-end">
                <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="$emit('save')"
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
                    <v-list-item-subtitle
                        class="text-caption text-grey-darken-1"
                    >
                        {{ formatDateLong(note.createdAt) }}
                    </v-list-item-subtitle>
                    <template #append>
                        <v-btn
                            icon="mdi-pencil"
                            variant="text"
                            size="small"
                            @click="$emit('edit', note)"
                        />
                        <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="$emit('delete', note.id)"
                        />
                    </template>
                </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucune note enregistrée</p>
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
