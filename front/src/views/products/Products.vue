<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Produits</v-card-title>
        <v-btn class="primary-btn" color="primary" variant="flat" @click="goToProductCreate">
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
                    <v-text-field
                      v-model="searchQuery"
                      label="Rechercher par nom"
                      density="compact"
           
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedCategory"
                      :items="categoryFilterOptions"
                      label="Catégorie"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Liste des produits</div>
              <div class="pt-2">
                <v-list v-if="filteredMaterials.length" density="compact" class="d-flex flex-column ga-2">
                  <v-list-item
                    v-for="material in filteredMaterials"
                    :key="material.id"
                    class="rounded-lg bg-grey-lighten-4"
                  >
                    <v-row class="w-100 align-center" dense>
                      <v-col cols="auto">
                        <v-checkbox
                          v-model="material.needs_repurchase"
                          density="compact"
                          hide-details
                          @update:model-value="toggleRepurchase(material)"
                        />
                      </v-col>
                      <v-col>
                        <div class="text-subtitle-2">
                      {{ material.name }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                      <span v-if="material.category">{{ material.category }}</span>
                      <span v-if="material.brand">• {{ material.brand }}</span>
                      <span v-if="material.used_for_horses?.length">
                        • {{ material.used_for_horses.map(getHorseName).filter(Boolean).join(', ') }}
                      </span>
                      <span v-if="recurrenceLabel(material)">• {{ recurrenceLabel(material) }}</span>
                        </div>
                      </v-col>
                      <v-col cols="auto" class="text-right">
                        <ActionButtons
                          class="d-none d-md-flex align-center ga-2"
                          mode="inline"
                          button-size="x-small"
                          :actions="getMaterialActions(material)"
                        />
                        <ActionButtons
                          class="d-md-none"
                          mode="auto"
                          button-size="x-small"
                          menu-button-size="x-small"
                          :actions="getMaterialActions(material)"
                      />
                      </v-col>
                    </v-row>
                  </v-list-item>
                </v-list>
                <p v-else class="empty-state">Aucun produit pour le moment.</p>
              </div>
            </div>
          </div>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
        {{ snackbar.message }}
      </v-snackbar>

      <v-dialog v-model="isDeleteOpen" max-width="420">
        <v-card>
          <v-card-title>Supprimer le produit</v-card-title>
          <v-card-text>
            Confirmer la suppression de
            <strong>{{ selectedMaterial?.name }}</strong> ?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" @click="isDeleteOpen = false">Annuler</v-btn>
            <v-btn color="error" variant="elevated" @click="confirmDelete">Supprimer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { materialsApi } from '../../api/materials'
import { ActionButtons } from '../../components'
import { eventsApi } from '../../api/events'
import { horsesApi } from '../../api/horses'
import { getStoredHorseId } from '../../libs/horseProfile.js'
import type { Horse, Material } from '../../types'
import type { Event } from '../../types'

const route = useRoute()
const router = useRouter()
const horses = ref<Horse[]>([])
const materials = ref<Material[]>([])
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})
const selectedMaterial = ref<Material | null>(null)
const isDeleteOpen = ref(false)
const selectedCategory = ref<string>('all')
const searchQuery = ref<string>('')

type MaterialAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  onClick?: () => void
}

const categoryFilterOptions = [
  { title: 'Toutes', value: 'all' },
  { title: 'Aliment', value: 'Aliment' },
  { title: 'Complément', value: 'Complément' },
  { title: 'Soin', value: 'Soin' },
  { title: 'Matériels', value: 'Matériels' },
  { title: 'Autres', value: 'Autres' },
]

const getHorseName = (horseId?: string): string | undefined =>
  horses.value.find((horse) => horse.id === horseId)?.name

const recurrenceLabel = (material: Material): string => {
  if (material.purchase_interval_years) {
    return `Tous les ${material.purchase_interval_years} an${material.purchase_interval_years > 1 ? 's' : ''}`
  }
  if (material.purchase_interval_months) {
    return `Tous les ${material.purchase_interval_months} mois`
  }
  return ''
}

const getMaterialActions = (material: Material): MaterialAction[] => [
  {
    key: 'edit',
    title: 'Éditer',
    icon: 'mdi-pencil',
    disabled: false,
    onClick: () => openEdit(material),
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: false,
    onClick: () => openDelete(material),
  },
]

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

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const getReminderHorseId = (): string | undefined => {
  const routeHorseId = route.params.id as string | undefined
  return routeHorseId || getStoredHorseId() || undefined
}

const getMaterialReminder = (
  reminders: Event[],
  materialId: string
): Event | undefined =>
  reminders.find(
    (reminder) =>
      reminder.product_id === materialId && reminder.reminder_type === 'alimentation'
  )

const syncRepurchaseReminder = async (material: Material) => {
  const horseId = getReminderHorseId()
  const reminders = await eventsApi.getReminders(horseId)
  const existing = getMaterialReminder(reminders, material.id)

  if (material.needs_repurchase) {
    if (existing) return
    await eventsApi.create({
      name: material.name,
      description: 'À racheter',
      event_date: new Date().toISOString(),
      horse_id: horseId,
      product_id: material.id,
      reminder_type: 'alimentation',
      reminder_enabled: true,
    })
    return
  }

  if (existing) {
    await eventsApi.update(existing.id, { reminder_enabled: false })
  }
}

const filteredMaterials = computed(() => {
  const normalizedQuery = normalizeText(searchQuery.value.trim())
  const categoryFiltered =
    selectedCategory.value === 'all'
      ? materials.value
      : materials.value.filter((material) => material.category === selectedCategory.value)
  if (!normalizedQuery) return categoryFiltered
  return categoryFiltered.filter((material) =>
    normalizeText(material.name || '').includes(normalizedQuery)
  )
})

const toggleRepurchase = async (material: Material) => {
  try {
    await materialsApi.update(material.id, {
      needs_repurchase: material.needs_repurchase ?? false,
    })
    await syncRepurchaseReminder(material)
  } catch (error) {
    console.error('Error updating repurchase state:', error)
    snackbar.value = {
      show: true,
      message: 'Mise à jour impossible.',
      color: 'error',
    }
  }
}

const openEdit = (material: Material) => {
  router.push({ name: 'MaterialEdit', params: { id: material.id } })
}

const openDelete = (material: Material) => {
  selectedMaterial.value = material
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (!selectedMaterial.value) return
  try {
    await materialsApi.delete(selectedMaterial.value.id)
    await loadMaterials()
    isDeleteOpen.value = false
    snackbar.value = { show: true, message: 'Produit supprimé.', color: 'success' }
  } catch (error) {
    console.error('Error deleting material:', error)
    snackbar.value = { show: true, message: 'Suppression impossible.', color: 'error' }
  }
}

const goToProductCreate = () => {
  const horseId = route.params.id as string | undefined
  if (horseId) {
    router.push({ name: 'HorseProductCreate', params: { id: horseId } })
    return
  }
  router.push('/horses')
}

onMounted(async () => {
  await loadHorses()
  await loadMaterials()
})
</script>

