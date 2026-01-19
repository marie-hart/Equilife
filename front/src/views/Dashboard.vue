<template>
  <div class="dashboard">
    <main class="main-content">
      <div class="dashboard-actions">
        <div class="d-flex justify-end">
          <v-btn
            variant="elevated"
            prepend-icon="mdi-plus"
            size="small"
            class="document-btn"
          >
            Document
          </v-btn>
        </div>
      </div>
      <div class="dashboard-grid">
        <!-- Rappels à venir / en retard -->
        <SectionCard title="Rappels" icon="alarm-clock" :showAdd="true" @add="goToReminderCreate">
          <div class="d-flex flex-column gap-4">
            <div>
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-subtitle-2 text-grey-darken-1">En retard</span>
                <v-chip size="x-small" color="error" variant="flat">
                  {{ remindersOverdue.length }}
                </v-chip>
              </div>
              <v-list v-if="remindersOverdue.length" density="compact">
                <v-list-item v-for="reminder in remindersOverdue.slice(0, 3)" :key="reminder.id">
                  <v-list-item-title>{{ reminder.name }}</v-list-item-title>
                  <template #append>
                    <span class="text-caption text-grey-darken-1">
                      {{ formatDate(reminder.event_date) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="empty-state">Aucun rappel en retard</p>
            </div>

            <div>
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-subtitle-2 text-grey-darken-1">À venir</span>
                <v-chip size="x-small" color="primary" variant="flat">
                  {{ remindersUpcoming.length }}
                </v-chip>
              </div>
              <v-list v-if="remindersUpcoming.length" density="compact">
                <v-list-item v-for="reminder in remindersUpcoming.slice(0, 3)" :key="reminder.id">
                  <v-list-item-title>{{ reminder.name }}</v-list-item-title>
                  <template #append>
                    <span class="text-caption text-grey-darken-1">
                      {{ formatDate(reminder.event_date) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="empty-state">Aucun rappel à venir</p>
            </div>
          </div>
        </SectionCard>

        <!-- Soin du jour -->
        <SectionCard title="Soin" icon="house-chimney-medical" :showAdd="true">
          <v-list v-if="todayCares.length" density="compact">
            <v-list-item v-for="care in todayCares" :key="care.id">
              <v-list-item-title>{{ care.name }}</v-list-item-title>
              <template #append>
                <span class="text-caption text-grey-darken-1">
                  {{ formatDate(care.event_date) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
          <p v-else-if="nextCare" class="text-body-2 text-grey-darken-1 mb-0">
            Prochain soin le {{ formatDate(nextCare.event_date) }} — {{ nextCare.name }}
          </p>
          <p v-else class="empty-state">Aucun soin prévu</p>
        </SectionCard>

        <!-- Activité du jour -->
        <SectionCard title="Activité" icon="heart-pulse" :showAdd="true">
          <v-list v-if="todayActivities.length" density="compact">
            <v-list-item v-for="activity in todayActivities" :key="activity.id">
              <v-list-item-title>{{ activity.name }}</v-list-item-title>
              <template #append>
                <span class="text-caption text-grey-darken-1">
                  {{ formatDate(activity.event_date) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="empty-state">Aucune activité aujourd'hui</p>
        </SectionCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventsApi } from '../api/events'
import type { Event } from '../types'
import { useTheme } from 'vuetify'
import { SectionCard } from '../components'

const reminders = ref<Event[]>([])
const events = ref<Event[]>([])
const route = useRoute()
const router = useRouter()

const routeHorseId = computed(() => route.params.id as string | undefined)
const theme = useTheme()
theme.themes.value.light.colors.primary = '#2AB4C8'


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

const sortByDateAsc = (items: Event[]): Event[] =>
  [...items].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

const remindersOverdue = computed(() => {
  const today = startOfDay(new Date())
  return sortByDateAsc(reminders.value.filter((reminder) => new Date(reminder.event_date) < today))
})

const remindersUpcoming = computed(() => {
  const today = startOfDay(new Date())
  return sortByDateAsc(reminders.value.filter((reminder) => new Date(reminder.event_date) >= today))
})

const todayCares = computed(() => {
  const today = startOfDay(new Date())
  return sortByDateAsc(reminders.value.filter((reminder) => isSameDay(reminder.event_date, today)))
})

const nextCare = computed(() => {
  if (todayCares.value.length) {
    return null
  }
  const today = startOfDay(new Date())
  const upcoming = reminders.value.filter((reminder) => new Date(reminder.event_date) > today)
  return sortByDateAsc(upcoming)[0] ?? null
})

const todayActivities = computed(() => {
  const today = startOfDay(new Date())
  return sortByDateAsc(events.value.filter((event) => isSameDay(event.event_date, today)))
})


const loadDashboard = async () => {
  try {
    const horseId = routeHorseId.value
    const [eventsResponse, remindersResponse] = await Promise.all([
      eventsApi.getAll(horseId),
      eventsApi.getReminders(horseId),
    ])

    events.value = eventsResponse
    reminders.value = remindersResponse
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const goToReminderCreate = () => {
  const horseId = routeHorseId.value
  router.push(horseId ? { path: '/reminders/new', query: { horseId } } : '/reminders/new')
}

onMounted(async () => {
  await loadDashboard()
})

watch(
  () => route.params.id,
  () => {
    loadDashboard()
  }
)
</script>

<style scoped>
.main-content {
  padding: 1rem;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.document-btn {
  background-color: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
</style>
