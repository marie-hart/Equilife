<template>
  <div>
    <v-sheet class="header" elevation="1">
      <!-- Section principale : Infos cheval (gauche) + Photo (droite) -->
      <div class="header-main">
        <div class="horse-info-section">
          <h2 class="horse-name">{{ horseProfile?.name || 'Nom du cheval' }}</h2>
          <div class="horse-details">
           <span class="detail-item" v-if="horseProfile?.age">
              {{ horseProfile.age }} ans
            </span>
            <span class="detail-item" v-if="horseProfile?.breed">
              {{ horseProfile.breed }}
            </span>
          </div>
          <p class="horse-description" v-if="horseProfile?.additional_info">{{ horseProfile.additional_info }}</p>
        </div>
        <div class="horse-photo-section">
          <img 
            :src="horseProfile?.photo_path || '/placeholder-horse.jpg'" 
            :alt="horseProfile?.name || 'Cheval'" 
            class="horse-photo" 
          />
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="header-nav">
        <v-btn
          :class="{ active: activeTab === 'dashboard' }"
          variant="text"
          @click="navigate('Dashboard')"
        >
          Dashboard
        </v-btn>
        <v-btn
          :class="{ active: activeTab === 'timeline' }"
          variant="text"
          @click="navigate('Timeline')"
        >
          Timeline
        </v-btn>
        <v-btn
          :class="{ active: activeTab === 'agenda' }"
          variant="text"
          @click="navigate('Agenda')"
        >
          Agenda
        </v-btn>
        <v-btn
          :class="{ active: activeTab === 'horses' }"
          variant="text"
          @click="navigate('Horses')"
        >
          Fiches
        </v-btn>
      </div>
    </v-sheet>
    <v-bottom-navigation v-model="activeTab" class="bottom-nav" grow app>
      <v-btn value="dashboard" @click="navigate('Dashboard')">
        <font-awesome-icon icon="house" class="nav-icon" />
        <span class="nav-label">Dashboard</span>
      </v-btn>
      <v-btn value="timeline" @click="navigate('Timeline')">
        <font-awesome-icon icon="timeline" class="nav-icon" />
        <span class="nav-label">Timeline</span>
      </v-btn>
      <v-btn value="agenda" @click="navigate('Agenda')">
        <font-awesome-icon icon="calendar-days" class="nav-icon" />
        <span class="nav-label">Agenda</span>
      </v-btn>
      <v-btn value="horses" @click="navigate('Horses')">
        <font-awesome-icon icon="horse" class="nav-icon" />
        <span class="nav-label">Fiches</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { horsesApi } from '../api/horses'
import type { Horse } from '../types'

const horseProfile = ref<Horse | null>(null)
const activeTab = ref<'dashboard' | 'timeline' | 'agenda' | 'horses'>('dashboard')

const route = useRoute()
const router = useRouter()

const loadHorseProfile = async () => {
  try {
    const horseId = route.params.id as string | undefined
    const horse = horseId ? await horsesApi.getById(horseId) : await horsesApi.getFirst()
    if (horse) {
      horseProfile.value = horse
    }
  } catch (error) {
    console.error('Error loading horse profile:', error)
  }
}

// Charger les données du cheval
onMounted(async () => {
  await loadHorseProfile()
  // TODO: Charger dailyCares, tasks, foods, appointments depuis l'API
})

watch(
  () => route.params.id,
  async () => {
    await loadHorseProfile()
  }
)

const navigate = (name: 'Dashboard' | 'Timeline' | 'Agenda' | 'Horses') => {
  router.push({ name })
}

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/timeline')) {
      activeTab.value = 'timeline'
      return
    }
    if (path.startsWith('/agenda')) {
      activeTab.value = 'agenda'
      return
    }
    if (path.startsWith('/horses')) {
      activeTab.value = 'horses'
      return
    }
    activeTab.value = 'dashboard'
  },
  { immediate: true }
)
</script>
