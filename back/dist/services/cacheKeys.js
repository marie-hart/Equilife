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
    static eventsListKey() {
        return "events:list";
    }
    static eventsRemindersKey() {
        return "events:reminders";
    }
    // Matériels
    static materialKey(id) {
        return `material:${id}`;
    }
    static materialsListKey(includeInactive = false) {
        return `materials:list:${includeInactive}`;
    }
    static materialsDueKey() {
        return "materials:due";
    }
}
exports.CacheKeys = CacheKeys;
//# sourceMappingURL=cacheKeys.js.map