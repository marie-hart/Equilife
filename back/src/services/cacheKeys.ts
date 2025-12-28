/**
 * Clés de cache utilisées dans l'application
 */
export class CacheKeys {
  // Événements
  static eventKey(id: string): string {
    return `event:${id}`;
  }

  static eventsListKey(): string {
    return "events:list";
  }

  static eventsRemindersKey(): string {
    return "events:reminders";
  }

  // Matériels
  static materialKey(id: string): string {
    return `material:${id}`;
  }

  static materialsListKey(includeInactive: boolean = false): string {
    return `materials:list:${includeInactive}`;
  }

  static materialsDueKey(): string {
    return "materials:due";
  }
}
