<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Rappels</v-card-title>
        <v-btn class="primary-btn" color="primary" variant="flat" @click="goToReminderCreate">
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
                    :items="horseOptions"
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
                    :items="reminderTypeOptions"
                    label="Type"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Liste des rappels</div>
              <div class="pt-2">
                <v-table v-if="filteredReminders.length" density="compact">
                  <thead>
                    <tr>
                      <th class="d-none d-md-table-cell"></th>
                      <th class="d-none d-md-table-cell">Date</th>
                      <th class="d-none d-md-table-cell">Cheval</th>
                      <th class="d-none d-md-table-cell">Type</th>
                      <th class="d-none d-md-table-cell text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="reminder in filteredReminders" :key="reminder.id">
                      <td class="d-none d-md-table-cell py-3">
                        <v-avatar size="10" :color="getStatusColor(reminder)" class="border border-white elevation-1" />
                      </td>
                      <td class="d-none d-md-table-cell py-3">
                        <div>
                          <div class="text-caption text-grey-darken-1">
                            {{ formatDateLong(getReminderDate(reminder)) }}
                          </div>
                          <div class="text-subtitle-2">
                            {{ getReminderTitle(reminder) }}
                          </div>
                        </div>
                      </td>
                      <td class="d-none d-md-table-cell py-3 text-body-2">
                            {{ getHorseName(reminder) }}
                      </td>
                      <td class="d-none d-md-table-cell py-3">
                              <v-chip
                                v-if="reminder.reminder_type"
                                size="x-small"
                                variant="flat"
                                color="grey-lighten-3"
                              >
                                {{ reminderTypeLabel(reminder.reminder_type) }}
                              </v-chip>
                      </td>
                      <td class="d-none d-md-table-cell py-3 text-center">
                        <ActionButtons
                          class="d-flex align-center justify-center ga-3"
                          mode="inline"
                          button-size="x-small"
                          :actions="getReminderActions(reminder)"
                        />
                      </td>
                      <td class="d-table-cell d-md-none py-3">
                        <v-avatar size="10" :color="getStatusColor(reminder)" class="border border-white elevation-1" />
                      </td>
                      <td class="d-table-cell d-md-none py-3 flex-grow-1">
                        <div class="flex-1">
                          <div class="text-caption text-grey-darken-1">
                            {{ formatDateMobile(getReminderDate(reminder)) }}
                          </div>
                          <div class="text-subtitle-2">
                            {{ getReminderTitle(reminder) }}
                          </div>
                          <div class="text-body-2 text-grey-darken-1">
                            {{ getHorseName(reminder) }}
                          </div>
                          <div class="d-flex align-center ga-2 mt-2">
                            <v-chip
                              v-if="reminder.reminder_type"
                                size="x-small"
                              variant="flat"
                              color="grey-lighten-3"
                            >
                              {{ reminderTypeLabel(reminder.reminder_type) }}
                            </v-chip>
                          </div>
                        </div>
                      </td>
                      <td class="d-table-cell d-md-none py-3 px-2 text-no-wrap">
                        <ActionButtons
                          mode="auto"
                          button-size="x-small"
                          menu-button-size="x-small"
                          :actions="getReminderActions(reminder)"
                              />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <p v-else class="empty-state">Aucun rappel pour le moment.</p>
              </div>
            </div>
          </div>

      <v-dialog v-model="isEditOpen" max-width="420">
        <v-card>
          <v-card-title>Modifier le rappel</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editForm.description"
              label="Description"
              density="compact"
              :error-messages="editErrors.description ? [editErrors.description] : undefined"
            />
            <DatePickerField
              v-model="editForm.date"
              label="Date"
              :error-messages="editErrors.date ? [editErrors.date] : undefined"
            />
            <v-checkbox v-model="editForm.isRecurring" label="Récurrence" density="compact" />
            <v-row v-if="editForm.isRecurring" dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editForm.recurrenceInterval"
                  label="Tous les"
                  type="number"
                  min="1"
                  density="compact"
         
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.recurrenceUnit"
                  :items="recurrenceUnits"
                  label="Unité"
              density="compact"
              variant="outlined"
            />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isEditOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="primary" @click="saveEdit">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer le rappel</v-card-title>
          <v-card-text>Confirmer la suppression de ce rappel ?</v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isDeleteOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="error" @click="confirmDelete">Supprimer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isCareDoneOpen" max-width="420">
        <v-card>
          <v-card-title>Rendez-vous effectué</v-card-title>
          <v-card-text>
            <DatePickerField
              v-model="careDoneForm.date"
              label="Date du rendez-vous"
              :error-messages="careDoneErrors.date ? [careDoneErrors.date] : undefined"
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isCareDoneOpen = false">Annuler</v-btn>
            <v-btn variant="elevated" color="primary" @click="saveCareDone">Valider</v-btn>
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
import { useRouter } from 'vue-router'
import { eventsApi } from '../../api/events'
import { ActionButtons, DatePickerField } from '../../components'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../utils/horseProfile'
import { validateRequiredFieldsMap } from '../../utils/validation'
import type { Event, Horse } from '../../types'
import { isSameDay, startOfDay, formatDateLong, formatDateMobile, fromDateInputValue} from '../../utils/date';

type ReminderAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const reminders = ref<Event[]>([])
const horses = ref<Horse[]>([])
const router = useRouter()
const selectedHorseId = ref<string>('all')
const selectedStatus = ref<'all' | 'overdue' | 'today' | 'upcoming'>('all')
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedReminder = ref<Event | null>(null)
const editForm = ref({
  description: '',
  date: '',
  isRecurring: false,
  recurrenceInterval: 1,
  recurrenceUnit: 'months' as RecurrenceUnit,
})
const editErrors = ref<Record<string, string>>({})
const selectedType = ref<'all' | 'soin' | 'activité' | 'alimentation' | 'autres'>('all')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})
const isCareDoneOpen = ref(false)
const careDoneForm = ref({ date: '' })
const careDoneErrors = ref<Record<string, string>>({})

type RecurrenceUnit = 'days' | 'months' | 'years'

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

const reminderTypeOptions = [
  { title: 'Tous', value: 'all' },
  { title: 'Soin', value: 'soin' },
  { title: 'Activité', value: 'activité' },
  { title: 'Alimentation', value: 'alimentation' },
  { title: 'Autres', value: 'autres' },
]

const recurrenceUnits = [
  { title: 'Jours', value: 'days' },
  { title: 'Mois', value: 'months' },
  { title: 'Ans', value: 'years' },
]

const toDateInputValue = (dateString: string): string => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const getReminderDate = (reminder: Event): string =>
  reminder.next_reminder_date || reminder.event_date

const getStatusColor = (reminder: Event): 'error' | 'warning' | 'success' => {
  const today = startOfDay(new Date())
  if (isSameDay(getReminderDate(reminder), today)) {
    return 'warning'
  }
  return new Date(getReminderDate(reminder)) < today ? 'error' : 'success'
}

const getStatusKey = (reminder: Event): 'overdue' | 'today' | 'upcoming' => {
  const today = startOfDay(new Date())
  if (isSameDay(getReminderDate(reminder), today)) {
    return 'today'
  }
  return new Date(getReminderDate(reminder)) < today ? 'overdue' : 'upcoming'
}

const getHorseName = (reminder: Event): string => {
  if (!reminder.horse_id) {
    return 'Cheval inconnu'
  }
  return horseById.value.get(reminder.horse_id)?.name ?? 'Cheval inconnu'
}

const getReminderTitle = (reminder: Event): string => {
  if (reminder.reminder_type === 'alimentation' && reminder.name) {
    return reminder.name
  }
  return reminder.description || reminder.name
}

const reminderTypeLabel = (type?: Event['reminder_type']): string => {
  switch (type) {
    case 'soin':
      return 'Soin'
    case 'activité':
      return 'Activité'
    case 'alimentation':
      return 'Alimentation'
    case 'autres':
    default:
      return 'Autres'
  }
}

const goToReminderCreate = () => {
  router.push('/reminders/new')
}

const setHorseFromStorage = () => {
  const storedHorseId = getStoredHorseId()
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId
  }
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
  const byType =
    selectedType.value === 'all'
      ? byStatus
      : byStatus.filter((reminder) => reminder.reminder_type === selectedType.value)
  return [...byType].sort(
    (a, b) => new Date(getReminderDate(a)).getTime() - new Date(getReminderDate(b)).getTime()
  )
})


const isCareRecurring = (reminder: Event): boolean => {
  return (
    reminder.reminder_type === 'soin' &&
    reminder.reminder_enabled &&
    Boolean(
      reminder.reminder_interval_days ||
        reminder.reminder_interval_months ||
        reminder.reminder_interval_years
    )
  )
}

