/**
 * Clés de cache utilisées dans l'application
 */
export class CacheKeys {
  // Événements
  static eventKey(id: string): string {
    return `event:${id}`;
  }

  static eventsListKey(horseId?: string): string {
    return horseId ? `events:list:${horseId}` : "events:list";
  }

  static eventsRemindersKey(horseId?: string): string {
    return horseId ? `events:reminders:${horseId}` : "events:reminders";
  }

  // Matériels
  static materialKey(id: string): string {
    return `material:${id}`;
  }

  static materialsListKey(includeInactive: boolean = false, horseId?: string): string {
    return horseId
      ? `materials:list:${includeInactive}:${horseId}`
      : `materials:list:${includeInactive}`;
  }

  static materialsDueKey(horseId?: string): string {
    return horseId ? `materials:due:${horseId}` : "materials:due";
  }

  // Chevaux
  static horsesListKey(): string {
    return "horses:list";
  }

  static horseKey(id: string): string {
    return `horse:${id}`;
  }
}
