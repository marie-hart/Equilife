<template>
    <v-dialog v-model="isOpen" max-width="420" persistent transition="dialog-bottom-transition">
        <v-card rounded="xl" class="pa-4 shadow-subtle border-light">
            <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
                <div>
                    <span class="text-h6 font-weight-bold" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                        Modifier la note
                    </span>
                    <div
                        class="mt-1"
                        style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"
                    />
                </div>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    color="#6B4F3A"
                    @click="isOpen = false"
                />
            </v-card-title>
            <v-card-text class="px-4 pt-4 pb-2">
                <v-textarea
                    v-model="noteText"
                    placeholder="Modifier votre note…"
                    variant="solo"
                    flat
                    bg-color="#F3EFEA"
                    rounded="lg"
                    density="comfortable"
                    rows="3"
                    auto-grow
                    hide-details
                    @keydown.enter.prevent
                />
            </v-card-text>
            <v-card-actions class="px-4 pb-4 pt-2">
                <v-spacer />
                <v-btn
                    variant="text"
                    color="#554338"
                    class="text-none"
                    @click="isOpen = false"
                >
                    Annuler
                </v-btn>
                <v-btn
                    variant="flat"
                    color="#2E4B36"
                    rounded="xl"
                    class="text-none px-6"
                    @click="$emit('save')"
                >
                    Enregistrer
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    modelValue: boolean;
    text: string;
}>();

const emit = defineEmits(["update:modelValue", "update:text", "save"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});

const noteText = computed({
    get: () => props.text,
    set: (value: string) => emit("update:text", value),
});
</script>

<style scoped>
.shadow-subtle {
    box-shadow: 0 4px 15px rgba(123, 91, 62, 0.08) !important;
}
.border-light {
    border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
</style>
