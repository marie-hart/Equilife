<template>
    <v-dialog v-model="isOpen" max-width="420">
        <v-card rounded="lg" class="pa-2">
            <v-card-title class="text-h6 font-weight-bold" :style="{ color: '#3c3226' }">
                Modifier le rappel
            </v-card-title>
            
            <v-card-text>
                <v-text-field
                    v-model="form.description"
                    label="Description"
                    density="comfortable"
                    variant="outlined"
                    bg-color="white"
                    rounded="lg"
                    :error-messages="
                        errors.description ? [errors.description] : undefined
                    "
                />
                
                <DatePickerField
                    v-model="form.date"
                    label="Date"
                    density="comfortable"
                    variant="outlined"
                    bg-color="white"
                    rounded="lg"
                    :error-messages="errors.date ? [errors.date] : undefined"
                />
                
                <v-checkbox
                    v-model="form.isRecurring"
                    label="Répéter ce rappel"
                    density="compact"
                    color="primary"
                />
                
                <v-row v-if="form.isRecurring" dense>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model.number="form.recurrenceInterval"
                            label="Tous les"
                            type="number"
                            min="1"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="form.recurrenceUnit"
                            :items="recurrenceUnits"
                            label="Unité"
                            density="comfortable"
                            variant="outlined"
                            bg-color="white"
                            rounded="lg"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn 
                    variant="outlined" 
                    rounded="lg"
                    class="text-none"
                    :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                    @click="isOpen = false"
                >
                    Annuler
                </v-btn>
                <v-btn 
                    variant="flat" 
                    rounded="lg"
                    class="text-none"
                    :style="{ backgroundColor: '#554338', color: 'white' }"
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
import { DatePickerField } from "@/components";
import type { RecurrenceUnit } from "@/types"

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