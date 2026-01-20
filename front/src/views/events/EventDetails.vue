<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6 flex-wrap">
        <v-card-title class="ma-0 text-h5">Détails de l'événement</v-card-title>
        <div class="d-flex ga-2">
          <v-btn variant="outlined" @click="goBack">Retour</v-btn>
          <v-btn color="primary" variant="flat" @click="goToEdit">Modifier</v-btn>
          <v-btn color="error" variant="flat" @click="deleteDialogOpen = true">Supprimer</v-btn>
        </div>
      </div>

      <v-card class="card" variant="outlined">
        <v-card-text>
          <div v-if="isLoading" class="text-body-2 text-grey-darken-1">Chargement...</div>
          <div v-else-if="event">
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Titre</v-list-item-title>
                <v-list-item-subtitle>{{ event.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Description</v-list-item-title>
                <v-list-item-subtitle>{{ event.description || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Date</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(event.event_date) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Type</v-list-item-title>
                <v-list-item-subtitle>
                  {{ event.reminder_type || (event.is_care ? 'soin' : 'autres') }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Cheval</v-list-item-title>
                <v-list-item-subtitle>{{ event.horse_id || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
          <p v-else class="empty-state">Événement introuvable.</p>
        </v-card-text>
      </v-card>

      <v-dialog v-model="deleteDialogOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer</v-card-title>
          <v-card-text>Confirmer la suppression de cet événement ?</v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="deleteDialogOpen = false">Annuler</v-btn>
            <v-btn color="error" variant="flat" @click="confirmDelete">Supprimer</v-btn>
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventsApi } from '../../api/events'
import type { Event } from '../../types'

const route = useRoute()
const router = useRouter()
const event = ref<Event | null>(null)
const isLoading = ref(true)
const deleteDialogOpen = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const loadEvent = async () => {
  try {
    const id = route.params.id as string
    event.value = await eventsApi.getById(id)
  } catch (error) {
    console.error('Error loading event:', error)
    snackbar.value = { show: true, message: 'Impossible de charger l’événement.', color: 'error' }
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  if (!event.value) return
  router.push({ name: 'EventEdit', params: { id: event.value.id } })
}

const confirmDelete = async () => {
  if (!event.value) return
  try {
    await eventsApi.delete(event.value.id)
    deleteDialogOpen.value = false
    snackbar.value = { show: true, message: 'Événement supprimé.', color: 'success' }
    router.back()
  } catch (error) {
    console.error('Error deleting event:', error)
    snackbar.value = { show: true, message: 'Suppression impossible.', color: 'error' }
  }
}

onMounted(() => {
  loadEvent()
})
</script>

