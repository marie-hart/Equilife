<template>
    <v-dialog v-model="isOpen" max-width="420">
        <v-card>
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>{{ message }}</v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="outlined" @click="isOpen = false"
                    >Annuler</v-btn
                >
                <v-btn
                    variant="elevated"
                    color="error"
                    @click.stop.prevent="$emit('confirm')"
                    >Supprimer</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
}>();

const emit = defineEmits(["update:modelValue", "confirm"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});
</script>
