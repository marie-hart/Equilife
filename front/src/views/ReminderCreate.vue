<template>
  <div class="page">
    <main class="main-content">
      <v-card class="card" variant="outlined">
        <v-card-title>Créer un rappel</v-card-title>
        <v-card-text>
          <ReminderForm
            v-model="createForm"
            :horses="horses"
            :loading="isCreating"
            submit-label="Ajouter"
            @submit="createReminder"
          />
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
import { eventsApi } from '../api/events'
import { horsesApi } from '../api/horses'
import type { Horse } from '../types'
import { ReminderForm } from '../components'

type ReminderFormValue = {
  horseIds: string[]
  description: string
  date: string
}

const route = useRoute()
const router = useRouter()
const horses = ref<Horse[]>([])
const isCreating = ref(false)
const createForm = ref<ReminderFormValue>({ horseIds: [], description: '', date: '' })
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const fromDateInputValue = (value: string): string =>
  new Date(`${value}T00:00:00`).toISOString()

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const setHorseFromQuery = () => {
  const horseId = route.query.horseId
  if (typeof horseId === 'string' && horseId) {
    createForm.value = { ...createForm.value, horseIds: [horseId] }
  }
}

const createReminder = async () => {
  if (
    !createForm.value.horseIds.length ||
    !createForm.value.description ||
    !createForm.value.date
  ) {
    snackbar.value = {
      show: true,
      message: 'Merci de sélectionner un cheval, une description et une date.',
      color: 'error',
    }
    return
  }
  try {
    isCreating.value = true
    await Promise.all(
      createForm.value.horseIds.map((horseId) =>
        eventsApi.create({
          name: createForm.value.description,
          description: createForm.value.description,
          event_date: fromDateInputValue(createForm.value.date),
          horse_id: horseId,
          reminder_enabled: true,
        })
      )
    )
    createForm.value = { horseIds: [], description: '', date: '' }
    setHorseFromQuery()
    snackbar.value = {
      show: true,
      message: 'Rappel(s) créé(s).',
      color: 'success',
    }
    await router.push('/reminders')
  } catch (error) {
    console.error('Error creating reminder:', error)
    snackbar.value = {
      show: true,
      message: 'Création impossible.',
      color: 'error',
    }
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  await loadHorses()
  setHorseFromQuery()
})
</script>

<style scoped>
.main-content {
  padding: 1rem;
}
</style>
