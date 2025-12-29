<template>
  <v-container class="horses-view" fluid>
    <div class="horses-header">
      <v-card-title class="page-title">
        <font-awesome-icon icon="horse" class="fa-icon" />
        Fiches chevaux
      </v-card-title>
      <v-btn class="primary-btn" color="primary" variant="flat" @click="goToCreate">
        <font-awesome-icon icon="circle-plus" class="btn-icon" />
        Ajouter
      </v-btn>
    </div>

    <v-row class="horses-grid" dense>
      <v-col v-for="horse in horses" :key="horse.id" cols="12" md="6">
        <v-card class="horse-card" variant="outlined">
          <v-card-text>
            <div class="horse-card-content" @click="goToDashboard(horse.id)">
              <div class="horse-info">
                <h2 class="horse-name">{{ horse.name }}</h2>
                <p class="horse-meta">
                  <span v-if="horse.breed">{{ horse.breed }}</span>
                  <span v-if="horse.age">• {{ horse.age }} ans</span>
                </p>
                <p v-if="horse.additional_info" class="horse-description">
                  {{ horse.additional_info }}
                </p>
              </div>
              <div class="horse-photo">
                <v-img :src="getPhotoUrl(horse)" :alt="horse.name" cover />
              </div>
            </div>
            <div class="horse-actions">
              <v-btn variant="text" size="small" @click="goToEdit(horse.id)">
                <font-awesome-icon icon="pen" class="btn-icon" />
                Modifier
              </v-btn>
              <v-btn variant="text" size="small" color="error" @click="openDeleteDialog(horse)">
                <font-awesome-icon icon="trash" class="btn-icon" />
                Supprimer
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" v-if="horses.length === 0">
        <p class="empty-state">Aucun cheval enregistré</p>
      </v-col>
    </v-row>

    <v-dialog v-model="isDeleteDialogOpen" max-width="420">
      <v-card>
        <v-card-title>Supprimer le cheval</v-card-title>
        <v-card-text>
          Confirmer la suppression de
          <strong>{{ horseToDelete?.name }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Annuler</v-btn>
          <v-btn color="error" variant="flat" :loading="isDeleting" @click="confirmDelete">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { horsesApi } from '../api/horses'
import type { Horse } from '../types'

const horses = ref<Horse[]>([])
const isDeleteDialogOpen = ref(false)
const isDeleting = ref(false)
const horseToDelete = ref<Horse | null>(null)
const router = useRouter()
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const getPhotoUrl = (horse: Horse): string => {
  return horse.photo_path || '/placeholder-horse.jpg'
}

const goToCreate = () => {
  router.push('/horses/new')
}

const goToEdit = (horseId: string) => {
  router.push(`/horses/${horseId}/edit`)
}

const openDeleteDialog = (horse: Horse) => {
  horseToDelete.value = horse
  isDeleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  horseToDelete.value = null
}

const goToDashboard = (horseId: string) => {
  router.push(`/horses/${horseId}/dashboard`)
}

const confirmDelete = async () => {
  if (!horseToDelete.value) return
  try {
    isDeleting.value = true
    await horsesApi.delete(horseToDelete.value.id)
    horses.value = await horsesApi.getAll()
    closeDeleteDialog()
    snackbar.value = {
      show: true,
      message: 'Cheval supprimé.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error deleting horse:', error)
    snackbar.value = {
      show: true,
      message: 'Suppression impossible.',
      color: 'error',
    }
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
})
</script>


