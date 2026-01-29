<template>
    <v-dialog v-model="isOpen" max-width="420">
        <v-card>
            <v-card-title>Modifier le rappel</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="form.description"
                    label="Description"
                    density="compact"
                    :error-messages="
                        errors.description ? [errors.description] : undefined
                    "
                />
                <DatePickerField
                    v-model="form.date"
                    label="Date"
                    :error-messages="errors.date ? [errors.date] : undefined"
                />
                <v-checkbox
                    v-model="form.isRecurring"
                    label="Récurrence"
                    density="compact"
                />
                <v-row v-if="form.isRecurring" dense>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model.number="form.recurrenceInterval"
                            label="Tous les"
                            type="number"
                            min="1"
                            density="compact"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="form.recurrenceUnit"
                            :items="recurrenceUnits"
                            label="Unité"
                            density="compact"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>
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

type RecurrenceUnit = "days" | "months" | "years";

const props = defineProps<{
    modelValue: boolean;
    form: {
        description: string;
        date: string;
        isRecurring: boolean;
        recurrenceInterval: number;
        recurrenceUnit: RecurrenceUnit;
    };
    errors: Record<string, string>;
    recurrenceUnits: { title: string; value: RecurrenceUnit }[];
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});
</script>
