import pool from "../config/database";
import productRepository from "../repositories/productRepository";
import cacheService from "./cacheService";
import { CacheKeys } from "./cacheKeys";

/**
 * Extrait la valeur numérique d'une chaîne de quantité (ex: "2L" -> 2, "100g" -> 100)
 */
function parseQuantity(quantity: string | null | undefined): number {
    if (!quantity || typeof quantity !== "string") return 0;
    const match = quantity.trim().match(/^([\d.,]+)/);
    if (!match) return 0;
    const num = parseFloat(match[1].replace(",", "."));
    return Number.isFinite(num) && num >= 0 ? num : 0;
}

/**
 * Recalcule et met à jour daily_usage des produits à partir de toutes les rations actives.
 * @param productIds IDs des produits à recalculer (si vide, recalcule tous les produits dans des rations)
 */
export async function syncProductDailyUsageFromRations(
    productIds: string[] = []
): Promise<void> {
    const hasRationItems = await pool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_name = 'ration_items' LIMIT 1`
    );
    if (!hasRationItems.rows.length) return;

    const itemsResult = await pool.query(
        `SELECT ri.product_id, ri.quantity, ri.frequency
         FROM ration_items ri
         JOIN rations r ON r.id = ri.ration_id AND r.is_active = true
         WHERE ri.product_id IS NOT NULL
         ${productIds.length ? "AND ri.product_id = ANY($1::uuid[])" : ""}`,
        productIds.length ? [productIds] : []
    );

    const usageByProduct = new Map<string, number>();
    for (const row of itemsResult.rows) {
        const pid = row.product_id;
        const qty = parseQuantity(row.quantity);
        const freqCount = Array.isArray(row.frequency) ? row.frequency.length : 0;
        const dailyAmount = qty * (freqCount || 1);
        const current = usageByProduct.get(pid) ?? 0;
        usageByProduct.set(pid, current + dailyAmount);
    }

    for (const [productId, dailyUsage] of usageByProduct.entries()) {
        await productRepository.update(productId, {
            daily_usage: Math.round(dailyUsage * 100) / 100,
        });
    }

    if (productIds.length > 0) {
        const idsToNullify = productIds.filter((id) => !usageByProduct.has(id));
        for (const id of idsToNullify) {
            await pool.query(
                `UPDATE products SET daily_usage = NULL, updated_at = NOW() WHERE id = $1`,
                [id]
            );
            await cacheService.delete(CacheKeys.productKey(id));
        }
    }
    await cacheService.delete(CacheKeys.productsListKey(true));
    await cacheService.delete(CacheKeys.productsListKey(false));
    await cacheService.delete(CacheKeys.productsDueKey());
}
