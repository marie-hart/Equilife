<template>
  <v-container class="horse-form-view" fluid>
    <div class="horse-form-header">
      <v-card-title class="page-title">
        <font-awesome-icon icon="horse" class="fa-icon" />
        {{ isEdit ? 'Modifier un cheval' : 'Ajouter un cheval' }}
      </v-card-title>
      <v-btn variant="text" @click="goBack">Retour</v-btn>
    </div>

    <v-card class="horse-form-card" variant="outlined">
      <v-card-title class="form-title">
        <font-awesome-icon icon="circle-plus" class="fa-icon" />
        {{ isEdit ? 'Fiche cheval' : 'Nouvelle fiche' }}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              label="Nom *"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.breed"
              label="Race"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.birth_date"
              label="Date de naissance"
              variant="outlined"
              density="comfortable"
              type="date"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-file-input
              label="Photo"
              variant="outlined"
              density="comfortable"
              accept="image/*"
              :multiple="false"
              @update:model-value="handleFileChange"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.additional_info"
              label="Infos importantes"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
          </v-col>
        </v-row>
        <div class="form-actions">
          <v-btn
            class="primary-btn"
            color="primary"
            variant="flat"
            :loading="isSubmitting"
            type="button"
            @click="handleSubmit"
          >
            {{ isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer' }}
          </v-btn>
          <v-btn variant="text" @click="goBack">Annuler</v-btn>
          <span v-if="formError" class="form-error">{{ formError }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { horsesApi } from '../api/horses'
import type { CreateHorseDto, Horse } from '../types'

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const formError = ref('')
const selectedPhoto = ref<File | null>(null)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const horseId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => Boolean(horseId.value))

const form = ref<CreateHorseDto>({
  name: '',
  breed: '',
  birth_date: '',
  additional_info: '',
})

const handleFileChange = (files: File[] | File | null) => {
  if (Array.isArray(files)) {
    selectedPhoto.value = files[0] || null
  } else {
    selectedPhoto.value = files || null
  }
}

const loadHorse = async () => {
  if (!horseId.value) return
  try {
    const horse = await horsesApi.getById(horseId.value)
    form.value = {
      name: horse.name,
      breed: horse.breed || '',
      birth_date: horse.birth_date || '',
      additional_info: horse.additional_info || '',
    }
  } catch (error) {
    console.error('Error loading horse:', error)
  }
}

const handleSubmit = async () => {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Le nom du cheval est obligatoire.'
    return
  }

  try {
    isSubmitting.value = true
    let savedHorse: Horse
    const payload = {
      name: form.value.name.trim(),
      breed: form.value.breed?.trim() || undefined,
      birth_date: form.value.birth_date || undefined,
      additional_info: form.value.additional_info?.trim() || undefined,
    }

    if (horseId.value) {
      savedHorse = await horsesApi.update(horseId.value, payload)
    } else {
      savedHorse = await horsesApi.create(payload)
    }

    if (selectedPhoto.value) {
      await horsesApi.uploadPhoto(savedHorse.id, selectedPhoto.value)
    }

    snackbar.value = {
      show: true,
      message: isEdit.value ? 'Cheval mis à jour.' : 'Cheval créé.',
      color: 'success',
    }

    setTimeout(() => {
      router.push('/horses')
    }, 800)
  } catch (error) {
    console.error('Error saving horse:', error)
    formError.value = "Impossible d'enregistrer le cheval."
    snackbar.value = {
      show: true,
      message: 'Enregistrement impossible.',
      color: 'error',
    }
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/horses')
}

onMounted(async () => {
  await loadHorse()
})
</script>

<style scoped>
/* Styles moved to src/styles/HorseForm.css */
</style>
