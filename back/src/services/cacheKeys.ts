export class CacheKeys {
    // --- Événements ---
    static eventKey(id: string): string {
        return `event:${id}`;
    }

    static eventsListKey(horseId?: string, userId?: string): string {
        const owner = userId ? `:user:${userId}` : "";
        return horseId
            ? `event:list:${horseId}${owner}`
            : `event:list:all${owner}`;
    }

    static eventsRemindersKey(horseId?: string, userId?: string): string {
        const owner = userId ? `:user:${userId}` : "";
        return horseId
            ? `event:reminders:${horseId}${owner}`
            : `event:reminders:all${owner}`;
    }

    // --- Produits ---
    static productKey(id: string): string {
        return `product:${id}`;
    }

    static productsListKey(
        includeInactive: boolean = false,
        horseId?: string,
        userId?: string,
    ): string {
        const status = includeInactive ? "all" : "active";
        const owner = userId ? `:user:${userId}` : "";
        return horseId
            ? `product:list:${status}:${horseId}${owner}`
            : `product:list:${status}${owner}`;
    }

    static productsDueKey(horseId?: string, userId?: string): string {
        const owner = userId ? `:user:${userId}` : "";
        return horseId ? `product:due:${horseId}${owner}` : `product:due:all${owner}`;
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