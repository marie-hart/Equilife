<template>
    <div class="page" :style="{ minHeight: '100vh' }">
        <main class="pa-4">
            <div class="d-flex align-center justify-space-between ga-4 mb-6 flex-wrap">
                <v-card-title class="ma-0 text-h5 font-weight-bold" :style="{ color: '#3c3226' }">
                    Détails de l'événement
                </v-card-title>
                
                <v-btn 
                    variant="outlined" 
                    :to="{ name: 'Dashboard' }"
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
                    
                    <div v-else-if="event">
                        <v-list density="comfortable" class="bg-transparent">
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Titre</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ event.name }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Description</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ event.description || "-" }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Date</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ formatDateLong(event.event_date) }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item class="border-b">
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Type</v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-chip size="small" variant="tonal" color="brown-darken-2">
                                        {{ event.reminder_type || (event.is_care ? "soin" : "autres") }}
                                    </v-chip>
                                </v-list-item-subtitle>
                            </v-list-item>
                            
                            <v-list-item>
                                <v-list-item-title class="text-caption text-grey font-weight-bold">Cheval</v-list-item-title>
                                <v-list-item-subtitle class="text-body-1" :style="{ color: '#3c3226' }">
                                    {{ event.horse_id || "-" }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                    
                    <p v-else class="empty-state text-center text-grey-darken-1 pa-4">
                        Événement introuvable.
                    </p>
                </v-card-text>
            </v-card>
            
            <div v-if="event && !isLoading" class="d-flex justify-end ga-4">
                <v-btn
                    variant="flat"
                    rounded="lg"
                    :to="{ name: 'ActivityEdit', params: { id } }"
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
                    <v-card-text>Confirmer la suppression de cet événement ?</v-card-text>
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
import { eventsApi } from "@/api/events";
import { formatDateLong } from "@/libs/date";
import type { Event } from "@/types";

const route = useRoute();
const router = useRouter();
const event = ref<Event | null>(null);
const isLoading = ref(true);
const deleteDialogOpen = ref(false);
const snackbar = ref({
    show: false,
    message: "",
    color: "success",
});

const id = route.params.id as string;

const loadEvent = async () => {
    try {
        const id = route.params.id as string;
        event.value = await eventsApi.getById(id);
    } catch (error) {
        console.error("Error loading event:", error);
    } finally {
        isLoading.value = false;
    }
};

const goBack = () => {
    router.back();
};

const confirmDelete = async () => {
    if (!event.value) return;
    try {
        await eventsApi.delete(event.value.id);
        snackbar.value = {
            show: true,
            message: "Événement supprimé.",
            color: "success",
        };
        goBack();
    } catch (error) {
        console.error("Error deleting event:", error);
        snackbar.value = {
            show: true,
            message: "Suppression impossible.",
            color: "error",
        };
    } finally {
        deleteDialogOpen.value = false;
    }
};

onMounted(loadEvent);
</script>
