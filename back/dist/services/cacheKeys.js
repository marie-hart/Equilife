"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = void 0;
/**
 * Clés de cache utilisées dans l'application
 */
class CacheKeys {
    // Événements
    static eventKey(id) {
        return `event:${id}`;
    }
    static eventsListKey(horseId) {
        return horseId ? `events:list:${horseId}` : "events:list";
    }
    static eventsRemindersKey(horseId) {
        return horseId ? `events:reminders:${horseId}` : "events:reminders";
    }
    // Matériels
    static materialKey(id) {
        return `material:${id}`;
    }
    static materialsListKey(includeInactive = false, horseId) {
        return horseId
            ? `materials:list:${includeInactive}:${horseId}`
            : `materials:list:${includeInactive}`;
    }
    static materialsDueKey(horseId) {
        return horseId ? `materials:due:${horseId}` : "materials:due";
    }
    // Chevaux
    static horsesListKey() {
        return "horses:list";
    }
    static horseKey(id) {
        return `horse:${id}`;
    }
}
exports.CacheKeys = CacheKeys;
//# sourceMappingURL=cacheKeys.js.map