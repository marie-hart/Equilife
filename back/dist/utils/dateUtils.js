"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextReminderDate = calculateNextReminderDate;
exports.calculateNextPurchaseDate = calculateNextPurchaseDate;
exports.isDateInPast = isDateInPast;
/**
 * Calcule la prochaine date de rappel basée sur la date de l'événement et l'intervalle
 */
function calculateNextReminderDate(eventDate, intervalMonths, intervalYears) {
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
function calculateNextPurchaseDate(lastPurchaseDate, intervalMonths, intervalYears) {
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
function isDateInPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
}
//# sourceMappingURL=dateUtils.js.map