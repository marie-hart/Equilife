<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Santé</v-card-title>
        <v-btn class="primary-btn" color="primary" variant="flat" @click="goToCareCreate">
          <v-icon icon="mdi-plus" class="me-2" />
          Ajouter
        </v-btn>
      </div>
          <div class="d-flex flex-column ga-4">
            <v-card class="section-card" variant="outlined">
              <v-card-title class="text-subtitle-1">Filtres</v-card-title>
              <v-card-text class="pt-3">
                <v-row dense>
                  <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedHorseId"
                    :items="horseFilterOptions"
                    label="Cheval"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                  <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedStatus"
                    :items="statusOptions"
                    label="Statut"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                  <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedType"
                    :items="careTypeOptions"
                    label="Type de soin"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Liste des soins</div>
              <div class="pt-2">
                <v-list v-if="filteredCares.length" density="compact" class="d-flex flex-column ga-2">
                  <v-list-item v-for="care in filteredCares" :key="care.id" class="rounded-lg bg-grey-lighten-4">
                    <v-row class="w-100 align-center" dense>
                      <v-col cols="4" class="text-caption text-grey-darken-1 d-md-none">
                        {{ formatDateMobile(care.event_date) }}
                      </v-col>
                      <v-col cols="6" class="d-md-none">
                        <div class="text-subtitle-2">{{ care.name }}</div>
                        <div class="text-body-2 text-grey-darken-1">{{ getHorseName(care) }}</div>
                        <div class="text-caption text-grey-darken-1" v-if="recurrenceLabel(care) !== '-'">
                          {{ recurrenceLabel(care) }}
                        </div>
                      </v-col>
                      <v-col cols="2" class="d-md-none text-right">
                        <ActionButtons
                          mode="auto"
                          button-size="x-small"
                          menu-button-size="x-small"
                          :actions="getCareActions(care)"
                        />
                      </v-col>

                      <v-col cols="2" class="text-caption text-grey-darken-1 d-none d-md-block">
                        {{ formatDate(care.event_date) }}
                      </v-col>
                      <v-col cols="4" class="text-subtitle-2 d-none d-md-block">
                        {{ care.name }}
                      </v-col>
                      <v-col cols="2" class="text-body-2 text-grey-darken-1 d-none d-md-block">
                        {{ getHorseName(care) }}
                      </v-col>
                      <v-col cols="2" class="text-body-2 text-grey-darken-1 d-none d-md-block">
                        {{ recurrenceLabel(care) }}
                      </v-col>
                      <v-col cols="2" class="text-right d-none d-md-block">
                        <ActionButtons
                          class="d-flex justify-end ga-2"
                          mode="inline"
                          button-size="x-small"
                          :actions="getCareActions(care)"
                        />
                  </v-col>
                </v-row>
                  </v-list-item>
                </v-list>
                <p v-else class="empty-state">Aucun soin pour le moment.</p>
              </div>
            </div>
          </div>

      <v-dialog v-model="isEditOpen" max-width="420">
        <v-card>
          <v-card-title>Modifier le soin</v-card-title>
          <v-card-text>
      <v-text-field
        v-model="editForm.name"
        label="Nom"
        density="compact"
        :error-messages="editErrors.name ? [editErrors.name] : undefined"
      />
            <v-textarea
              v-model="editForm.description"
              label="Description"
              density="compact"
              variant="outlined"
              rows="2"
            />
            <DatePickerField
              v-model="editForm.date"
              label="Date"
              :error-messages="editErrors.date ? [editErrors.date] : undefined"
            />
        </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isEditOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="primary" @click="saveEdit">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer le soin</v-card-title>
          <v-card-text>Confirmer la suppression de ce soin ?</v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isDeleteOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="error" @click="confirmDelete">Supprimer</v-btn>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventsApi } from '../../api/events'
import { ActionButtons, DatePickerField } from '../../components'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../utils/horseProfile'
import { validateRequiredFieldsMap } from '../../utils/validation'
import type { Event, Horse } from '../../types'

type CareAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const horses = ref<Horse[]>([])
const cares = ref<Event[]>([])
const selectedHorseId = ref<string>('all')
const selectedStatus = ref<'all' | 'past' | 'today' | 'upcoming'>('all')
const selectedType = ref<string>('all')
const router = useRouter()
const route = useRoute()
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
)

const horseFilterOptions = computed(() => [
  { title: 'Tous les chevaux', value: 'all' },
  ...horseOptions.value,
])
const statusOptions = [
  { title: 'Tous', value: 'all' },
  { title: 'Passé', value: 'past' },
  { title: "Aujourd'hui", value: 'today' },
  { title: 'À venir', value: 'upcoming' },
]

const careTypeOptions = computed(() => {
  const uniqueTypes = Array.from(
    new Set(
      cares.value
        .map((care) => care.name?.trim())
        .filter((name): name is string => Boolean(name))
    )
  ).sort((a, b) => a.localeCompare(b, 'fr'))
  return [{ title: 'Tous', value: 'all' }, ...uniqueTypes.map((name) => ({ title: name, value: name }))]
})

