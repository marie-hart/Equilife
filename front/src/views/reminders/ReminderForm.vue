<template>
    <v-card 
        class="pa-4" 
        variant="flat" 
        rounded="lg"
        :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
    >
        <form class="reminder-form" @submit.prevent="emit('submit')">
            <v-row dense>
                <v-col v-if="showHorseSelect" cols="12" md="6">
                    <v-select
                        v-model="horseIds"
                        :items="horseSelectOptions"
                        label="Chevaux *"
                        density="comfortable"
                        variant="outlined"
                        bg-color="white"
                        rounded="lg"
                        :multiple="multiple"
                        :chips="multiple"
                        :error-messages="
                            errors?.horseIds ? [errors.horseIds] : undefined
                        "
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <v-select
                        v-model="reminderType"
                        :items="reminderTypeOptions"
                        label="Type *"
                        density="comfortable"
                        variant="outlined"
                        bg-color="white"
                        rounded="lg"
                        :error-messages="
                            errors?.reminderType ? [errors.reminderType] : undefined
                        "
                    />
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        v-model="description"
                        label="Description *"
                        placeholder="vaccin, maréchal, médicament..."
                        density="comfortable"
                        variant="outlined"
                        bg-color="white"
                        rounded="lg"
                        :error-messages="
                            errors?.description ? [errors.description] : undefined
                        "
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <DatePickerField
                        v-model="date"
                        label="Date *"
                        density="comfortable"
                        variant="outlined"
                        bg-color="white"
                        rounded="lg"
                        :error-messages="errors?.date ? [errors.date] : undefined"
                    />
                </v-col>
                
                <v-col cols="12">
                    <RecurrenceFields
                        v-model="recurrence"
                        :units="recurrenceUnits"
                        density="comfortable"
                        variant="outlined"
                        bg-color="white"
                        rounded="lg"
                        :checkbox-md="12"
                        :fields-md="6"
                    />
                </v-col>
            </v-row>
            
            <div class="d-flex align-center justify-end ga-3 mt-6 flex-wrap">
                 <v-btn 
                    variant="outlined" 
                    @click="emit('cancel')"
                    rounded="lg"
                    class="text-none"
                    :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                >
                    Annuler
                </v-btn>
                <v-btn
                    class="text-none"
                    :style="{ backgroundColor: '#554338', color: 'white' }"
                    variant="flat"
                    rounded="lg"
                    type="submit"
                    :loading="loading"
                >
                    {{ submitLabel }}
                </v-btn>
            </div>
        </form>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DatePickerField, RecurrenceFields } from "@/components";
import type { Horse, RecurrenceUnit } from "@/types"; // Importez correctement le type ici

type ReminderFormValue = {
    horseIds: string[];
    description: string;
    date: string;
    reminderType: "soin" | "activité" | "alimentation" | "autres";
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
};

const props = withDefaults(
    defineProps<{
        modelValue: ReminderFormValue;
        horses: Horse[];
        loading?: boolean;
        submitLabel?: string;
        showHorseSelect?: boolean;
        multiple?: boolean;
        errors?: Record<string, string>;
    }>(),
    {
        loading: false,
        submitLabel: "Ajouter",
        showHorseSelect: true,
        multiple: true,
    },
);

const emit = defineEmits<{
    (event: "update:modelValue", value: ReminderFormValue): void;
    (event: "submit"): void;
    (event: "cancel"): void;
}>();

// Mapping des chevaux pour le select
const horseSelectOptions = computed(() =>
    props.horses.map((horse) => ({ title: horse.name, value: horse.id })),
);

// Computed properties for v-model binding
const horseIds = computed({
    get: () => props.modelValue.horseIds,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, horseIds: value }),
});

const description = computed({
    get: () => props.modelValue.description,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, description: value }),
});

const date = computed({
    get: () => props.modelValue.date,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, date: value }),
});

const reminderType = computed({
    get: () => props.modelValue.reminderType,
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, reminderType: value }),
});

const recurrence = computed({
    get: () => ({
        isRecurring: props.modelValue.isRecurring,
        recurrenceInterval: props.modelValue.recurrenceInterval,
        recurrenceUnit: props.modelValue.recurrenceUnit,
    }),
    set: (value) =>
        emit("update:modelValue", { ...props.modelValue, ...value }),
});

const reminderTypeOptions = [
    { title: "Soin", value: "soin" },
    { title: "Activité", value: "activité" },
    { title: "Alimentation", value: "alimentation" },
    { title: "Autres", value: "autres" },
];

const recurrenceUnits = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];
</script>

<style scoped>
.reminder-form {
    margin: 0;
}
/* Style pour s'assurer que RecurrenceFields hérite des styles */
:deep(.v-field__outline) {
    --v-field-border-color: #d1c7bc;
}
</style>