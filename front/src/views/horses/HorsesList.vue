<template>
  <v-container class="horses-view" fluid>
    <div class="d-flex align-center justify-space-between ga-4 mb-6">
      <v-card-title class="ma-0 text-h5">Fiches chevaux</v-card-title>
      <v-btn class="primary-btn" color="primary" variant="flat" @click="goToCreate">
        <font-awesome-icon icon="circle-plus" class="btn-icon me-2" />
        Ajouter
      </v-btn>
    </div>

    <v-row v-if="horses.length" class="mt-2" dense>
      <v-col v-for="horse in horses" :key="horse.id" cols="12" sm="6" md="4" lg="3" class="d-flex">
        <v-card
          class="overflow-hidden d-flex flex-column w-100"
          variant="outlined"
          :height="cardHeight"
          :style="{ maxWidth: cardMaxWidth }"
        >
          <v-card-title
            class="bg-primary text-white text-subtitle-1 d-flex align-center justify-space-between"
          >
            <span>{{ horse.name }}</span>
            <ActionButtons
              class="d-md-none"
              mode="auto"
              button-size="x-small"
              menu-button-size="x-small"
              :actions="getHorseActions(horse)"
            />
          </v-card-title>
          <v-card-text class="pt-2 pb-2" @click="goToDashboard(horse.id)">
            <div class="d-flex align-start justify-space-between ga-3">
              <div class="flex-grow-1 text-truncate">
                <div class="text-body-2 text-grey-darken-1">
                  <span v-if="horse.breed">{{ horse.breed }}</span>
                  <span v-if="horse.age">• {{ horse.age }} ans</span>
                </div>
                <div v-if="horse.additional_info" class="text-caption text-grey-darken-1 mt-2">
                  {{ horse.additional_info }}
                </div>
              </div>
              <v-img
                :src="getPhotoUrl(horse)"
                :alt="horse.name"
                :width="photoWidth"
                :height="photoHeight"
                class="rounded-lg"
                cover
              />
            </div>
          </v-card-text>
          <v-card-actions class="justify-end mt-auto">
            <ActionButtons
              class="d-none d-md-flex align-center ga-2"
              mode="inline"
              button-size="x-small"
              :actions="getHorseActions(horse)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <p v-else class="empty-state">Aucun cheval enregistré</p>

    <v-dialog v-model="isDeleteDialogOpen" max-width="420">
      <v-card>
        <v-card-title>Supprimer le cheval</v-card-title>
        <v-card-text>
          Confirmer la suppression de
          <strong>{{ horseToDelete?.name }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeDeleteDialog">Annuler</v-btn>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { horsesApi } from '../../api/horses'
import { filesBaseUrl } from '../../api/client'
import { ActionButtons } from '../../components'
import type { Horse } from '../../types'

type HorseAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const horses = ref<Horse[]>([])
const isDeleteDialogOpen = ref(false)
const isDeleting = ref(false)
const horseToDelete = ref<Horse | null>(null)
const router = useRouter()
const { xs } = useDisplay()
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const cardHeight = computed(() => (xs.value ? 170 : 190))
const cardMaxWidth = computed(() => (xs.value ? '100%' : '300px'))
const photoWidth = computed(() => (xs.value ? 88 : 96))
const photoHeight = computed(() => (xs.value ? 64 : 72))

const resolveFilesOrigin = (): string => {
  if (filesBaseUrl.startsWith('http')) {
    try {
      const url = new URL(filesBaseUrl)
      const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)
      return isLocal ? window.location.origin : url.origin
    } catch {
      return window.location.origin
    }
  }
  return window.location.origin
}

const normalizePhotoUrl = (path?: string): string => {
  if (!path) return '/placeholder-horse.jpg'
  if (path.startsWith('http')) {
    try {
      const url = new URL(path)
      const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)
      return isLocal ? `${window.location.origin}${url.pathname}` : path
    } catch {
      return path
    }
  }
  if (path.startsWith('/')) return `${resolveFilesOrigin()}${path}`
  return path
}

const getPhotoUrl = (horse: Horse): string => normalizePhotoUrl(horse.photo_path)

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

const goToDetails = (horseId: string) => {
  router.push(`/horses/${horseId}/details`)
}

const goToDashboard = (horseId: string) => {
  router.push(`/horses/${horseId}/dashboard`)
}

const getHorseActions = (horse: Horse): HorseAction[] => [
  {
    key: 'details',
    title: 'Détails',
    icon: 'mdi-eye',
    disabled: false,
    onClick: () => goToDetails(horse.id),
  },
  {
    key: 'edit',
    title: 'Modifier',
    icon: 'mdi-pencil',
    disabled: false,
    onClick: () => goToEdit(horse.id),
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: false,
    onClick: () => openDeleteDialog(horse),
  },
]

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



