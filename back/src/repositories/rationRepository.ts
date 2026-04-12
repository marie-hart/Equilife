import pool from "../config/database";
import { CacheKeys } from "../services/cacheKeys";
import cacheService from "../services/cacheService";
import { syncProductDailyUsageFromRations } from "../services/rationProductSyncService";
import { CreateRationDto, UpdateRationDto, Ration, RationItem } from "../types";

const FORBIDDEN_HORSE_ERROR = "FORBIDDEN_HORSE";
const HORSE_REQUIRED_ERROR = "HORSE_REQUIRED";

export class RationRepository {
    private hasRationsTableCache: boolean | null = null;
    private hasRationItemsTableCache: boolean | null = null;

    private async hasTable(
        tableName: string,
        cacheKey: "rations" | "ration_items",
    ): Promise<boolean> {
        if (cacheKey === "rations" && this.hasRationsTableCache !== null) {
            return this.hasRationsTableCache;
        }
        if (
            cacheKey === "ration_items" &&
            this.hasRationItemsTableCache !== null
        ) {
            return this.hasRationItemsTableCache;
        }
        const result = await pool.query(
            `SELECT 1
       FROM information_schema.tables
       WHERE table_name = $1
       LIMIT 1`,
            [tableName],
        );
        const exists = result.rowCount !== null && result.rowCount > 0;
        if (cacheKey === "rations") {
            this.hasRationsTableCache = exists;
        } else {
            this.hasRationItemsTableCache = exists;
        }
        return exists;
    }
    async findAll(horseId?: string, ownerUserId?: string): Promise<Ration[]> {
        const hasRationsTable = await this.hasTable("rations", "rations");
        if (!hasRationsTable) {
            return [];
        }
        const rationsResult = ownerUserId
            ? horseId
                ? await pool.query(
                      `SELECT r.*
                       FROM rations r
                       INNER JOIN horses h ON h.id = r.horse_id
                       WHERE h.user_id = $1 AND r.horse_id = $2
                       ORDER BY r.start_date DESC NULLS LAST, r.created_at DESC`,
                      [ownerUserId, horseId],
                  )
                : await pool.query(
                      `SELECT r.*
                       FROM rations r
                       INNER JOIN horses h ON h.id = r.horse_id
                       WHERE h.user_id = $1
                       ORDER BY r.start_date DESC NULLS LAST, r.created_at DESC`,
                      [ownerUserId],
                  )
            : horseId
              ? await pool.query(
                    `SELECT * FROM rations WHERE horse_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC`,
                    [horseId],
                )
              : await pool.query(
                    `SELECT * FROM rations ORDER BY start_date DESC NULLS LAST, created_at DESC`,
                );

        if (rationsResult.rows.length === 0) {
            return [];
        }

        const hasRationItemsTable = await this.hasTable(
            "ration_items",
            "ration_items",
        );
        if (!hasRationItemsTable) {
            return rationsResult.rows.map((row) => ({
                ...this.mapRowToRation(row),
                items: [],
            }));
        }

        const rationIds = rationsResult.rows.map((row) => row.id);
        const itemsResult = await pool.query(
            `SELECT * FROM ration_items WHERE ration_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
            [rationIds],
        );

        const itemsByRation = new Map<string, RationItem[]>();
        itemsResult.rows.forEach((row) => {
            const item = this.mapRowToItem(row);
            const list = itemsByRation.get(item.ration_id) ?? [];
            list.push(item);
            itemsByRation.set(item.ration_id, list);
        });

        return rationsResult.rows.map((row) => {
            const ration = this.mapRowToRation(row);
            return { ...ration, items: itemsByRation.get(ration.id) ?? [] };
        });
    }

    async create(data: CreateRationDto, ownerUserId?: string): Promise<Ration> {
        if (ownerUserId && !data.horse_id) {
            throw new Error(HORSE_REQUIRED_ERROR);
        }
        if (ownerUserId && data.horse_id) {
            const isOwner = await this.horseBelongsToUser(data.horse_id, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
        }
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const hasRationsTable = await this.hasTable("rations", "rations");
            if (!hasRationsTable) {
                throw new Error("Missing table rations");
            }
            const hasRationItemsTable = await this.hasTable(
                "ration_items",
                "ration_items",
            );
            const result = await client.query(
                `INSERT INTO rations (horse_id, name, start_date, end_date, note, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
                [
                    data.horse_id,
                    data.name,
                    data.start_date || null,
                    data.end_date || null,
                    data.note || null,
                    data.is_active !== undefined ? data.is_active : true,
                ],
            );

            const rationRow = result.rows[0];
            const items: RationItem[] = [];
            if (hasRationItemsTable) {
                for (const item of data.items) {
                    const itemResult = await client.query(
                        `INSERT INTO ration_items (ration_id, product_id, quantity, frequency, type)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
                        [
                            rationRow.id,
                            item.product_id || null,
                            item.quantity || null,
                            item.frequency || [],
                            item.type || null,
                        ],
                    );
                    items.push(this.mapRowToItem(itemResult.rows[0]));
                }
            }

            await client.query("COMMIT");
            const created = { ...this.mapRowToRation(rationRow), items };
            const productIds = [...new Set(
                (data.items || []).map((i) => i.product_id).filter((id): id is string => !!id)
            )];
            if (productIds.length > 0) {
                syncProductDailyUsageFromRations(productIds).catch((err) =>
                    console.error("syncProductDailyUsageFromRations:", err)
                );
            }
            return created;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id: string, ownerUserId?: string): Promise<Ration | null> {
        const hasRationsTable = await this.hasTable("rations", "rations");
        if (!hasRationsTable) {
            return null;
        }
        const rationsResult = ownerUserId
            ? await pool.query(
                  `SELECT r.*
                   FROM rations r
                   INNER JOIN horses h ON h.id = r.horse_id
                   WHERE r.id = $1 AND h.user_id = $2`,
                  [id, ownerUserId],
              )
            : await pool.query(`SELECT * FROM rations WHERE id = $1`, [id]);
        if (rationsResult.rows.length === 0) {
            return null;
        }
        const ration = this.mapRowToRation(rationsResult.rows[0]);
        const hasRationItemsTable = await this.hasTable(
            "ration_items",
            "ration_items",
        );
        if (!hasRationItemsTable) {
            return { ...ration, items: [] };
        }
        const itemsResult = await pool.query(
            `SELECT * FROM ration_items WHERE ration_id = $1 ORDER BY created_at ASC`,
            [id],
        );
        const items = itemsResult.rows.map((row) => this.mapRowToItem(row));
        return { ...ration, items };
    }

    async update(
        id: string,
        data: UpdateRationDto,
        ownerUserId?: string,
    ): Promise<Ration | null> {
        const existing = await this.findById(id, ownerUserId);
        if (!existing) return null;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const hasRationsTable = await this.hasTable("rations", "rations");
            if (!hasRationsTable) {
                throw new Error("Missing table rations");
            }
            const values: unknown[] = [
                data.name ?? null,
                data.start_date ?? null,
                data.end_date ?? null,
                data.note ?? null,
                data.is_active ?? null,
                id,
            ];
            let whereClause = "WHERE id = $6";
            if (ownerUserId) {
                values.push(ownerUserId);
                whereClause =
                    "WHERE id = $6 AND horse_id IN (SELECT id FROM horses WHERE user_id = $7)";
            }
            const result = await client.query(
                `UPDATE rations
                SET name = COALESCE($1, name),
                    start_date = $2,    -- On enlève COALESCE pour autoriser le NULL
                    end_date = $3,      -- On enlève COALESCE pour autoriser le NULL
                    note = $4,          -- On enlève COALESCE pour autoriser le NULL
                    is_active = COALESCE($5, is_active)
                ${whereClause}
                RETURNING *`,
                values,
            );
            if (result.rows.length === 0) {
                await client.query("ROLLBACK");
                return null;
            }

            const rationRow = result.rows[0];
            const items: RationItem[] = [];
            let oldProductIds: string[] = [];
            const hasRationItemsTable = await this.hasTable(
                "ration_items",
                "ration_items",
            );
            if (hasRationItemsTable && data.items) {
                const oldItemsResult = await client.query(
                    `SELECT product_id FROM ration_items WHERE ration_id = $1 AND product_id IS NOT NULL`,
                    [id],
                );
                oldProductIds = oldItemsResult.rows
                    .map((r) => r.product_id)
                    .filter(Boolean);
                await client.query(
                    `DELETE FROM ration_items WHERE ration_id = $1`,
                    [id],
                );
                for (const item of data.items) {
                    const itemResult = await client.query(
                        `INSERT INTO ration_items (ration_id, product_id, quantity, frequency, type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
                        [
                            id,
                            item.product_id || null,
                            item.quantity || null,
                            item.frequency || [],
                            item.type || null,
                        ],
                    );
                    items.push(this.mapRowToItem(itemResult.rows[0]));
                }
            } else if (hasRationItemsTable) {
                const itemsResult = await client.query(
                    `SELECT * FROM ration_items WHERE ration_id = $1 ORDER BY created_at ASC`,
                    [id],
                );
                itemsResult.rows.forEach((row) =>
                    items.push(this.mapRowToItem(row)),
                );
            }

            await client.query("COMMIT");
            const updated = { ...this.mapRowToRation(rationRow), items };
            const newProductIds = (data.items || [])
                .map((i) => i.product_id)
                .filter((id): id is string => Boolean(id));
            const productIds = [...new Set([...oldProductIds, ...newProductIds])];
            if (productIds.length > 0) {
                syncProductDailyUsageFromRations(productIds).catch((err) =>
                    console.error("syncProductDailyUsageFromRations:", err)
                );
            }
            return updated;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
 * Invalidation intelligente du cache des rations
 */
private async invalidateRationCache(ration: Ration): Promise<void> {
    // 1. On supprime la clé spécifique de cette ration
    await cacheService.delete(CacheKeys.rationKey(ration.id));

    // 2. On invalide les listes globales (si elles existent dans tes CacheKeys)
    await cacheService.delete(CacheKeys.rationsListKey());

    // 3. TRÈS IMPORTANT : On invalide le cache du cheval concerné
    // Car la ration est affichée sur son profil ou son dashboard
    if (ration.horse_id) {
        await cacheService.delete(CacheKeys.rationsListKey(ration.horse_id));
        
        // Si tu as une clé spécifique pour "La ration actuelle du cheval X"
        await cacheService.delete(CacheKeys.horseRationKey(ration.horse_id));
        
        // Optionnel : Invalider la fiche du cheval si elle contient un résumé de la ration
        await cacheService.delete(CacheKeys.horseKey(ration.horse_id));
    }
}

    async delete(id: string, ownerUserId?: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        // 1. Récupérer la ration avant de la supprimer pour connaître le horse_id (utile pour le cache)
        const existing = await this.findById(id, ownerUserId);
        if (!existing) return false;

        await client.query("BEGIN");

        // Supprimer les items (si pas de CASCADE SQL)
        await client.query(`DELETE FROM ration_items WHERE ration_id = $1`, [id]);
        
        // Supprimer la ration
        const result = ownerUserId
            ? await client.query(
                  `DELETE FROM rations
                   WHERE id = $1
                     AND horse_id IN (SELECT id FROM horses WHERE user_id = $2)`,
                  [id, ownerUserId],
              )
            : await client.query(`DELETE FROM rations WHERE id = $1`, [id]);
        
        await client.query("COMMIT");

        const deleted = (result.rowCount ?? 0) > 0;

        // 2. Invalider le cache après le COMMIT réussi
        if (deleted) {
           await this.invalidateRationCache(existing);
           const productIds = [
               ...new Set(
                   (existing.items || [])
                       .map((i) => i.product_id)
                       .filter((id): id is string => Boolean(id))
               ),
           ];
           if (productIds.length > 0) {
               syncProductDailyUsageFromRations(productIds).catch((err) =>
                   console.error("syncProductDailyUsageFromRations:", err)
               );
           }
        }

        return deleted;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Erreur lors de la suppression de la ration:", error);
        throw error;
    } finally {
        client.release();
    }
}
    private mapRowToRation(row: any): Ration {
        return {
            id: row.id,
            horse_id: row.horse_id,
            name: row.name,
            start_date: row.start_date ? new Date(row.start_date) : undefined,
            end_date: row.end_date ? new Date(row.end_date) : undefined,
            note: row.note || undefined,
            is_active: row.is_active,
            items: [],
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }

    private mapRowToItem(row: any): RationItem {
        return {
            id: row.id,
            ration_id: row.ration_id,
            product_id: row.product_id || undefined,
            quantity: row.quantity || undefined,
            frequency: row.frequency || [],
            type: row.type || undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }

    private async horseBelongsToUser(
        horseId: string,
        ownerUserId: string,
    ): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM horses WHERE id = $1 AND user_id = $2`,
            [horseId, ownerUserId],
        );
        return (result.rowCount ?? 0) > 0;
    }
}

export default new RationRepository();
export { FORBIDDEN_HORSE_ERROR, HORSE_REQUIRED_ERROR };
