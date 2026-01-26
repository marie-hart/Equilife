<template>
  <div>
    <v-sheet class="header" elevation="0">
      <div class="d-flex align-center justify-space-between">
        <img src="/logo-app.png" alt="EquiLife" class="app-logo" />
        <v-btn
          icon="mdi-bell-outline"
          variant="text"
          color="white"
          @click="goToReminders"
        />
      </div>
      <HeaderNavigation
        :active-tab="activeTab"
        :is-more-open="isMoreOpen"
        :nav-items="navItems"
        @navigate="navigate"
        @update:active-tab="(value) => (activeTab = value)"
        @update:is-more-open="(value) => (isMoreOpen = value)"
      />
    </v-sheet>
    <v-card class="horse-card rounded-xl ma-3" variant="outlined">
      <v-card-text class="pa-0">
        <HeaderHorseProfile
          :horse-profile="horseProfile"
          :horses="horses"
          @select="handleHorseSelect"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { horsesApi } from '../../api/horses'
import type { Horse } from '../../types'
// @ts-ignore Vue SFC default export is provided by vue-tsc
import HeaderHorseProfile from './HeaderHorseProfile.vue'
// @ts-ignore Vue SFC default export is provided by vue-tsc
import HeaderNavigation from './HeaderNavigation.vue'

const horseProfile = ref<Horse | null>(null)
const horses = ref<Horse[]>([])
const SELECTED_HORSE_ID_KEY = 'selectedHorseId'
type NavTab =
  | 'dashboard'
  | 'reminders'
  | 'health'
  | 'activities'
  | 'documents'
  | 'feeding'
  | 'products'
  | 'horses'

type NavItem = {
  tab: NavTab
  label: string
  routeName:
    | 'HorseDashboardView'
    | 'Reminders'
    | 'HorseHealth'
    | 'HorseActivities'
    | 'HorseDocuments'
    | 'HorseFeeding'
    | 'HorseProducts'
    | 'Horses'
  icon: string
}

const navItems: NavItem[] = [
  { tab: 'dashboard', label: 'Dashboard', routeName: 'HorseDashboardView', icon: 'house' },
  { tab: 'reminders', label: 'Rappels', routeName: 'Reminders', icon: 'bell' },
  { tab: 'health', label: 'Santé', routeName: 'HorseHealth', icon: 'house-chimney-medical' },
  { tab: 'activities', label: 'Activités', routeName: 'HorseActivities', icon: 'heart-pulse' },
  { tab: 'documents', label: 'Documents', routeName: 'HorseDocuments', icon: 'file-lines' },
  { tab: 'feeding', label: 'Alimentation', routeName: 'HorseFeeding', icon: 'bowl-food' },
  { tab: 'products', label: 'Produits', routeName: 'HorseProducts', icon: 'box-open' },
  { tab: 'horses', label: 'Fiches', routeName: 'Horses', icon: 'horse' },
]

const activeTab = ref<NavTab>('dashboard')
const isMoreOpen = ref(false)

const route = useRoute()
const router = useRouter()

const getStoredHorseId = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_HORSE_ID_KEY)
  } catch (error) {
    console.warn('Unable to read horse profile from storage:', error)
    return null
  }
}

const setStoredHorseId = (horseId: string) => {
  try {
    localStorage.setItem(SELECTED_HORSE_ID_KEY, horseId)
  } catch (error) {
    console.warn('Unable to store horse profile:', error)
  }
}

const resolveHorseId = (): string | null => {
  const routeHorseId = route.params.id as string | undefined
  if (routeHorseId) {
    setStoredHorseId(routeHorseId)
    return routeHorseId
  }
  return getStoredHorseId()
}

const clearStoredHorseId = () => {
  try {
    localStorage.removeItem(SELECTED_HORSE_ID_KEY)
  } catch (error) {
    console.warn('Unable to clear horse profile from storage:', error)
  }
}

const loadHorseProfile = async () => {
  try {
    const horseId = resolveHorseId()
    const horse = horseId ? await horsesApi.getById(horseId) : await horsesApi.getFirst()
    horseProfile.value = horse || null
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 404) {
      clearStoredHorseId()
      try {
        const horse = await horsesApi.getFirst()
        horseProfile.value = horse || null
        return
      } catch (fallbackError) {
        console.error('Error loading horse profile fallback:', fallbackError)
        horseProfile.value = null
        return
      }
    }
    console.error('Error loading horse profile:', error)
  }
}

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses list:', error)
    horses.value = []
  }
}

// Charger les données du cheval
onMounted(async () => {
  await Promise.all([loadHorseProfile(), loadHorses()])
  // TODO: Charger dailyCares, tasks, foods, appointments depuis l'API
})

watch(
  () => route.params.id,
  async () => {
    await loadHorseProfile()
  }
)

const navigate = (name: NavItem['routeName']) => {
  if (name === 'Reminders') {
    router.push({ name })
    isMoreOpen.value = false
    return
  }
  isMoreOpen.value = false
  if (name === 'Horses') {
    router.push({ name })
    return
  }
  const horseId = horseProfile.value?.id
  if (horseId) {
    router.push({ name, params: { id: horseId } })
    return
  }
  router.push({ name: 'Dashboard' })
}

const goToReminders = () => {
  router.push({ name: 'Reminders' })
}

const horseRouteNames = new Set([
  'HorseDashboardView',
  'HorseHealth',
  'HorseCareCreate',
  'HorseActivities',
  'HorseActivityCreate',
  'HorseDocuments',
  'HorseDocumentCreate',
  'HorseFeeding',
  'HorseFeedingCreate',
  'HorseProducts',
  'HorseProductCreate',
  'HorseDetails',
])

const handleHorseSelect = (horse: Horse) => {
  horseProfile.value = horse
  setStoredHorseId(horse.id)

  if (route.name === 'Dashboard') {
    router.push({ name: 'HorseDashboardView', params: { id: horse.id } })
    return
  }

  const routeName = route.name as string | undefined
  if (routeName && horseRouteNames.has(routeName)) {
    router.push({ name: routeName, params: { ...route.params, id: horse.id } })
  }
}

const getTabFromPath = (path: string): NavTab => {
  if (path.includes('/dashboard')) return 'dashboard'
  if (path.includes('/reminders')) return 'reminders'
  if (path.includes('/health')) return 'health'
  if (path.includes('/activities')) return 'activities'
  if (path.includes('/documents')) return 'documents'
  if (path.includes('/feeding')) return 'feeding'
  if (path.includes('/products')) return 'products'
  if (path.startsWith('/horses')) return 'horses'
  return 'dashboard'
}

watch(
  () => route.path,
  (path) => {
    activeTab.value = getTabFromPath(path)
  },
  { immediate: true }
)
</script>

<style scoped>
.header {
  background-color: #2c4b29;
}

.app-logo {
  height: 100px;
}

:deep(.v-bottom-navigation) {
  height: 48px;
}

:deep(.v-bottom-navigation .v-btn) {
  min-height: 48px;
  padding: 0 6px;
}

.horse-card {
  background-color: #f6f7fb;
  border-color: rgba(30, 99, 176, 0.15);
}
</style>
