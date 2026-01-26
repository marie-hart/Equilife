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

            <v-card class="section-card" variant="outlined">
              <v-card-title class="text-subtitle-1">Rations</v-card-title>
              <v-card-text class="pt-3">
                <v-row v-if="rations.length" dense class="ga-4">
                  <v-col v-for="ration in rations" :key="ration.id" cols="12" md="6" lg="4">
                    <v-card variant="outlined" class="overflow-hidden d-flex flex-column h-100">
                      <v-card-title
                        class="bg-primary text-white text-subtitle-1 d-flex align-center justify-space-between"
                      >
                        <div class="d-flex flex-column">
                          <span>{{ ration.name }}</span>
                          <span class="text-caption text-white">{{ getHorseName(ration.horse_id) }}</span>
                        </div>
                        <ActionButtons
                          class="d-md-none"
                          mode="auto"
                          button-size="small"
                          menu-button-size="small"
                          :actions="getRationActions(ration)"
                        />
                      </v-card-title>
                      <v-card-text class="pt-0 flex-grow-1">
                        <div v-if="ration.items.length" class="d-flex flex-column ga-2">
                          <div v-for="item in ration.items" :key="item.id" class="text-body-2">
                            <span class="text-subtitle-2">
                        {{ getProductName(item.product_id) || 'Produit' }}
                            </span>
                        <span v-if="item.quantity">• {{ item.quantity }}</span>
                        <span v-if="item.frequency.length">• {{ item.frequency.join(', ') }}</span>
                        <span v-if="item.type">• {{ itemTypeLabel(item.type) }}</span>
                      </div>
                        </div>
                        <p v-else class="text-body-2 text-grey-darken-1 mb-0">
                          Aucun aliment ajouté.
                        </p>
                      </v-card-text>
                      <v-card-actions class="mt-auto justify-end">
                        <ActionButtons
                          class="d-none d-md-flex align-center ga-2"
                          mode="inline"
                          button-size="small"
                          :actions="getRationActions(ration)"
                        />
                        <div class="d-md-none" />
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
                <p v-else class="empty-state">Aucune ration pour le moment.</p>
              </v-card-text>
            </v-card>
          </div>

      <v-dialog v-model="isDetailsOpen" max-width="520">
        <v-card>
          <v-card-title>Détails de la ration</v-card-title>
          <v-card-text v-if="selectedRation">
            <div class="text-subtitle-2">{{ selectedRation.name }}</div>
            <div class="text-caption text-grey-darken-1 mb-3">
              {{ getHorseName(selectedRation.horse_id) }}
            </div>
            <div v-if="selectedRation.items.length" class="d-flex flex-column ga-2">
              <div v-for="item in selectedRation.items" :key="item.id" class="text-body-2">
                <span class="text-subtitle-2">
                  {{ getProductName(item.product_id) || 'Produit' }}
                </span>
                <span v-if="item.quantity">• {{ item.quantity }}</span>
                <span v-if="item.frequency.length">• {{ item.frequency.join(', ') }}</span>
                <span v-if="item.type">• {{ itemTypeLabel(item.type) }}</span>
              </div>
            </div>
            <p v-else class="text-body-2 text-grey-darken-1 mb-0">
              Aucun aliment ajouté.
            </p>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isDetailsOpen = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer la ration</v-card-title>
          <v-card-text>
            Confirmer la suppression de
            <strong>{{ selectedRation?.name }}</strong> ?
        </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isDeleteOpen = false">Annuler</v-btn>
            <v-btn color="error" variant="elevated" @click="confirmDelete">Supprimer</v-btn>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { rationsApi } from '../../api/rations'
import { ActionButtons } from '../../components'
import { materialsApi } from '../../api/materials'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../libs/horseProfile.js'
import type { Horse, Material, Ration } from '../../types'

type RationAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const route = useRoute()
const router = useRouter()
const horses = ref<Horse[]>([])
const materials = ref<Material[]>([])
const rations = ref<Ration[]>([])
const selectedHorseId = ref<string>('all')
const selectedRation = ref<Ration | null>(null)
const isDetailsOpen = ref(false)
const isDeleteOpen = ref(false)
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

const getRationActions = (ration: Ration): RationAction[] => [
  {
    key: 'view',
    title: 'Voir',
    icon: 'mdi-eye',
    disabled: false,
    onClick: () => openRationDetails(ration),
  },
  {
    key: 'share',
    title: 'Partager',
    icon: 'mdi-share-variant',
    disabled: false,
    onClick: () => shareRation(ration),
  },
  {
    key: 'edit',
    title: 'Éditer',
    icon: 'mdi-pencil',
    disabled: false,
    onClick: () => openRationEdit(ration),
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: false,
    onClick: () => openRationDelete(ration),
  },
]

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

const openRationDetails = (ration: Ration) => {
  selectedRation.value = ration
  isDetailsOpen.value = true
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

const openRationDelete = (ration: Ration) => {
  selectedRation.value = ration
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedRation.value) return
  try {
    await rationsApi.delete(selectedRation.value.id)
    await loadRations()
    isDeleteOpen.value = false
    snackbar.value = { show: true, message: 'Ration supprimée.', color: 'success' }
  } catch (error) {
    console.error('Error deleting ration:', error)
    snackbar.value = { show: true, message: 'Suppression impossible.', color: 'error' }
  }
}

</script>

