<template>
    <v-card
        variant="outlined"
        rounded="lg"
        flat
        class="pa-4"
        :style="{
            backgroundColor: '#fdfaf6',
            color: '#554338',
            border: 'none'
        }"
    >
        <v-row dense>
            <v-col v-for="filter in filters" :key="filter.key" cols="12" md="4">
                <v-select
                    v-if="filter.type === 'select'"
                    v-model="modelValue[filter.key]"
                    :items="filter.options"
                    :label="filter.label"
                    density="compact"
                    variant="outlined"
                    bg-color="white"
                    rounded="lg"
                />

                <DatePickerField
                    v-else-if="filter.type === 'date'"
                    v-model="modelValue[filter.key]"
                    :label="filter.label"
                    variant="outlined"
                    bg-color="white"
                    rounded="lg"
                />

                <v-text-field
                    v-else-if="filter.type === 'search'"
                    v-model="modelValue[filter.key]"
                    :label="filter.label"
                    density="compact"
                    variant="outlined"
                    bg-color="white"
                    rounded="lg"
                />
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import { DatePickerField } from "@/components";
import { FilterDefinition } from "@/types";
defineProps<{
    filters: readonly FilterDefinition<any>[];
    modelValue: Record<string, any>;
}>();

defineEmits(["update:modelValue"]);
</script>