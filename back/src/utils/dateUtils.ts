/**
 * Calcule la prochaine date de rappel basée sur la date de l'événement et l'intervalle
 */
export function calculateNextReminderDate(
    eventDate: Date,
    intervalDays?: number,
    intervalMonths?: number,
    intervalYears?: number,
): Date | null {
    if (!intervalDays && !intervalMonths && !intervalYears) {
        return null;
    }

    const nextDate = new Date(eventDate);

    if (intervalDays) {
        nextDate.setDate(nextDate.getDate() + intervalDays);
    }

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
export const calculateNextPurchaseDate = (
  lastDate: Date,
  months: number,
  years: number
): Date => {
  const nextDate = new Date(lastDate);
  if (months) nextDate.setMonth(nextDate.getMonth() + months);
  if (years) nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
};

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
