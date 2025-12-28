/**
 * Calcule la prochaine date de rappel basée sur la date de l'événement et l'intervalle
 */
export declare function calculateNextReminderDate(eventDate: Date, intervalMonths?: number, intervalYears?: number): Date | null;
/**
 * Calcule la prochaine date d'achat basée sur la dernière date d'achat et l'intervalle
 */
export declare function calculateNextPurchaseDate(lastPurchaseDate: Date, intervalMonths?: number, intervalYears?: number): Date | null;
/**
 * Vérifie si une date est dans le passé
 */
export declare function isDateInPast(date: Date): boolean;
//# sourceMappingURL=dateUtils.d.ts.map