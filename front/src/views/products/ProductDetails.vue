<template>
    <div class="page" :style="{ backgroundColor: '#fdfaf6', minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Détails du produit
                </v-card-title>
                
                <v-btn 
                    variant="outlined" 
                    :to="{ name: 'Products' }"
                    rounded="lg"
                    class="text-none"
                    :style="{ color: '#554338', borderColor: '#d1c7bc' }"
                >
                    <v-icon icon="mdi-arrow-left" class="me-2" />
                    Retour
                </v-btn>
            </div>

            <v-card 
                class="pa-2 mb-6" 
                variant="flat" 
                rounded="lg"
                :style="{ backgroundColor: '#ffffff', border: '1px solid #efe5d9' }"
            >
                <v-card-text>
                    <v-skeleton-loader
                        v-if="isLoading"
                        type="list-item-two-line, list-item-two-line, list-item-two-line"
                    />
                    
                    <div v-else-if="product">
                        <v-list density="comfortable" class="bg-transparent">
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Nom</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ product.name }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Catégorie</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ product.category || "-" }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Marque</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ product.brand || "-" }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Note</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ product.note || "-" }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item>
                                <v-list-item-title class="text-caption text-grey font-weight-bold">À racheter</v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-chip :color="product.needs_repurchase ? 'error' : 'success'" variant="tonal" size="small">
                                        {{ product.needs_repurchase ? "Oui" : "Non" }}
                                    </v-chip>
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-card-text>
            </v-card>

            <div v-if="product && !isLoading" class="d-flex justify-end ga-4">
                <v-btn
                    variant="flat"
                    rounded="lg"
                    :to="{ name: 'ProductEdit', params: { id: productId }}"
                    :style="{ backgroundColor: '#554338', color: 'white' }"
                    class="text-none"
                    size="large"
                >
                    Modifier
                </v-btn>
                <v-btn
                    color="error"
                    variant="flat"
                    rounded="lg"
                    @click="deleteDialogOpen = true"
                    class="text-none"
                    size="large"
                >
                    Supprimer
                </v-btn>
            </div>

            <v-dialog v-model="deleteDialogOpen" max-width="420">
                <v-card rounded="lg">
                    <v-card-title class="font-weight-bold" :style="{ color: '#3c3226' }">Supprimer</v-card-title>
                    <v-card-text>Confirmer la suppression de ce produit ?</v-card-text>
                    <v-card-actions class="justify-end pa-4">
                        <v-btn variant="outlined" rounded="lg" @click="deleteDialogOpen = false">
                            Annuler
                        </v-btn>
                        <v-btn color="error" variant="flat" rounded="lg" @click="confirmDelete">
                            Supprimer
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
                {{ snackbar.message }}
            </v-snackbar>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { materialsApi } from "../../api/materials.js";
import type { Product } from "../../types/index.js";

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const productId = route.params.id as string;

const loadProduct = async () => {
    try {
        const id = route.params.id as string;
        product.value = await materialsApi.getById(id);
    } catch (error) {
        console.error("Error loading product:", error);
    } finally {
        isLoading.value = false;
    }
};

const goBack = () => {
    router.back();
};

const confirmDelete = async () => {
    if (!product.value) return;
    try {
        await materialsApi.delete(product.value.id);
        snackbar.value = {
            show: true,
            message: "Produit supprimé.",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error deleting product:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    } finally {
        deleteDialogOpen.value = false;
    }
};

onMounted(loadProduct);
</script>
