<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Alimentation</v-card-title>
        <v-btn class="primary-btn" color="primary" variant="flat" @click="goToFeedingCreate">
          <v-icon icon="mdi-plus" class="me-2" />
          Ajouter
        </v-btn>
      </div>
          <div class="d-flex flex-column ga-4">
            <v-card class="section-card" variant="outlined">
              <v-card-title class="text-subtitle-1">Filtres</v-card-title>
              <v-card-text class="pt-3">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedHorseId"
                      :items="horseFilterOptions"
                      label="Cheval"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Rations</div>
              <div class="pt-2">
                <v-row v-if="rations.length" dense class="ga-4">
                  <v-col v-for="ration in rations" :key="ration.id" cols="12" md="6" lg="4">
                    <RationCard
                      :ration="ration"
                      :horse-name="getHorseName(ration.horse_id)"
                      :get-product-name="getProductName"
                      :item-type-label="itemTypeLabel"
                      @edit="openRationEdit"
                      @share="shareRation"
                      @delete="deleteRation"
                    />
                  </v-col>
                </v-row>
                <p v-else class="empty-state">Aucune ration pour le moment.</p>
              </div>
            </div>
          </div>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
        {{ snackbar.message }}
      </v-snackbar>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { rationsApi } from '../../api/rations'
import { RationCard } from '../../components'
import { materialsApi } from '../../api/materials'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../utils/horseProfile'
import type { Horse, Material, Ration } from '../../types'


const route = useRoute()
const router = useRouter()
const horses = ref<Horse[]>([])
const materials = ref<Material[]>([])
const rations = ref<Ration[]>([])
const selectedHorseId = ref<string>('all')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const itemTypeLabel = (value?: string): string => {
  switch (value) {
    case 'aliment':
      return 'Aliment'
    case 'complement':
      return 'Complément'
    default:
      return 'Autre'
  }
}


const getProductName = (productId?: string): string | undefined =>
  materials.value.find((material) => material.id === productId)?.name

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
)

const horseFilterOptions = computed(() => [
  { title: 'Tous les chevaux', value: 'all' },
  ...horseOptions.value,
])

const getHorseName = (horseId?: string): string =>
  horses.value.find((horse) => horse.id === horseId)?.name ?? 'Cheval inconnu'

const setHorseFromRoute = () => {
  const horseId = route.params.id as string | undefined
  if (horseId) {
    selectedHorseId.value = horseId
    return
  }
  const storedHorseId = getStoredHorseId()
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId
  }
}

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const loadMaterials = async () => {
  try {
    materials.value = await materialsApi.getAll(false)
  } catch (error) {
    console.error('Error loading materials:', error)
  }
}

const loadRations = async () => {
  try {
    const horseFilter =
      selectedHorseId.value !== 'all' ? selectedHorseId.value : undefined
    rations.value = await rationsApi.getAll(horseFilter)
  } catch (error) {
    console.error('Error loading rations:', error)
  }
}

watch(selectedHorseId, () => {
  loadMaterials()
  loadRations()
})

onMounted(async () => {
  await loadHorses()
  setHorseFromRoute()
  await loadMaterials()
  await loadRations()
})

const goToFeedingCreate = () => {
  const horseId = route.params.id as string | undefined
  if (horseId) {
    router.push({ name: 'HorseFeedingCreate', params: { id: horseId } })
    return
  }
  router.push('/horses')
}


const shareRation = async (ration: Ration) => {
  const items = ration.items
    .map((item) => {
      const name = getProductName(item.product_id) || 'Produit'
      const parts = [
        name,
        item.quantity ? item.quantity : null,
        item.frequency.length ? item.frequency.join(', ') : null,
        item.type ? itemTypeLabel(item.type) : null,
      ].filter(Boolean)
      return `• ${parts.join(' • ')}`
    })
    .join('\n')
  const horseName = getHorseName(ration.horse_id)
  const text = `Ration: ${ration.name}\nCheval: ${horseName}\n${items}`
  try {
    if (navigator.share) {
      await navigator.share({ title: `Ration ${ration.name}`, text })
      snackbar.value = { show: true, message: 'Ration partagée.', color: 'success' }
      return
    }
    await navigator.clipboard.writeText(text)
    snackbar.value = { show: true, message: 'Lien copié.', color: 'success' }
  } catch (error) {
    console.error('Error sharing ration:', error)
    snackbar.value = { show: true, message: 'Partage impossible.', color: 'error' }
  }
}

const openRationEdit = (ration: Ration) => {
  router.push({
    name: 'RationEdit',
    params: { id: ration.id },
    query: { horseId: ration.horse_id },
  })
}

const deleteRation = async (ration: Ration) => {
  try {
    await rationsApi.delete(ration.id)
    await loadRations()
    snackbar.value = { show: true, message: 'Ration supprimée.', color: 'success' }
  } catch (error) {
    console.error('Error deleting ration:', error)
    snackbar.value = { show: true, message: 'Suppression impossible.', color: 'error' }
  }
}

</script>

