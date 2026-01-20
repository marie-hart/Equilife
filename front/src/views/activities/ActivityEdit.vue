<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Modifier une activité</v-card-title>
        <v-btn variant="outlined" @click="goBack">Retour</v-btn>
      </div>
      <v-card class="card" variant="outlined">
        <v-card-text>
          <div v-if="isLoading" class="text-body-2 text-grey-darken-1">Chargement...</div>
          <v-row v-else dense>
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
              <v-select
                v-model="form.activityType"
                :items="activityTypes"
                label="Type d'activité"
                density="compact"
                variant="outlined"
                :error-messages="fieldErrors.activityType ? [fieldErrors.activityType] : undefined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <DatePickerField
                v-model="form.date"
                label="Date"
                :error-messages="fieldErrors.date ? [fieldErrors.date] : undefined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="form.duration"
                label="Durée (min)"
                type="number"
                min="0"
                density="compact"
        
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.intensity"
                :items="intensityOptions"
                label="Intensité"
                density="compact"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.comment"
                label="Commentaire"
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
              @click="saveActivity"
            >
              Enregistrer
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
import { eventsApi } from '../../api/events'
import { horsesApi } from '../../api/horses'
import { DatePickerField } from '../../components'
import { validateRequiredFieldsMap } from '../../utils/validation'
import type { Horse } from '../../types'

type IntensityValue = 'legere' | 'normale' | 'soutenue'

const route = useRoute()
const router = useRouter()
const horses = ref<Horse[]>([])
const selectedHorseId = ref<string>('')
const isSubmitting = ref(false)
const isLoading = ref(true)
const fieldErrors = ref<Record<string, string>>({})
const form = ref({
  activityType: '',
  date: '',
  duration: 0,
  intensity: 'normale' as IntensityValue,
  comment: '',
})
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const activityTypes = [
  { title: 'Travail monté', value: 'travail monté' },
  { title: 'Travail à pied', value: 'travail à pied' },
  { title: 'Balade', value: 'balade' },
  { title: 'Longe', value: 'longe' },
  { title: 'Repos', value: 'repos' },
  { title: 'Autre', value: 'autre' },
]

const intensityOptions = [
  { title: 'Légère', value: 'legere' },
  { title: 'Normal', value: 'normale' },
  { title: 'Soutenu', value: 'soutenue' },
]

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
)

const toDateInputValue = (dateString: string): string => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const fromDateInputValue = (value: string): string =>
  new Date(`${value}T00:00:00`).toISOString()

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const loadActivity = async () => {
  try {
    const id = route.params.id as string
    const event = await eventsApi.getById(id)
    selectedHorseId.value = event.horse_id || ''
    form.value = {
      activityType: event.activity_type || event.name,
      date: toDateInputValue(event.event_date),
      duration: event.activity_duration_minutes || 0,
      intensity: (event.activity_intensity as IntensityValue) || 'normale',
      comment: event.activity_comment || event.description || '',
    }
  } catch (error) {
    console.error('Error loading activity:', error)
    snackbar.value = {
      show: true,
      message: "Impossible de charger l'activité.",
      color: 'error',
    }
  } finally {
    isLoading.value = false
  }
}

const saveActivity = async () => {
  const { errors, firstError } = await validateRequiredFieldsMap([
    { key: 'horseId', label: 'un cheval', value: selectedHorseId.value },
    { key: 'activityType', label: "un type d'activité", value: form.value.activityType },
    { key: 'date', label: 'une date', value: form.value.date },
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

  try {
    isSubmitting.value = true
    const id = route.params.id as string
    await eventsApi.update(id, {
      name: form.value.activityType,
      description: form.value.comment || undefined,
      event_date: fromDateInputValue(form.value.date),
      horse_id: selectedHorseId.value,
      reminder_type: 'activité',
      activity_type: form.value.activityType,
      activity_duration_minutes: form.value.duration || undefined,
      activity_intensity: form.value.intensity,
      activity_comment: form.value.comment || undefined,
    })
    snackbar.value = {
      show: true,
      message: 'Activité mise à jour.',
      color: 'success',
    }
    goBack()
  } catch (error) {
    console.error('Error updating activity:', error)
    snackbar.value = {
      show: true,
      message: 'Modification impossible.',
      color: 'error',
    }
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  if (selectedHorseId.value) {
    router.push({ name: 'HorseActivities', params: { id: selectedHorseId.value } })
    return
  }
  router.push('/horses')
}

onMounted(async () => {
  await loadHorses()
  await loadActivity()
})
</script>

