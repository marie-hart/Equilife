import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();


const SELECTED_HORSE_ID_KEY = 'selectedHorseId'

const routeHorseId = computed(() => route.params.id as string | undefined);

export const getStoredHorseId = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_HORSE_ID_KEY)
  } catch (error) {
    console.warn('Unable to read selected horse from storage:', error)
    return null
  }
}

export const getActiveHorseId = () =>
  routeHorseId.value || getStoredHorseId() || undefined;
