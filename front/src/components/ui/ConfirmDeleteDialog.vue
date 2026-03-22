<template>
    <v-dialog v-model="isOpen" max-width="380" persistent transition="dialog-transition">
        <v-card color="#F5EFE6" rounded="xl" class="pa-5">
            <div class="text-center">
                <v-avatar color="#F8D7DA" size="64" class="mb-4">
                    <v-icon color="#B00020" size="32">mdi-delete-outline</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-black mb-1" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                    {{ title }}
                </h3>
                <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px; margin: 0 auto 12px;" />
                <p class="text-body-2 mb-5" style="color: #7B5B3E; line-height: 1.5;">
                    {{ message }}
                </p>
                <v-row dense>
                    <v-col cols="12">
                        <v-btn
                            block
                            flat
                            rounded="xl"
                            color="#2E4B36"
                            class="text-none font-weight-bold mb-2"
                            @click="close"
                        >
                            Annuler
                        </v-btn>
                    </v-col>
                    <v-col cols="12">
                        <v-btn
                            block
                            variant="text"
                            rounded="xl"
                            color="#B00020"
                            class="text-none font-weight-bold"
                            :loading="loading"
                            @click="$emit('confirm')"
                        >
                            Supprimer
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        title: string;
        message: string;
        loading?: boolean;
    }>(),
    { loading: false },
);

const emit = defineEmits(["update:modelValue", "confirm"]);

const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
});

const close = () => {
    isOpen.value = false;
};
</script>
