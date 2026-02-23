import pool from "../config/database";
import { CreateRationDto, UpdateRationDto, Ration, RationItem } from "../types";

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
    async findAll(horseId?: string): Promise<Ration[]> {
        const hasRationsTable = await this.hasTable("rations", "rations");
        if (!hasRationsTable) {
            return [];
        }
        const rationsResult = horseId
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

    async create(data: CreateRationDto): Promise<Ration> {
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
            return { ...this.mapRowToRation(rationRow), items };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<Ration | null> {
        const hasRationsTable = await this.hasTable("rations", "rations");
        if (!hasRationsTable) {
            return null;
        }
        const rationsResult = await pool.query(
            `SELECT * FROM rations WHERE id = $1`,
            [id],
        );
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

    async update(id: string, data: UpdateRationDto): Promise<Ration | null> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const hasRationsTable = await this.hasTable("rations", "rations");
            if (!hasRationsTable) {
                throw new Error("Missing table rations");
            }
            const result = await client.query(
                `UPDATE rations
                SET name = COALESCE($1, name),
                    start_date = $2,    -- On enlève COALESCE pour autoriser le NULL
                    end_date = $3,      -- On enlève COALESCE pour autoriser le NULL
                    note = $4,          -- On enlève COALESCE pour autoriser le NULL
                    is_active = COALESCE($5, is_active)
                WHERE id = $6
                RETURNING *`,
                [
                    data.name ?? null,
                    data.start_date ?? null, // Si c'est null, ça videra la colonne en base
                    data.end_date ?? null,
                    data.note ?? null,
                    data.is_active ?? null,
                    id,
                ],
            );
            if (result.rows.length === 0) {
                await client.query("ROLLBACK");
                return null;
            }

            const rationRow = result.rows[0];
            const items: RationItem[] = [];
            const hasRationItemsTable = await this.hasTable(
                "ration_items",
                "ration_items",
            );
            if (hasRationItemsTable && data.items) {
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
            return { ...this.mapRowToRation(rationRow), items };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<boolean> {
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
            if (hasRationItemsTable) {
                await client.query(
                    `DELETE FROM ration_items WHERE ration_id = $1`,
                    [id],
                );
            }
            const result = await client.query(
                `DELETE FROM rations WHERE id = $1`,
                [id],
            );
            await client.query("COMMIT");
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            await client.query("ROLLBACK");
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
}

export default new RationRepository();
