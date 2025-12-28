export declare class CacheService {
    private defaultTTL;
    /**
     * Récupère une valeur depuis le cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Stocke une valeur dans le cache
     */
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    /**
     * Supprime une clé du cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Supprime toutes les clés correspondant à un pattern
     */
    deletePattern(pattern: string): Promise<boolean>;
    /**
     * Vérifie si une clé existe dans le cache
     */
    exists(key: string): Promise<boolean>;
    /**
     * Récupère plusieurs valeurs depuis le cache
     */
    mget<T>(keys: string[]): Promise<(T | null)[]>;
    /**
     * Stocke plusieurs valeurs dans le cache
     */
    mset(data: Record<string, any>, ttl?: number): Promise<boolean>;
}
declare const _default: CacheService;
export default _default;
//# sourceMappingURL=cacheService.d.ts.map