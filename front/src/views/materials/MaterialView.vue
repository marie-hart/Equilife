<template>
    <div class="page">
        <main class="pa-4">
            <div
                class="d-flex align-center justify-space-between ga-4 mb-6 flex-wrap"
            >
                <v-card-title class="ma-0 text-h5"
                    >Détails du produit</v-card-title
                >
                <div class="d-flex ga-2">
                    <v-btn variant="outlined" @click="goToDashboard">
                        <v-icon icon="mdi-arrow-left" class="me-2" />
                        Retour
                    </v-btn>
                    <v-btn variant="outlined" @click="goBack">Précédent</v-btn>
                    <v-btn color="primary" variant="flat" @click="goToEdit"
                        >Modifier</v-btn
                    >
                    <v-btn
                        color="error"
                        variant="flat"
                        @click="deleteDialogOpen = true"
                        >Supprimer</v-btn
                    >
                </div>
            </div>

            <v-card class="card" variant="outlined">
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="list-item-two-line, list-item-two-line, list-item-two-line"
                    />
                    <div v-else-if="material">
                        <v-list density="compact">
                            <v-list-item>
                                <v-list-item-title>Nom</v-list-item-title>
                                <v-list-item-subtitle>{{
                                    material.name
                                }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>Catégorie</v-list-item-title>
                                <v-list-item-subtitle>{{
                                    material.category || "-"
                                }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>Marque</v-list-item-title>
                                <v-list-item-subtitle>{{
                                    material.brand || "-"
                                }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>Note</v-list-item-title>
                                <v-list-item-subtitle>{{
                                    material.note || "-"
                                }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title
                                    >À racheter</v-list-item-title
                                >
                                <v-list-item-subtitle>{{
                                    material.needs_repurchase ? "Oui" : "Non"
                                }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                    <p v-else class="empty-state">Produit introuvable.</p>
                </v-card-text>
            </v-card>

            <v-dialog v-model="deleteDialogOpen" max-width="420">
                <v-card>
                    <v-card-title>Supprimer</v-card-title>
                    <v-card-text
                        >Confirmer la suppression de ce produit ?</v-card-text
                    >
                    <v-card-actions class="justify-end">
                        <v-btn
                            variant="outlined"
                            @click="deleteDialogOpen = false"
                            >Annuler</v-btn
                        >
                        <v-btn
                            color="error"
                            variant="flat"
                            @click="confirmDelete"
                            >Supprimer</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                timeout="2500"
            >
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { materialsApi } from "../../api/materials";
import type { Material } from "../../types";

const route = useRoute();
const router = useRouter();
const material = ref<Material | null>(null);
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const loadMaterial = async () => {
    try {
        const id = route.params.id as string;
        material.value = await materialsApi.getById(id);
    } catch (error) {
        console.error("Error loading material:", error);
    } finally {
        isLoading.value = false;
    }
};

const goToEdit = () => {
    const id = route.params.id as string;
    router.push({ name: "MaterialEdit", params: { id } });
};

const goBack = () => {
    router.back();
};

const goToDashboard = () => {
    router.push({ name: "Dashboard" });
};

const confirmDelete = async () => {
    if (!material.value) return;
    try {
        await materialsApi.delete(material.value.id);
        snackbar.value = {
            show: true,
            message: "Produit supprimé.",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error deleting material:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    } finally {
        deleteDialogOpen.value = false;
    }
};

onMounted(loadMaterial);
</script>
