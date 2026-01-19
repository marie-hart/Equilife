<template>
  <div class="page">
    <main class="main-content">
      <v-card class="card" variant="outlined">
        <v-card-title>Rappels</v-card-title>
        <v-card-text>
          <div class="reminders-layout">
            <v-card class="section-card" variant="outlined">
              <v-card-title class="section-title">Créer un rappel</v-card-title>
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

            <v-card class="section-card" variant="outlined">
              <v-card-title class="section-title">Filtres</v-card-title>
              <v-card-text>
                <div class="filters-grid">
                  <v-select
                    v-model="selectedHorseId"
                    :items="horseOptions"
                    label="Cheval"
                    density="compact"
                    variant="outlined"
                  />
                  <v-select
                    v-model="selectedStatus"
                    :items="statusOptions"
                    label="Statut"
                    density="compact"
                    variant="outlined"
                  />
                </div>
              </v-card-text>
            </v-card>

            <v-card class="section-card" variant="outlined">
              <v-card-title class="section-title">Liste des rappels</v-card-title>
              <v-card-text>
                <v-row v-if="groupedReminders.length" dense class="reminders-grid">
                  <v-col v-for="group in groupedReminders" :key="group.horseName" cols="12" md="6">
                    <v-card variant="outlined" class="reminders-group-card">
                      <v-card-title class="text-subtitle-1">
                        {{ group.horseName }}
                      </v-card-title>
                      <v-list density="compact">
                        <v-list-item v-for="reminder in group.reminders" :key="reminder.id">
                          <template #prepend>
                            <v-avatar
                              size="10"
                              :color="getStatusColor(reminder)"
                              class="reminder-status"
                            />
                          </template>
                          <v-list-item-title class="text-subtitle-2">
                            {{ getHorseName(reminder) }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 text-grey-darken-1">
                            {{ reminder.description || reminder.name }}
                          </v-list-item-subtitle>
                          <template #append>
                            <div class="d-flex align-center gap-2 reminder-actions">
                              <span class="text-caption text-grey-darken-1">
                                {{ formatDate(reminder.event_date) }}
                              </span>
                              <v-btn
                                icon="mdi-check"
                                size="x-small"
                                variant="text"
                                @click="markDone(reminder)"
                              />
                              <v-btn
                                icon="mdi-pencil"
                                size="x-small"
                                variant="text"
                                @click="editReminder(reminder)"
                              />
                              <v-btn
                                icon="mdi-trash-can"
                                size="x-small"
                                variant="text"
                                @click="openDelete(reminder)"
                              />
                            </div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-col>
                </v-row>
                <p v-else class="empty-state">Aucun rappel pour le moment.</p>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <v-dialog v-model="isEditOpen" max-width="420">
        <v-card>
          <v-card-title>Modifier le rappel</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editForm.description"
              label="Description"
              density="compact"
              variant="outlined"
            />
            <v-text-field
              v-model="editForm.date"
              label="Date"
              type="date"
              density="compact"
              variant="outlined"
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isEditOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="primary" @click="saveEdit">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer le rappel</v-card-title>
          <v-card-text>Confirmer la suppression de ce rappel ?</v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isDeleteOpen = false">Annuler</v-btn>
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
import { eventsApi } from '../api/events'
import { horsesApi } from '../api/horses'
import type { Event, Horse } from '../types'
import { ReminderForm } from '../components'

const reminders = ref<Event[]>([])
const horses = ref<Horse[]>([])
const selectedHorseId = ref<string>('all')
const selectedStatus = ref<'all' | 'overdue' | 'today' | 'upcoming'>('all')
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isCreating = ref(false)
const selectedReminder = ref<Event | null>(null)
const editForm = ref({ description: '', date: '' })
const createForm = ref({ horseIds: [] as string[], description: '', date: '' })
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const horseById = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

const horseOptions = computed(() => [
  { title: 'Tous les chevaux', value: 'all' },
  ...horses.value.map((horse) => ({ title: horse.name, value: horse.id })),
])

const statusOptions = [
  { title: 'Tous', value: 'all' },
  { title: 'En retard', value: 'overdue' },
  { title: "Aujourd'hui", value: 'today' },
  { title: 'À venir', value: 'upcoming' },
]

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const startOfDay = (date: Date): Date => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const isSameDay = (dateString: string, baseDate: Date): boolean => {
  const date = new Date(dateString)
  return date.toDateString() === baseDate.toDateString()
}

const toDateInputValue = (dateString: string): string => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const fromDateInputValue = (value: string): string =>
  new Date(`${value}T00:00:00`).toISOString()

const getStatusColor = (reminder: Event): 'error' | 'warning' | 'success' => {
  const today = startOfDay(new Date())
  if (isSameDay(reminder.event_date, today)) {
    return 'warning'
  }
  return new Date(reminder.event_date) < today ? 'error' : 'success'
}

const getStatusKey = (reminder: Event): 'overdue' | 'today' | 'upcoming' => {
  const today = startOfDay(new Date())
  if (isSameDay(reminder.event_date, today)) {
    return 'today'
  }
  return new Date(reminder.event_date) < today ? 'overdue' : 'upcoming'
}

const getHorseName = (reminder: Event): string => {
  if (!reminder.horse_id) {
    return 'Cheval inconnu'
  }
  return horseById.value.get(reminder.horse_id)?.name ?? 'Cheval inconnu'
}

const filteredReminders = computed(() => {
  const byHorse =
    selectedHorseId.value === 'all'
      ? reminders.value
      : reminders.value.filter((reminder) => reminder.horse_id === selectedHorseId.value)
  const byStatus =
    selectedStatus.value === 'all'
      ? byHorse
      : byHorse.filter((reminder) => getStatusKey(reminder) === selectedStatus.value)
  return [...byStatus].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )
})

