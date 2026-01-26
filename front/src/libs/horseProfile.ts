const SELECTED_HORSE_ID_KEY = 'selectedHorseId'

export const getStoredHorseId = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_HORSE_ID_KEY)
  } catch (error) {
    console.warn('Unable to read selected horse from storage:', error)
    return null
  }
}

export const getActiveHorseId = (horseId?: string ) =>
  horseId || getStoredHorseId() || undefined;
