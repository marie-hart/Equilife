<template>
    <v-container class="horses-view" fluid>
        <div class="d-flex align-center justify-space-between ga-4 mb-6">
            <v-card-title class="ma-0 text-h5">Fiches chevaux</v-card-title>
        </div>

    <div class="d-flex align-center justify-space-between ga-4 mb-4">
        <v-btn variant="outlined" @click="goToDashboardHome">
            <v-icon icon="mdi-arrow-left" class="me-2" />
            Retour
        </v-btn>
        <v-btn
            class="primary-btn"
            color="primary"
            variant="flat"
            @click="goToCreate"
        >
            <font-awesome-icon icon="circle-plus" class="btn-icon me-2" />
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
        :get-photo-url="getPhotoUrl"
        :get-horse-actions="getHorseActions"
        :on-open-dashboard="goToDashboard"
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

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { horsesApi } from "../../api/horses";
import { filesBaseUrl } from "../../api/client";
import { ConfirmDeleteDialog } from "../../components";
import type { Horse } from "../../types";
import { HorseList } from "./";

type HorseAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

const horses = ref<Horse[]>([]);
const isLoading = ref(true);
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const horseToDelete = ref<Horse | null>(null);
const router = useRouter();
const { xs } = useDisplay();
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const cardHeight = computed(() => (xs.value ? 170 : 190));
const cardMaxWidth = computed(() => (xs.value ? "100%" : "300px"));
const photoWidth = computed(() => (xs.value ? 88 : 96));
const photoHeight = computed(() => (xs.value ? 64 : 72));

const deleteMessage = computed(() =>
    horseToDelete.value
        ? `Confirmer la suppression de ${horseToDelete.value.name} ?`
        : "Confirmer la suppression de ce cheval ?",
);

const resolveFilesOrigin = (): string => {
    if (filesBaseUrl.startsWith("http")) {
        try {
            const url = new URL(filesBaseUrl);
            const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
                url.hostname,
            );
            return isLocal ? window.location.origin : url.origin;
        } catch {
            return window.location.origin;
        }
    }
    return window.location.origin;
};

const normalizePhotoUrl = (path?: string): string => {
    if (!path) return "/placeholder-horse.jpg";
    if (path.startsWith("http")) {
        try {
            const url = new URL(path);
            const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
                url.hostname,
            );
            return isLocal ? `${window.location.origin}${url.pathname}` : path;
        } catch {
            return path;
        }
    }
    if (path.startsWith("/")) return `${resolveFilesOrigin()}${path}`;
    return path;
};

const getPhotoUrl = (horse: Horse): string =>
    normalizePhotoUrl(horse.photo_path);

const goToCreate = () => {
    router.push("/horses/new");
};

const goToEdit = (horseId: string) => {
    router.push(`/horses/${horseId}/edit`);
};

const goToDetails = (horseId: string) => {
    router.push(`/horses/${horseId}/details`);
};

const goToDashboard = (horseId: string) => {
    router.push(`/horses/${horseId}/dashboard`);
};

const goToDashboardHome = () => {
    router.push({ name: "Dashboard" });
};

const openDeleteDialog = (horse: Horse) => {
    horseToDelete.value = horse;
    isDeleteDialogOpen.value = true;
};

const getHorseActions = (horse: Horse): HorseAction[] => [
    {
        key: "view",
        title: "Voir",
        icon: "mdi-eye",
        disabled: false,
        onClick: () => goToDetails(horse.id),
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => goToEdit(horse.id),
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
        console.error("Error deleting horse:", error);
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
