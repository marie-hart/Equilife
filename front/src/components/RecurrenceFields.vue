<template>
    <div v-if="show" style="display: contents">
        <v-col cols="12" :md="checkboxMd">
            <v-checkbox
                v-model="isRecurring"
                :label="label"
                density="compact"
            />
        </v-col>
        <v-col v-if="isRecurring" cols="12" :md="fieldsMd">
            <div class="recurrence-row">
                <v-text-field
                    v-model.number="recurrenceInterval"
                    label="Tous les"
                    type="number"
                    min="1"
                    density="compact"
                />
                <v-select
                    v-model="recurrenceUnit"
                    :items="units"
                    label="Unité"
                    density="compact"
                    variant="outlined"
                />
            </div>
        </v-col>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type RecurrenceValue = {
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: string;
};

const props = withDefaults(
    defineProps<{
        modelValue: RecurrenceValue;
        units: { title: string; value: string }[];
        label?: string;
        show?: boolean;
        checkboxMd?: number | string;
        fieldsMd?: number | string;
    }>(),
    {
        label: "Récurrence",
        show: true,
        checkboxMd: 4,
        fieldsMd: 8,
    },
);

const emit = defineEmits<{
    (event: "update:modelValue", value: RecurrenceValue): void;
}>();

const isRecurring = computed({
    get: () => props.modelValue.isRecurring,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, isRecurring: value }),
});

const recurrenceInterval = computed({
    get: () => props.modelValue.recurrenceInterval,
    set: (value) => {
        const nextValue = Number.isFinite(value) && value > 0 ? value : 1;
        emit("update:modelValue", {
            ...props.modelValue,
            recurrenceInterval: nextValue,
        });
    },
});

const recurrenceUnit = computed({
    get: () => props.modelValue.recurrenceUnit,
    set: (value) =>
        emit("update:modelValue", {
            ...props.modelValue,
            recurrenceUnit: value,
        }),
});
</script>

<style scoped>
.recurrence-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}
</style>
