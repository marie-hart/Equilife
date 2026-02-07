<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { horsesApi } from "@/api/horses";
import { ConfirmDeleteDialog } from "@/components";
import type { Horse, HorseAction } from "@/types";
import { HorseList } from "./";

const horses = ref<Horse[]>([]);
const isLoading = ref(true);
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const horseToDelete = ref<Horse | null>(null);

const { xs } = useDisplay();

const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const cardHeight = computed(() => (xs.value ? 200 : 230));
const cardMaxWidth = "100%";
const photoWidth = computed(() => (xs.value ? 120 : 140));
const photoHeight = computed(() => (xs.value ? 90 : 110));

const deleteMessage = computed(() =>
    horseToDelete.value
        ? `Confirmer la suppression de ${horseToDelete.value.name} ?`
        : "Confirmer la suppression de ce cheval ?",
);

const openDeleteDialog = (horse: Horse) => {
    horseToDelete.value = horse;
    isDeleteDialogOpen.value = true;
};

const getHorseActions = (horse: Horse): HorseAction[] => [
    {
        key: "dashboard",
        title: "Dashboard",
        icon: "mdi-view-dashboard",
        disabled: false,
        to: {
            name: "HorseDashboardView",
            params: { id: horse.id },
        },
    },
    {
        key: "edit",
        title: "Éditer",
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

const loadHorses = async () => {
    isLoading.value = true;
    try {
        horses.value = await horsesApi.getAll();
    } catch (error) {
        console.error("Error loading horses:", error);
    } finally {
        isLoading.value = false;
    }
};

const confirmDelete = async () => {
    if (!horseToDelete.value || isDeleting.value) return;
    try {
        isDeleting.value = true;
        await horsesApi.delete(horseToDelete.value.id);
        horses.value = horses.value.filter(
            (horse) => horse.id !== horseToDelete.value?.id,
        );
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

onMounted(loadHorses);
</script>

<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <v-card-title class="text-h5">Fiches chevaux</v-card-title>

            <v-btn
                color="primary"
                variant="flat"
                :to="{ name: 'HorseCreate' }"
            >
                Ajouter
            </v-btn>
        </div>

        <v-skeleton-loader
            v-if="isLoading"
            type="image, image, image"
        />

        <HorseList
            v-else
            :horses="horses"
            :card-height="cardHeight"
            :card-max-width="cardMaxWidth"
            :photo-width="photoWidth"
            :photo-height="photoHeight"
            :get-horse-actions="getHorseActions"
        />

        <ConfirmDeleteDialog
            v-model="isDeleteDialogOpen"
            title="Supprimer le cheval"
            :message="deleteMessage"
            @confirm="confirmDelete"
        />

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="2500"
        >
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>