const horseById = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDateMobile = (dateString: string): string => {
  const date = new Date(dateString)
  const currentYear = new Date().getFullYear()
  const monthShort = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  return date.getFullYear() !== currentYear
    ? `${date.getDate()} ${monthShort} ${date.getFullYear()}`
    : `${date.getDate()} ${monthShort}`
}

const recurrenceLabel = (care: Event): string => {
  const days = care.reminder_interval_days
  const months = care.reminder_interval_months
  const years = care.reminder_interval_years
  if (!care.reminder_enabled || (!days && !months && !years)) return '-'
  if (days) return `Tous les ${days} jour${days > 1 ? 's' : ''}`
  if (months) return `Tous les ${months} mois`
  if (years) return `Tous les ${years} an${years > 1 ? 's' : ''}`
  return '-'
}

const toDateInputValue = (dateString: string): string => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const fromDateInputValue = (value: string): string =>
  new Date(`${value}T00:00:00`).toISOString()

const startOfDay = (date: Date): Date => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const isSameDay = (dateString: string, baseDate: Date): boolean => {
  const date = new Date(dateString)
  return date.toDateString() === baseDate.toDateString()
}

const getHorseName = (care: Event): string => {
  if (!care.horse_id) {
    return 'Cheval inconnu'
  }
  return horseById.value.get(care.horse_id)?.name ?? 'Cheval inconnu'
}

const getStatusKey = (care: Event): 'past' | 'today' | 'upcoming' => {
  const today = startOfDay(new Date())
  if (isSameDay(care.event_date, today)) {
    return 'today'
  }
  return new Date(care.event_date) < today ? 'past' : 'upcoming'
}

const filteredCares = computed(() => {
  const byHorse =
    selectedHorseId.value === 'all'
      ? cares.value
      : cares.value.filter((care) => care.horse_id === selectedHorseId.value)
  const byStatus =
    selectedStatus.value === 'all'
      ? byHorse
      : byHorse.filter((care) => getStatusKey(care) === selectedStatus.value)
  const byType =
    selectedType.value === 'all'
      ? byStatus
      : byStatus.filter((care) => (care.name || '').trim() === selectedType.value)
  return [...byType].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )
})

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedCare = ref<Event | null>(null)
const editForm = ref({ name: '', description: '', date: '' })
const editErrors = ref<Record<string, string>>({})

const loadCares = async () => {
  try {
    const events = await eventsApi.getAll()
    cares.value = events.filter((event) => event.is_care)
  } catch (error) {
    console.error('Error loading cares:', error)
  }
}

const openEdit = (care: Event) => {
  selectedCare.value = care
  editForm.value = {
    name: care.name,
    description: care.description || '',
    date: toDateInputValue(care.event_date),
  }
  isEditOpen.value = true
}

const saveEdit = async () => {
  if (!selectedCare.value) return
  try {
    const { errors, firstError } = await validateRequiredFieldsMap([
      { key: 'name', label: 'un nom', value: editForm.value.name.trim() },
      { key: 'date', label: 'une date', value: editForm.value.date },
    ])
    editErrors.value = errors
    if (firstError) {
      snackbar.value = { show: true, message: firstError, color: 'error' }
      return
    }
    await eventsApi.update(selectedCare.value.id, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || undefined,
      event_date: fromDateInputValue(editForm.value.date),
    })
    await loadCares()
    isEditOpen.value = false
    snackbar.value = { show: true, message: 'Soin mis à jour.', color: 'success' }
  } catch (error) {
    console.error('Error updating care:', error)
    snackbar.value = { show: true, message: 'Mise à jour impossible.', color: 'error' }
  }
}

const openDelete = (care: Event) => {
  selectedCare.value = care
  isDeleteOpen.value = true
}

const getCareActions = (care: Event): CareAction[] => [
  {
    key: 'edit',
    title: 'Éditer',
    icon: 'mdi-pencil',
    disabled: false,
    onClick: () => openEdit(care),
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: false,
    onClick: () => openDelete(care),
  },
]

const confirmDelete = async () => {
  if (!selectedCare.value) return
  try {
    await eventsApi.delete(selectedCare.value.id)
    await loadCares()
    isDeleteOpen.value = false
    snackbar.value = { show: true, message: 'Soin supprimé.', color: 'success' }
  } catch (error) {
    console.error('Error deleting care:', error)
    snackbar.value = { show: true, message: 'Suppression impossible.', color: 'error' }
  }
}

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const goToCareCreate = () => {
  const horseId = route.params.id as string | undefined
  if (horseId) {
    router.push({ name: 'HorseCareCreate', params: { id: horseId } })
    return
  }
  router.push('/horses')
}

const setHorseFromStorage = () => {
  const storedHorseId = getStoredHorseId()
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId
  }
}

onMounted(() => {
  setHorseFromStorage()
  loadHorses()
  loadCares()
})
</script>

