"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = __importDefault(require("../config/redis"));
class CacheService {
    constructor() {
        this.defaultTTL = 3600; // 1 heure par défaut
    }
    /**
     * Récupère une valeur depuis le cache
     */
    async get(key) {
        try {
            const value = await redis_1.default.get(key);
            if (!value) {
                return null;
            }
            return JSON.parse(value);
        }
        catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    /**
     * Stocke une valeur dans le cache
     */
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await redis_1.default.setex(key, ttl, serializedValue);
            }
            else {
                await redis_1.default.set(key, serializedValue, "EX", this.defaultTTL);
            }
            return true;
        }
        catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Supprime une clé du cache
     */
    async delete(key) {
        try {
            await redis_1.default.del(key);
            return true;
        }
        catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Supprime toutes les clés correspondant à un pattern
     */
    async deletePattern(pattern) {
        try {
            const keys = await redis_1.default.keys(pattern);
            if (keys.length > 0) {
                await redis_1.default.del(...keys);
            }
            return true;
        }
        catch (error) {
            console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
            return false;
        }
    }
    /**
     * Vérifie si une clé existe dans le cache
     */
    async exists(key) {
        try {
            const result = await redis_1.default.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Récupère plusieurs valeurs depuis le cache
     */
    async mget(keys) {
        try {
            const values = await redis_1.default.mget(...keys);
            return values.map((value) => (value ? JSON.parse(value) : null));
        }
        catch (error) {
            console.error("Cache mget error:", error);
            return keys.map(() => null);
        }
    }
    /**
     * Stocke plusieurs valeurs dans le cache
     */
    async mset(data, ttl) {
        try {
            const pipeline = redis_1.default.pipeline();
            for (const [key, value] of Object.entries(data)) {
                const serializedValue = JSON.stringify(value);
                if (ttl) {
                    pipeline.setex(key, ttl, serializedValue);
                }
                else {
                    pipeline.set(key, serializedValue, "EX", this.defaultTTL);
                }
            }
            await pipeline.exec();
            return true;
        }
        catch (error) {
            console.error("Cache mset error:", error);
            return false;
        }
    }
}
exports.CacheService = CacheService;
exports.default = new CacheService();
//# sourceMappingURL=cacheService.js.map