const markDone = async (reminder: Event) => {
  if (isCareRecurring(reminder)) {
    selectedReminder.value = reminder
    careDoneForm.value = { date: toDateInputValue(getReminderDate(reminder)) }
    isCareDoneOpen.value = true
    return
  }
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
  const hasMonthlyRecurrence = Boolean(reminder.reminder_interval_months)
  const hasYearlyRecurrence = Boolean(reminder.reminder_interval_years)
  const hasDailyRecurrence = Boolean(reminder.reminder_interval_days)
  const recurrenceUnit: RecurrenceUnit = hasYearlyRecurrence
    ? 'years'
    : hasMonthlyRecurrence
      ? 'months'
      : 'days'
  const recurrenceInterval = hasYearlyRecurrence
    ? reminder.reminder_interval_years || 1
    : hasMonthlyRecurrence
      ? reminder.reminder_interval_months || 1
      : reminder.reminder_interval_days || 1
  editForm.value = {
    description: reminder.description || reminder.name,
    date: toDateInputValue(reminder.event_date),
    isRecurring: hasMonthlyRecurrence || hasYearlyRecurrence || hasDailyRecurrence,
    recurrenceInterval,
    recurrenceUnit,
  }
  isEditOpen.value = true
}

const getReminderActions = (reminder: Event): ReminderAction[] => [
  {
    key: 'done',
    title: 'Valider',
    icon: 'mdi-check',
    disabled: false,
    onClick: () => markDone(reminder),
  },
  {
    key: 'edit',
    title: 'Éditer',
    icon: 'mdi-pencil',
    disabled: false,
    onClick: () => editReminder(reminder),
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: false,
    onClick: () => openDelete(reminder),
  },
]

const saveCareDone = async () => {
  if (!selectedReminder.value) return
  if (!careDoneForm.value.date) {
    snackbar.value = {
      show: true,
      message: 'Merci de renseigner la date du rendez-vous.',
      color: 'error',
    }
    return
  }
  try {
    const appointmentDate = fromDateInputValue(careDoneForm.value.date)
    await eventsApi.create({
      name: selectedReminder.value.name,
      description: selectedReminder.value.description,
      event_date: appointmentDate,
      horse_id: selectedReminder.value.horse_id,
      is_care: true,
      reminder_type: 'soin',
      reminder_enabled: false,
    })
    await eventsApi.update(selectedReminder.value.id, {
      event_date: appointmentDate,
      reminder_enabled: true,
      reminder_interval_days: selectedReminder.value.reminder_interval_days,
      reminder_interval_months: selectedReminder.value.reminder_interval_months,
      reminder_interval_years: selectedReminder.value.reminder_interval_years,
    })
    await loadReminders()
    isCareDoneOpen.value = false
    snackbar.value = {
      show: true,
      message: 'Soin enregistré et rappel reprogrammé.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error saving care appointment:', error)
    snackbar.value = {
      show: true,
      message: 'Action impossible.',
      color: 'error',
    }
  }
}

const saveEdit = async () => {
  if (!selectedReminder.value) return
  try {
    const { errors, firstError } = await validateRequiredFieldsMap([
      { key: 'description', label: 'une description', value: editForm.value.description },
      { key: 'date', label: 'une date', value: editForm.value.date },
    ])
    editErrors.value = errors
    if (firstError) {
      snackbar.value = {
        show: true,
        message: firstError,
        color: 'error',
      }
      return
    }
    if (editForm.value.isRecurring && (!editForm.value.recurrenceInterval || editForm.value.recurrenceInterval < 1)) {
      snackbar.value = {
        show: true,
        message: 'Merci de renseigner une récurrence valide.',
        color: 'error',
      }
      return
    }
    const intervalDays =
      editForm.value.isRecurring && editForm.value.recurrenceUnit === 'days'
        ? editForm.value.recurrenceInterval
        : 0
    const intervalMonths =
      editForm.value.isRecurring && editForm.value.recurrenceUnit === 'months'
        ? editForm.value.recurrenceInterval
        : 0
    const intervalYears =
      editForm.value.isRecurring && editForm.value.recurrenceUnit === 'years'
        ? editForm.value.recurrenceInterval
        : 0
    await eventsApi.update(selectedReminder.value.id, {
      name: editForm.value.description,
      description: editForm.value.description,
      event_date: fromDateInputValue(editForm.value.date),
      reminder_interval_days: intervalDays,
      reminder_interval_months: intervalMonths,
      reminder_interval_years: intervalYears,
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
    const { errors, firstError } = await validateRequiredFieldsMap([
      { key: 'date', label: 'une date', value: careDoneForm.value.date },
    ])
    careDoneErrors.value = errors
    if (firstError) {
      snackbar.value = {
        show: true,
        message: firstError,
        color: 'error',
      }
      return
    }
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
  setHorseFromStorage()
  loadReminders()
})
</script>

