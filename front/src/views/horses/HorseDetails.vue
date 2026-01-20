<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Détails du cheval</v-card-title>
        <div class="d-flex align-center ga-3 w-100 w-md-auto justify-space-between justify-md-end">
          <v-btn variant="tonal" @click="goBack">Retour</v-btn>
          <v-btn color="primary" variant="flat" @click="goToEdit">Modifier</v-btn>
        </div>
      </div>

      <v-card class="card" variant="outlined">
        <v-card-text>
          <div v-if="isLoading" class="text-body-2 text-grey-darken-1">Chargement...</div>
          <div v-else-if="horse">
            <v-row dense class="ga-4">
              <v-col cols="12" md="8">
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>Nom</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Surnom</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.nickname || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Sexe</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.sex || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Date de naissance</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ horse.birth_date ? formatDate(horse.birth_date) : '-' }}
                    <span v-if="horse.age">• {{ horse.age }} ans</span>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Race</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.breed || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Robe</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.coat || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Écurie / Lieu</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.stable_location || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Alimentation</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.feed || '-' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Note libre</v-list-item-title>
                  <v-list-item-subtitle>{{ horse.additional_info || '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              </v-col>
              <v-col cols="12" md="4">
              <v-img
                :src="getPhotoUrl(horse)"
                :alt="horse.name"
                height="240"
                cover
                class="rounded-lg"
              />
              </v-col>
            </v-row>
          </div>
          <p v-else class="empty-state">Cheval introuvable.</p>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
        {{ snackbar.message }}
      </v-snackbar>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { horsesApi } from '../../api/horses'
import { filesBaseUrl } from '../../api/client'
import type { Horse } from '../../types'

const route = useRoute()
const router = useRouter()
const horse = ref<Horse | null>(null)
const isLoading = ref(true)
const snackbar = ref({
  show: false,
  message: '',
  color: 'error',
})

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

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

const getPhotoUrl = (horseData: Horse): string => normalizePhotoUrl(horseData.photo_path)

const loadHorse = async () => {
  try {
    const id = route.params.id as string
    horse.value = await horsesApi.getById(id)
  } catch (error) {
    console.error('Error loading horse details:', error)
    snackbar.value = {
      show: true,
      message: 'Impossible de charger la fiche.',
      color: 'error',
    }
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/horses')
}

const goToEdit = () => {
  if (!horse.value) return
  router.push(`/horses/${horse.value.id}/edit`)
}

onMounted(() => {
  loadHorse()
})
</script>

