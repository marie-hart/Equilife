<script setup lang="ts">
import { ref, computed } from "vue";
import { ActionButtons } from "@/components";
import { horsesApi } from "@/api/horses";
import type { Horse, HorseAction } from "@/types";

defineProps<{
    horses: Horse[];
    cardHeight: number;
    cardMaxWidth: string;
    photoWidth: number;
    photoHeight: number;
}>();

const emit = defineEmits(['deleted']);

const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const horseToDelete = ref<Horse | null>(null);

const deleteMessage = computed(() =>
    horseToDelete.value
        ? `Confirmer la suppression de ${horseToDelete.value.name} ?`
        : "Confirmer la suppression de ce cheval ?",
);

const confirmDelete = async () => {
    if (!horseToDelete.value || isDeleting.value) return;
    try {
        isDeleting.value = true;
        await horsesApi.delete(horseToDelete.value.id);
        // horses.value = horses.value.filter(
        //     (horse) => horse.id !== horseToDelete.value?.id,
        // );

        emit('deleted');

        snackbar.value = {
            show: true,
            message: "Cheval supprimé.",
            color: "success",
        };
    } catch (error) {
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    } finally {
        isDeleting.value = false;
        isDeleteDialogOpen.value = false;
    }
};


const getHorseActions = (horse: Horse): HorseAction[] => [
    {
        key: "view",
        title: "Détails",
        icon: "mdi-eye",
        disabled: false,
        to: {
            name: "HorseDetails",
            params: { id: horse.id },
        },
    },
    {
        key: "edit",
        title: "Modifier",
        icon: "mdi-pencil",
        disabled: false,
        to: {
            name: "HorseEdit",
            params: { id: horse.id },
        },
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openDeleteDialog(horse),
    },
];

const openDeleteDialog = (horse: Horse) => {
    horseToDelete.value = horse;
    isDeleteDialogOpen.value = true;
};
</script>

<template>
    <v-row v-if="horses.length" dense>
        <v-col
            v-for="horse in horses"
            :key="horse.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="d-flex"
        >
        
            <v-card
                class="d-flex flex-column w-100 pa-4"
                variant="tonal"
                rounded="lg"
                flat
                :height="cardHeight"
                :style="{ 
                    maxWidth: cardMaxWidth,
                    backgroundColor: '#fdfaf6',
                    color: '#554338',
                    border: 'none',
                    position: 'relative' 
                }"
            >
                <div class="d-flex align-center justify-space-between mb-3">
                    <div 
                        class="text-h6 font-weight-bold" 
                        :style="{ color: '#3c3226' }"
                    >
                        {{ horse.name }}
                    </div>

                    <ActionButtons
                        mode="auto"
                        button-size="x-small"
                        menu-button-size="x-small"
                        :actions="getHorseActions(horse)"
                    />
                </div>

                

                    <div 
                        class="d-flex align-start justify-space-between ga-3 flex-grow-1"
                    >
                        <div class="flex-grow-1">
                            <div class="text-body-2 text-grey-darken-1">
                                <v-chip
                                    v-if="horse.breed"
                                    size="small"
                                    variant="outlined"
                                    class="mr-1"
                                >
                                    {{ horse.breed }}
                                </v-chip>
                                <v-chip
                                    v-if="horse.age"
                                    size="small"
                                    variant="outlined"
                                >
                                    {{ horse.age }} ans
                                </v-chip>
                            </div>

                            <div
                                v-if="horse.additional_info"
                                class="text-caption text-grey-darken-1 ma-2"
                            >
                                {{ horse.additional_info }}
                            </div>
                        </div>

                        <v-img
                            :src="horse.photo_path || '/placeholder-horse.jpg'"
                            :alt="horse.name"
                            :width="photoWidth"
                            :height="photoHeight"
                            class="rounded-lg"
                            cover
                        />
                    </div>
                <div class="d-flex justify-center">                
                    <v-btn
                        variant="flat"
                        class="text-none rounded-lg"
                        :style="{ color: '#554338', backgroundColor: '#efe5d9' }"
                        :to="{ name: 'HorseDashboardView', params: { id: horse.id } }"
                    >
                        Mon Dashboard
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </div>
            </v-card>
        </v-col>
    </v-row>
    <p v-else class="empty-state">Aucun cheval enregistré</p>
    </template>