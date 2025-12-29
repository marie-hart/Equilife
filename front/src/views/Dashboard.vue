<template>
  <div class="dashboard">
    <main class="main-content">
      <div class="dashboard-grid">
        <!-- Soins du jour -->
        <SectionCard title="Soins du jour" icon="list-check" :showAdd="true">
            <v-list v-if="dailyCares.length > 0" density="compact">
              <v-list-item v-for="care in dailyCares" :key="care.id">
                <v-list-item-title class="care-name">{{ care.name }}</v-list-item-title>
                <template #append>
                  <span class="care-time">{{ care.time }}</span>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun soin prévu aujourd'hui</p>
        </SectionCard>

        <!-- Tâches -->
        <SectionCard title="Tâches" icon="list-check" :showAdd="true">
            <v-list v-if="tasks.length > 0" density="compact">
              <v-list-item v-for="task in tasks" :key="task.id">
                <v-checkbox
                  v-model="task.completed"
                  :label="task.name"
                  color="primary"
                  density="comfortable"
                  hide-details
                />
              </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucune tâche</p>
        </SectionCard>

        <!-- Aliments -->
        <SectionCard title="Aliments" icon="bowl-food" :showAdd="true">
            <v-list v-if="foods.length > 0" density="compact">
              <v-list-item v-for="food in foods" :key="food.id">
                <v-list-item-title class="food-name">{{ food.name }}</v-list-item-title>
                <template #append>
                  <span class="food-quantity">{{ food.quantity }}</span>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun aliment enregistré</p>
        </SectionCard>

        <!-- Rendez-vous -->
        <SectionCard title="Rendez-vous" icon="calendar-days">
            <v-list v-if="appointments.length > 0" density="compact">
              <v-list-item v-for="appointment in appointments" :key="appointment.id">
                <v-list-item-subtitle class="appointment-date">
                  {{ formatDate(appointment.date) }}
                </v-list-item-subtitle>
                <v-list-item-title class="appointment-title">{{ appointment.title }}</v-list-item-title>
                <v-list-item-subtitle class="appointment-type">{{ appointment.type }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun rendez-vous</p>
        </SectionCard>

         <!-- Timeline -->
      <SectionCard title="Timeline" icon="timeline">
          <v-list v-if="timelineEvents.length > 0" density="compact" class="timeline-list">
            <v-list-item v-for="event in timelineEvents" :key="event.id" class="timeline-item">
              <div class="timeline-date">{{ formatDate(event.date) }}</div>
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-description">{{ event.description }}</div>
            </v-list-item>
          </v-list>
          <p v-else class="empty-state">Aucun événement récent</p>
      </SectionCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { eventsApi } from '../api/events'
import { materialsApi } from '../api/materials'
import type { Event, Material, Care, Task, Food, Appointment, TimelineEvent } from '../types'
import { useTheme } from 'vuetify'
import { SectionCard } from '../components'

const dailyCares = ref<Care[]>([])
const tasks = ref<Task[]>([])
const foods = ref<Food[]>([])
const appointments = ref<Appointment[]>([])
const timelineEvents = ref<TimelineEvent[]>([])
const route = useRoute()

const routeHorseId = computed(() => route.params.id as string | undefined)
const theme = useTheme()
theme.themes.value.light.colors.primary = '#2AB4C8'


const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getEventType = (name: string): TimelineEvent['type'] => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('veto') || lowerName.includes('vét') || lowerName.includes('vet')) {
    return 'vet'
  }
  if (lowerName.includes('ferr') || lowerName.includes('maréchal') || lowerName.includes('farrier')) {
    return 'farrier'
  }
  if (lowerName.includes('dent')) {
    return 'dentistry'
  }
  if (lowerName.includes('bless') || lowerName.includes('injur')) {
    return 'injury'
  }
  return 'vet'
}

const getEventTypeLabel = (type: TimelineEvent['type']): string => {
  switch (type) {
    case 'farrier':
      return 'Ferrure'
    case 'dentistry':
      return 'Dentisterie'
    case 'injury':
      return 'Blessure'
    default:
      return 'Vétérinaire'
  }
}

const mapEventsToTimeline = (events: Event[]): TimelineEvent[] =>
  events.map((event) => ({
    id: event.id,
    title: event.name,
    description: event.description || 'Aucune description',
    date: event.event_date,
    type: getEventType(event.name),
  }))

const mapEventsToAppointments = (events: Event[]): Appointment[] =>
  events.map((event) => ({
    id: event.id,
    title: event.name,
    type: getEventTypeLabel(getEventType(event.name)),
    date: event.event_date,
  }))

const mapEventsToCares = (events: Event[]): Care[] =>
  events.map((event) => ({
    id: event.id,
    name: event.name,
    time: formatDate(event.event_date),
  }))

const mapMaterialsToFoods = (materials: Material[]): Food[] =>
  materials.map((material) => ({
    id: material.id,
    name: material.name,
    quantity: material.estimated_cost ? `${material.estimated_cost}€` : '—',
  }))

const mapMaterialsToTasks = (materials: Material[]): Task[] =>
  materials.map((material) => ({
    id: material.id,
    name: `Acheter ${material.name}`,
    completed: false,
  }))


const loadDashboard = async () => {
  try {
    const horseId = routeHorseId.value
    const [events, reminders, materials, dueMaterials] = await Promise.all([
      eventsApi.getAll(horseId),
      eventsApi.getReminders(horseId),
      materialsApi.getAll(true, horseId),
      materialsApi.getDueForPurchase(horseId),
    ])

    dailyCares.value = mapEventsToCares(reminders)
    tasks.value = mapMaterialsToTasks(dueMaterials)
    foods.value = mapMaterialsToFoods(materials)
    appointments.value = mapEventsToAppointments(events)
    timelineEvents.value = mapEventsToTimeline(events)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
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

