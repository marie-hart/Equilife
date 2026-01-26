import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { horsesApi } from '@/api/horses'
import { getStoredHorseId } from '@/libs/horseProfile'
import type { Horse } from '@/types'

export const useHorseSelection = () => {
  const route = useRoute()

  const horses = ref<Horse[]>([])
  const selectedHorseId = ref<string>('all')
  const horseId = computed(() => route.params.id as string | undefined);

  const horseOptions = computed(() =>
    horses.value.map(h => ({ title: h.name, value: h.id }))
  )


  const horseById = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

  const getHorseName = (): string => {
  if (!horseId.value) {
    return 'Cheval inconnu'
  }
  return horseById.value.get(horseId.value)?.name ?? 'Cheval inconnu'
}

  const horseFilterOptions = computed(() => [
    { title: 'Tous les chevaux', value: 'all' },
    ...horseOptions.value,
  ])

  const loadHorses = async () => {
    horses.value = await horsesApi.getAll()
  }

  const setHorseFromContext = () => {
    const routeHorseId = route.params.id as string | undefined
    if (routeHorseId) {
      selectedHorseId.value = routeHorseId
      return
    }

    const stored = getStoredHorseId()
    if (stored) {
      selectedHorseId.value = stored
    }
  }

  onMounted(async () => {
    await loadHorses()
    setHorseFromContext()
  })

  return {
    horses,
    selectedHorseId,
    horseFilterOptions,
    horseId,
    getHorseName,
    horseOptions,
    loadHorses,
  }
}
