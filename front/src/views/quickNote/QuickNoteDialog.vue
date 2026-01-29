<template>
    <v-dialog v-model="isOpen" max-width="420">
        <v-card>
            <v-card-title>Modifier la note</v-card-title>
            <v-card-text>
                <v-textarea
                    v-model="noteText"
                    label="Note"
                    rows="4"
                    auto-grow
                />
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="outlined" @click="isOpen = false"
                    >Annuler</v-btn
                >
                <v-btn color="primary" variant="flat" @click="$emit('save')"
                    >Enregistrer</v-btn
                >
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
