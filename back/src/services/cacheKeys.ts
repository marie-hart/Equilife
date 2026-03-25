export class CacheKeys {
    // --- Événements ---
    static eventKey(id: string): string {
        return `event:${id}`;
    }

    static eventsListKey(horseId?: string): string {
        return horseId ? `event:list:${horseId}` : "event:list:all";
    }

    static eventsRemindersKey(horseId?: string): string {
        return horseId ? `event:reminders:${horseId}` : "event:reminders:all";
    }

    // --- Produits ---
    static productKey(id: string): string {
        return `product:${id}`;
    }

    static productsListKey(
        includeInactive: boolean = false,
        horseId?: string,
    ): string {
        const status = includeInactive ? "all" : "active";
        return horseId
            ? `product:list:${status}:${horseId}`
            : `product:list:${status}`;
    }

    static productsDueKey(horseId?: string): string {
        return horseId ? `product:due:${horseId}` : "product:due:all";
    }

    // --- Chevaux ---
    static horseKey(id: string): string {
        return `horse:${id}`;
    }

    static horsesListKey(userId?: string): string {
        return userId ? `horse:list:user:${userId}` : "horse:list:all";
    }

    // --- Rations (Nouveau) ---
    static rationKey(id: string): string {
        return `ration:${id}`;
    }

    static horseRationKey(horseId: string): string {
        return `ration:horse:${horseId}`;
    }

    static rationsListKey(horseId?: string): string {
    return horseId ? `rations:list:horse:${horseId}` : `rations:list:all`;
}

    // --- Documents (Nouveau) ---
    static horseDocumentsKey(horseId: string): string {
        return `document:horse:${horseId}`;
    }
}