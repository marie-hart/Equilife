<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Ajouter un document</v-card-title>
        <v-btn variant="outlined" @click="goBack">Retour</v-btn>
      </div>
      <v-card class="card" variant="outlined">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedHorseId"
                :items="horseOptions"
                label="Cheval"
                density="compact"
                variant="outlined"
                :error-messages="fieldErrors.horseId ? [fieldErrors.horseId] : undefined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.title"
                label="Titre"
                density="compact"
                :error-messages="fieldErrors.title ? [fieldErrors.title] : undefined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <DatePickerField v-model="form.documentDate" label="Date" />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="form.tag"
                :items="tagOptions"
                label="Tags"
                density="compact"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                label="Fichier"
                density="compact"
                variant="outlined"
                :multiple="false"
                :error-messages="fieldErrors.file ? [fieldErrors.file] : undefined"
                @update:model-value="handleFileChange"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.note"
                label="Note"
                density="compact"
                variant="outlined"
                rows="3"
              />
            </v-col>
          </v-row>
          <div class="d-flex justify-end">
            <v-btn
              variant="elevated"
              color="primary"
              size="small"
              :loading="isSubmitting"
              @click="createDocument"
            >
              Ajouter
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
        {{ snackbar.message }}
      </v-snackbar>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { documentsApi } from '../../api/documents'
import { DatePickerField } from '../../components'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../libs/horseProfile.js'
import { validateRequiredFieldsMap } from '../../utils/validation'
import type { Horse } from '../../types'

type DocumentTag =
  | 'carte_immatriculation'
  | 'certificats'
  | 'ordonnances'
  | 'factures'
  | 'assurance'
  | 'autres'

const route = useRoute()
const router = useRouter()
const horseId = route.params.id as string | undefined
const horses = ref<Horse[]>([])
const selectedHorseId = ref<string>('')
const isSubmitting = ref(false)
const selectedFile = ref<File | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const form = ref({
  title: '',
  documentDate: '',
  tag: 'autres' as DocumentTag,
  note: '',
})
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const tagOptions = [
  { title: "Carte d'immatriculation", value: 'carte_immatriculation' },
  { title: 'Certificats', value: 'certificats' },
  { title: 'Ordonnances', value: 'ordonnances' },
  { title: 'Factures', value: 'factures' },
  { title: 'Assurance', value: 'assurance' },
  { title: 'Autres', value: 'autres' },
]

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
)

const handleFileChange = (files: File[] | File | null) => {
  if (Array.isArray(files)) {
    selectedFile.value = files[0] || null
  } else {
    selectedFile.value = files || null
  }
}

const createDocument = async () => {
  const { errors, firstError } = await validateRequiredFieldsMap([
    { key: 'horseId', label: 'un cheval', value: selectedHorseId.value },
    { key: 'title', label: 'un titre', value: form.value.title },
    { key: 'file', label: 'un fichier', value: selectedFile.value },
  ])
  fieldErrors.value = errors
  if (firstError) {
    snackbar.value = {
      show: true,
      message: firstError,
      color: 'error',
    }
    return
  }
  const file = selectedFile.value
  if (!file) {
    fieldErrors.value = { ...fieldErrors.value, file: 'Le fichier est requis.' }
    snackbar.value = {
      show: true,
      message: 'Le fichier est requis.',
      color: 'error',
    }
    return
  }
  try {
    isSubmitting.value = true
    await documentsApi.create({
      horse_id: selectedHorseId.value,
      title: form.value.title.trim(),
      document_date: form.value.documentDate || undefined,
      tag: form.value.tag,
      note: form.value.note || undefined,
      file,
    })
    snackbar.value = {
      show: true,
      message: 'Document ajouté.',
      color: 'success',
    }
    goBack()
  } catch (error) {
    console.error('Error creating document:', error)
    snackbar.value = {
      show: true,
      message: 'Création impossible.',
      color: 'error',
    }
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  if (selectedHorseId.value) {
    router.push({ name: 'HorseDocuments', params: { id: selectedHorseId.value } })
    return
  }
  router.push('/horses')
}

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const setHorseFromRoute = () => {
  if (horseId) {
    selectedHorseId.value = horseId
    return
  }
  const storedHorseId = getStoredHorseId()
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId
  }
}

onMounted(() => {
  loadHorses()
  setHorseFromRoute()
})
</script>

