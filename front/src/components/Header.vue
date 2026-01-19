<template>
  <div>
    <v-sheet 
      class="header" 
      elevation="1"
      :class="['pa-6', 'pa-md-4', 'pa-sm-3']"
    >
      <!-- Section principale : Infos cheval (gauche) + Photo (droite) -->
      <div class="d-flex flex-wrap align-start" :class="['gap-4', 'mb-4']">
        <div class="flex-grow-1" style="min-width: 250px;">
          <h2 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
            {{ horseProfile?.name || 'Nom du cheval' }}
          </h2>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <v-chip
              v-if="horseProfile?.age"
              size="small"
              variant="flat"
              color="white"
              class="text-body-2"
            >
              {{ horseProfile.age }} ans
            </v-chip>
            <v-chip
              v-if="horseProfile?.breed"
              size="small"
              variant="flat"
              color="white"
              class="text-body-2"
            >
              {{ horseProfile.breed }}
            </v-chip>
          </div>
          <p 
            v-if="horseProfile?.additional_info" 
            class="text-body-2 text-grey-darken-1 mb-0"
          >
            {{ horseProfile.additional_info }}
          </p>
        </div>
        <div class="flex-shrink-0">
          <v-avatar 
            size="150" 
            class="rounded-lg"
            :class="['d-none', 'd-md-flex']"
          >
            <v-img 
              :src="horseProfile?.photo_path || '/placeholder-horse.jpg'" 
              :alt="horseProfile?.name || 'Cheval'"
              cover
            />
          </v-avatar>
          <v-avatar 
            size="120" 
            class="rounded-lg"
            :class="['d-flex', 'd-md-none']"
          >
            <v-img 
              :src="horseProfile?.photo_path || '/placeholder-horse.jpg'" 
              :alt="horseProfile?.name || 'Cheval'"
              cover
            />
          </v-avatar>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <v-divider class="d-none d-lg-block mb-4" />
      <div class="header-nav d-none d-lg-flex align-center gap-2">
        <v-btn
          :color="activeTab === 'dashboard' ? 'primary' : undefined"
          :variant="activeTab === 'dashboard' ? 'flat' : 'text'"
          @click="navigate('HorseDashboardView')"
        >
          Dashboard
        </v-btn>
        <v-btn
          :color="activeTab === 'reminders' ? 'primary' : undefined"
          :variant="activeTab === 'reminders' ? 'flat' : 'text'"
          @click="navigate('Reminders')"
        >
          Rappels
        </v-btn>
        <v-btn
          :color="activeTab === 'health' ? 'primary' : undefined"
          :variant="activeTab === 'health' ? 'flat' : 'text'"
          @click="navigate('HorseHealth')"
        >
          Santé
        </v-btn>
        <v-btn
          :color="activeTab === 'activities' ? 'primary' : undefined"
          :variant="activeTab === 'activities' ? 'flat' : 'text'"
          @click="navigate('HorseActivities')"
        >
          Activités
        </v-btn>
        <v-btn
          :color="activeTab === 'documents' ? 'primary' : undefined"
          :variant="activeTab === 'documents' ? 'flat' : 'text'"
          @click="navigate('HorseDocuments')"
        >
          Documents
        </v-btn>
        <v-btn
          :color="activeTab === 'horses' ? 'primary' : undefined"
          :variant="activeTab === 'horses' ? 'flat' : 'text'"
          @click="navigate('Horses')"
        >
          Fiches
        </v-btn>
      </div>
    </v-sheet>
    <v-bottom-navigation v-model="activeTab" grow app>
      <v-btn value="dashboard" @click="navigate('HorseDashboardView')">
        <font-awesome-icon icon="house" />
        <span>Dashboard</span>
      </v-btn>
      <v-btn value="reminders" @click="navigate('Reminders')">
        <font-awesome-icon icon="bell" />
        <span>Rappels</span>
      </v-btn>
      <v-btn value="health" @click="navigate('HorseHealth')">
        <font-awesome-icon icon="house-chimney-medical" />
        <span>Santé</span>
      </v-btn>
      <v-btn value="activities" class="mobile-hide-xs" @click="navigate('HorseActivities')">
        <font-awesome-icon icon="heart-pulse" />
        <span>Activités</span>
      </v-btn>
      <v-btn value="documents" class="mobile-hide" @click="navigate('HorseDocuments')">
        <font-awesome-icon icon="file-lines" />
        <span>Documents</span>
      </v-btn>
      <v-btn value="horses" class="mobile-hide" @click="navigate('Horses')">
        <font-awesome-icon icon="horse" />
        <span>Fiches</span>
      </v-btn>
      <v-btn
        value="more"
        class="mobile-only"
        variant="text"
        @click="isMoreOpen = true"
      >
        <font-awesome-icon icon="ellipsis" />
        <span>Plus</span>
      </v-btn>
    </v-bottom-navigation>
    <v-bottom-sheet v-model="isMoreOpen" inset>
      <v-list density="compact">
        <v-list-item @click="navigate('HorseDocuments')">
          <template #prepend>
            <font-awesome-icon icon="file-lines" class="bottom-sheet-icon" />
          </template>
          <v-list-item-title>Documents</v-list-item-title>
        </v-list-item>
        <v-list-item class="mobile-only-xs" @click="navigate('HorseActivities')">
          <template #prepend>
            <font-awesome-icon icon="heart-pulse" class="bottom-sheet-icon" />
          </template>
          <v-list-item-title>Activités</v-list-item-title>
        </v-list-item>
        <v-list-item @click="navigate('Horses')">
          <template #prepend>
            <font-awesome-icon icon="horse" class="bottom-sheet-icon" />
          </template>
          <v-list-item-title>Fiches</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { horsesApi } from '../api/horses'
import type { Horse } from '../types'

const horseProfile = ref<Horse | null>(null)
const activeTab = ref<'dashboard' | 'reminders' | 'health' | 'activities' | 'documents' | 'horses'>(
  'dashboard'
)
const isMoreOpen = ref(false)

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

const navigate = (
  name:
    | 'HorseDashboardView'
    | 'Reminders'
    | 'HorseHealth'
    | 'HorseActivities'
    | 'HorseDocuments'
    | 'Horses'
) => {
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

watch(
  () => route.path,
  (path) => {
    if (path.includes('/reminders')) {
      activeTab.value = 'reminders'
      return
    }
    if (path.includes('/health')) {
      activeTab.value = 'health'
      return
    }
    if (path.includes('/activities')) {
      activeTab.value = 'activities'
      return
    }
    if (path.includes('/documents')) {
      activeTab.value = 'documents'
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

<style scoped>
.header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 0 0 16px 16px;
  margin-bottom: 1rem;
}

/* Masquer la navbar du header en dessous de 1024px */
@media (max-width: 1024px) {
  .header-nav {
    display: none !important;
  }
}

/* Mobile: regrouper Documents/Fiches dans un menu "Plus" */
@media (max-width: 767px) {
  .mobile-hide {
    display: none !important;
  }
  .mobile-only {
    display: inline-flex !important;
  }
}

@media (min-width: 768px) {
  .mobile-only {
    display: none !important;
  }
}

/* Extra small: regrouper Activités dans "Plus" */
@media (max-width: 419px) {
  .mobile-hide-xs {
    display: none !important;
  }
  .mobile-only-xs {
    display: flex !important;
  }
}

@media (min-width: 420px) {
  .mobile-only-xs {
    display: none !important;
  }
}

.bottom-sheet-icon {
  margin-right: 0.5rem;
}
</style>