const groupedReminders = computed(() => {
  const grouped = new Map<string, Event[]>()
  filteredReminders.value.forEach((reminder) => {
    const horseName = getHorseName(reminder)
    const list = grouped.get(horseName) ?? []
    list.push(reminder)
    grouped.set(horseName, list)
  })
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'fr'))
    .map(([horseName, items]) => ({ horseName, reminders: items }))
})

const markDone = async (reminder: Event) => {
  try {
    await eventsApi.update(reminder.id, { reminder_enabled: false })
    reminders.value = reminders.value.filter((item) => item.id !== reminder.id)
    snackbar.value = {
      show: true,
      message: 'Rappel marqué comme fait.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error marking reminder as done:', error)
    snackbar.value = {
      show: true,
      message: 'Action impossible.',
      color: 'error',
    }
  }
}

const editReminder = (reminder: Event) => {
  selectedReminder.value = reminder
  editForm.value = {
    description: reminder.description || reminder.name,
    date: toDateInputValue(reminder.event_date),
  }
  isEditOpen.value = true
}

const saveEdit = async () => {
  if (!selectedReminder.value) return
  try {
    await eventsApi.update(selectedReminder.value.id, {
      name: editForm.value.description,
      description: editForm.value.description,
      event_date: fromDateInputValue(editForm.value.date),
    })
    await loadReminders()
    isEditOpen.value = false
    snackbar.value = {
      show: true,
      message: 'Rappel mis à jour.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error updating reminder:', error)
    snackbar.value = {
      show: true,
      message: 'Mise à jour impossible.',
      color: 'error',
    }
  }
}

const openDelete = (reminder: Event) => {
  selectedReminder.value = reminder
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedReminder.value) return
  try {
    await eventsApi.delete(selectedReminder.value.id)
    reminders.value = reminders.value.filter((item) => item.id !== selectedReminder.value?.id)
    isDeleteOpen.value = false
    snackbar.value = {
      show: true,
      message: 'Rappel supprimé.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error deleting reminder:', error)
    snackbar.value = {
      show: true,
      message: 'Suppression impossible.',
      color: 'error',
    }
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
    await loadReminders()
    snackbar.value = {
      show: true,
      message: 'Rappel(s) créé(s).',
      color: 'success',
    }
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

const loadReminders = async () => {
  try {
    const [remindersResponse, horsesResponse] = await Promise.all([
      eventsApi.getReminders(),
      horsesApi.getAll(),
    ])
    reminders.value = remindersResponse
    horses.value = horsesResponse
  } catch (error) {
    console.error('Error loading reminders:', error)
  }
}

onMounted(() => {
  loadReminders()
})
</script>

<style scoped>
.main-content {
  padding: 1rem;
}

.create-form {
  margin: 0;
}

.reminders-layout {
  display: grid;
  gap: 1rem;
}

.section-card :deep(.v-card-text) {
  padding-top: 0.75rem;
}

.section-title {
  font-size: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.reminders-grid {
  margin-top: 0;
}

.reminders-group-card {
  height: 100%;
}

.reminder-status {
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.reminder-actions :deep(.v-btn) {
  min-width: auto;
}
</style>
