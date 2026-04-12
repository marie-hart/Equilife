<script setup lang="ts">
import { ref, computed } from "vue";
import { ActionButtons, ConfirmDeleteDialog } from "@/components";
import { useHorsesStore } from "@/stores/HorsesStore";
import type { Horse, HorseAction } from "@/types";
import { useRouter } from 'vue-router';

const horsesStore = useHorsesStore();
const router = useRouter()

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
        await horsesStore.deleteHorse(horseToDelete.value.id);

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


const goToDetails = (horse: Horse) => {
    horsesStore.sethorseId(horse.id);
    router.push({ name: "HorseDetails" });
};
const goToEdit = (horse: Horse) => {
    horsesStore.sethorseId(horse.id);
    router.push({ name: "HorseEdit" });
};

const getHorseActions = (horse: Horse): HorseAction[] => [
    {
        key: "view",
        title: "Détails",
        icon: "mdi-eye",
        disabled: false,
        onClick: () => goToDetails(horse),
    },
    {
        key: "edit",
        title: "Modifier",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => goToEdit(horse),
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

const goToDashboard = (horseId: string) => {
    horsesStore.sethorseId(horseId);
    router.push({ name: "HorseDashboardView" });
};
</script>

<template>
    <div>
    <v-row v-if="horsesStore.horses.length" dense>
        <v-col
            v-for="horse in horsesStore.horses"
            :key="horse.id"
            cols="12"
            sm="6"
            md="4"
            class="pa-3"
        >
            <v-card
                variant="flat"
                rounded="xl"
                class="horse-card pa-5 shadow-subtle border-light bg-white"
                @click="goToDetails(horse)"
            >
                <div class="d-flex align-center justify-space-between mb-4">
                    <div class="text-h5 font-weight-black" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
                        {{ horse.name }}
                    </div>
                    <div @click.stop>
                        <ActionButtons
                            mode="auto"
                            button-size="small"
                            :actions="getHorseActions(horse)"
                        />
                    </div>
                </div>

                <div class="d-flex align-center mb-6">
                    <v-avatar size="90" class="elevation-4 border-white-large">
                        <v-img
                            :src="horse.photoBase64 || horse.photo_path || '/avatar.jpg'"
                            cover
                        />
                    </v-avatar>

                    <div class="ms-4">
                        <div class="d-flex flex-wrap ga-1">
                            <v-chip v-if="horse.breed" size="x-small" color="#7B5B3E" variant="tonal" class="font-weight-bold">
                                {{ horse.breed }}
                            </v-chip>
                            <v-chip v-if="horse.age" size="x-small" color="#2E4B36" variant="tonal" class="font-weight-bold">
                                {{ horse.age }} ans
                            </v-chip>
                        </div>
                        <div v-if="horse.additional_info" class="text-caption text-truncate-2 mt-2" style="color: #8C7E6D; max-width: 150px;">
                            {{ horse.additional_info }}
                        </div>
                    </div>
                </div>

                <v-btn
                    block
                    variant="flat"
                    rounded="lg"
                    color="#F3EEE7"
                    class="text-none font-weight-bold"
                    style="color: #554338 !important;"
                    @click.stop="goToDashboard(horse.id)"
                >
                    Dashboard
                    <v-icon end size="18">mdi-arrow-right</v-icon>
                </v-btn>
            </v-card>
        </v-col>
    </v-row>

    <div v-else class="text-center py-16">
        <v-icon size="100" color="#BDB4A8">mdi-horse-variant</v-icon>
        <p class="text-h6 mt-4 font-weight-medium" style="color: #8C7E6D">Aucun compagnon enregistré</p>
    </div>

    <ConfirmDeleteDialog
        v-model="isDeleteDialogOpen"
        title="Supprimer la fiche ?"
        :message="deleteMessage"
        :loading="isDeleting"
        @confirm="confirmDelete"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg">
        {{ snackbar.message }}
    </v-snackbar>
    </div>
</template>

<style scoped>
.shadow-subtle {
    box-shadow: 0 10px 30px rgba(46, 75, 54, 0.05) !important;
}
.border-light {
    border: 1px solid rgba(168, 159, 148, 0.15) !important;
}
.border-white-large {
    border: 4px solid white !important;
}
.horse-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}
.horse-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(46, 75, 54, 0.1) !important;
}
.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>