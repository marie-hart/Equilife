/**
 * Calcule la prochaine date de rappel basée sur la date de l'événement et l'intervalle
 */
export function calculateNextReminderDate(
  eventDate: Date,
  intervalMonths?: number,
  intervalYears?: number
): Date | null {
  if (!intervalMonths && !intervalYears) {
    return null;
  }

  const nextDate = new Date(eventDate);
  
  if (intervalYears) {
    nextDate.setFullYear(nextDate.getFullYear() + intervalYears);
  }
  
  if (intervalMonths) {
    nextDate.setMonth(nextDate.getMonth() + intervalMonths);
  }

  return nextDate;
}

/**
 * Calcule la prochaine date d'achat basée sur la dernière date d'achat et l'intervalle
 */
export function calculateNextPurchaseDate(
  lastPurchaseDate: Date,
  intervalMonths?: number,
  intervalYears?: number
): Date | null {
  if (!intervalMonths && !intervalYears) {
    return null;
  }

  const nextDate = new Date(lastPurchaseDate);
  
  if (intervalYears) {
    nextDate.setFullYear(nextDate.getFullYear() + intervalYears);
  }
  
  if (intervalMonths) {
    nextDate.setMonth(nextDate.getMonth() + intervalMonths);
  }

  return nextDate;
}

/**
 * Vérifie si une date est dans le passé
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

