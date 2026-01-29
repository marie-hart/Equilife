<template>
    <v-dialog v-model="isOpen" max-width="420">
        <v-card>
            <v-card-title>Modifier le soin</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="form.name"
                    label="Nom"
                    density="compact"
                    :error-messages="errors.name ? [errors.name] : undefined"
                />
                <v-textarea
                    v-model="form.description"
                    label="Description"
                    density="compact"
                    variant="outlined"
                    rows="2"
                />
                <DatePickerField
                    v-model="form.date"
                    label="Date"
                    :error-messages="errors.date ? [errors.date] : undefined"
                />
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="outlined" @click="isOpen = false"
                    >Annuler</v-btn
                >
                <v-btn variant="elevated" color="primary" @click="$emit('save')"
                    >Enregistrer</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DatePickerField } from "@/components";

const props = defineProps<{
    modelValue: boolean;
    form: {
        name: string;
        description: string;
        date: string;
    };
    errors: Record<string, string>;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});
</script>
