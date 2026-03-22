<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        location="bottom"
        :disabled="disabled"
    >
        <template #activator="{ props: menuProps }">
            <v-text-field
                v-bind="menuProps"
                v-model="displayValue"
                :label="label"
                :density="density"
                :variant="variant"
                :clearable="clearable"
                :disabled="disabled"
                :rules="rules"
                :error-messages="errorMessages"
                readonly
                @click:clear="clearValue"
            />
        </template>
        <v-date-picker
            v-model="internalValue"
            :min="min"
            :max="max"
            :hide-header="hideHeader"
            title=""
            @update:model-value="onSelect"
        />
    </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { formatDateShort } from "@/libs/date";

type Density = "default" | "comfortable" | "compact";
type Variant =
    | "outlined"
    | "filled"
    | "plain"
    | "solo"
    | "solo-inverted"
    | "underlined";

const props = withDefaults(
    defineProps<{
        modelValue: string | undefined;
        label?: string;
        density?: Density;
        variant?: Variant;
        clearable?: boolean;
        disabled?: boolean;
        hideHeader?: boolean;
        errorMessages?: string | string[];
        min?: string;
        max?: string;
        rules?: any[];
    }>(),
    {
        label: "",
        density: "compact",
        clearable: true,
        disabled: false,
        hideHeader: true,
        rules: () => [],
    },
);

const emit = defineEmits<{
    (event: "update:modelValue", value: string): void;
}>();

const menu = ref(false);

const internalValue = computed<string | null>({
    get: () => (props.modelValue ? props.modelValue : null),
    set: (value) => emit("update:modelValue", value ?? ""),
});

const displayValue = computed<string>({
    get: () => (props.modelValue ? formatDateShort(props.modelValue) : ""),
    set: (value) => emit("update:modelValue", value || ""),
});

const onSelect = (value: string | null) => {
    internalValue.value = value;
    menu.value = false;
};

const clearValue = () => {
    emit("update:modelValue", "");
};
</script>
