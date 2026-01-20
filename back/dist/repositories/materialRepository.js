"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const dateUtils_1 = require("../utils/dateUtils");
class MaterialRepository {
    constructor() {
        this.hasHorseIdColumnCache = null;
        this.hasMaterialHorsesTableCache = null;
    }
    async hasHorseIdColumn() {
        if (this.hasHorseIdColumnCache !== null) {
            return this.hasHorseIdColumnCache;
        }
        const result = await database_1.default.query(`SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'materials' AND column_name = 'horse_id'
       LIMIT 1`);
        this.hasHorseIdColumnCache = result.rowCount !== null && result.rowCount > 0;
        return this.hasHorseIdColumnCache;
    }
    async hasMaterialHorsesTable() {
        if (this.hasMaterialHorsesTableCache !== null) {
            return this.hasMaterialHorsesTableCache;
        }
        const result = await database_1.default.query(`SELECT 1
       FROM information_schema.tables
       WHERE table_name = 'material_horses'
       LIMIT 1`);
        this.hasMaterialHorsesTableCache = result.rowCount !== null && result.rowCount > 0;
        return this.hasMaterialHorsesTableCache;
    }
    async findAll(includeInactive = false, horseId) {
        const hasHorseIdColumn = await this.hasHorseIdColumn();
        const hasMaterialHorsesTable = await this.hasMaterialHorsesTable();
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (!includeInactive) {
            conditions.push('materials.is_active = true');
        }
        if (horseId) {
            if (hasHorseIdColumn) {
                if (hasMaterialHorsesTable) {
                    conditions.push(`(materials.horse_id = $${paramIndex++} OR material_horses.horse_id = $${paramIndex++})`);
                    values.push(horseId);
                    values.push(horseId);
                }
                else {
                    conditions.push(`materials.horse_id = $${paramIndex++}`);
                    values.push(horseId);
                }
            }
            else if (hasMaterialHorsesTable) {
                conditions.push(`material_horses.horse_id = $${paramIndex++}`);
                values.push(horseId);
            }
            else {
                // No way to filter by horse without horse_id or material_horses table.
            }
        }
        let query = `
      SELECT materials.*, 
        ${hasMaterialHorsesTable
            ? "COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT material_horses.horse_id), NULL), '{}')"
            : "'{}'::uuid[]"} AS used_for_horses
      FROM materials
      ${hasMaterialHorsesTable ? 'LEFT JOIN material_horses ON material_horses.material_id = materials.id' : ''}
    `;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        if (hasMaterialHorsesTable) {
            query += ' GROUP BY materials.id';
        }
        query += ' ORDER BY last_purchase_date DESC NULLS LAST';
        const result = await database_1.default.query(query, values);
        return result.rows.map(this.mapRowToMaterial);
    }
    async findById(id) {
        const hasMaterialHorsesTable = await this.hasMaterialHorsesTable();
        const result = await database_1.default.query(`SELECT materials.*, 
        ${hasMaterialHorsesTable
            ? "COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT material_horses.horse_id), NULL), '{}')"
            : "'{}'::uuid[]"} AS used_for_horses
       FROM materials
       ${hasMaterialHorsesTable ? 'LEFT JOIN material_horses ON material_horses.material_id = materials.id' : ''}
       WHERE materials.id = $1
       ${hasMaterialHorsesTable ? 'GROUP BY materials.id' : ''}`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToMaterial(result.rows[0]);
    }
    async create(data) {
        const client = await database_1.default.connect();
        try {
            await client.query("BEGIN");
            const hasHorseIdColumn = await this.hasHorseIdColumn();
            const hasMaterialHorsesTable = await this.hasMaterialHorsesTable();
            const columns = [
                "name",
                "description",
                "category",
                "brand",
                "note",
                "last_purchase_date",
                "purchase_interval_months",
                "purchase_interval_years",
                "estimated_cost",
                "needs_repurchase",
            ];
            const values = [
                data.name,
                data.description || null,
                data.category || null,
                data.brand || null,
                data.note || null,
                data.last_purchase_date || null,
                data.purchase_interval_months || null,
                data.purchase_interval_years || null,
                data.estimated_cost || null,
                data.needs_repurchase ?? false,
            ];
            if (hasHorseIdColumn) {
                columns.splice(6, 0, "horse_id");
                values.splice(6, 0, data.horse_id || null);
            }
            const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
            const result = await client.query(`INSERT INTO materials (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`, values);
            const material = result.rows[0];
            if (hasMaterialHorsesTable && data.used_for_horses?.length) {
                const values = data.used_for_horses
                    .map((horseId, index) => `($1, $${index + 2})`)
                    .join(", ");
                await client.query(`INSERT INTO material_horses (material_id, horse_id) VALUES ${values}`, [material.id, ...data.used_for_horses]);
            }
            await client.query("COMMIT");
            return this.mapRowToMaterial({
                ...material,
                used_for_horses: hasMaterialHorsesTable ? data.used_for_horses ?? [] : [],
            });
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    async update(id, data) {
        const client = await database_1.default.connect();
        try {
            await client.query("BEGIN");
            const hasHorseIdColumn = await this.hasHorseIdColumn();
            const hasMaterialHorsesTable = await this.hasMaterialHorsesTable();
            const assignments = [
                "name = COALESCE($1, name)",
                "description = COALESCE($2, description)",
                "category = COALESCE($3, category)",
                "brand = COALESCE($4, brand)",
                "note = COALESCE($5, note)",
                "last_purchase_date = COALESCE($6, last_purchase_date)",
                "purchase_interval_months = COALESCE($7, purchase_interval_months)",
                "purchase_interval_years = COALESCE($8, purchase_interval_years)",
                "estimated_cost = COALESCE($9, estimated_cost)",
            ];
            const values = [
                data.name || null,
                data.description !== undefined ? data.description : null,
                data.category || null,
                data.brand || null,
                data.note !== undefined ? data.note : null,
                data.last_purchase_date || null,
                data.purchase_interval_months !== undefined ? data.purchase_interval_months : null,
                data.purchase_interval_years !== undefined ? data.purchase_interval_years : null,
                data.estimated_cost !== undefined ? data.estimated_cost : null,
            ];
            if (hasHorseIdColumn) {
                assignments.push(`horse_id = COALESCE($${values.length + 1}, horse_id)`);
                values.push(data.horse_id || null);
            }
            assignments.push(`needs_repurchase = COALESCE($${values.length + 1}, needs_repurchase)`);
            values.push(data.needs_repurchase !== undefined ? data.needs_repurchase : null);
            assignments.push(`is_active = COALESCE($${values.length + 1}, is_active)`);
            values.push(data.is_active !== undefined ? data.is_active : null);
            values.push(id);
            const result = await client.query(`UPDATE materials SET
          ${assignments.join(", ")}
        WHERE id = $${values.length}
        RETURNING *`, values);
            if (result.rows.length === 0) {
                await client.query("ROLLBACK");
                return null;
            }
            if (hasMaterialHorsesTable && data.used_for_horses) {
                await client.query(`DELETE FROM material_horses WHERE material_id = $1`, [id]);
                if (data.used_for_horses.length) {
                    const values = data.used_for_horses
                        .map((horseId, index) => `($1, $${index + 2})`)
                        .join(", ");
                    await client.query(`INSERT INTO material_horses (material_id, horse_id) VALUES ${values}`, [id, ...data.used_for_horses]);
                }
            }
            await client.query("COMMIT");
            return this.mapRowToMaterial({
                ...result.rows[0],
                used_for_horses: hasMaterialHorsesTable
                    ? data.used_for_horses ?? result.rows[0].used_for_horses
                    : [],
            });
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    async delete(id) {
        // Soft delete en mettant is_active à false
        const result = await database_1.default.query('UPDATE materials SET is_active = false WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async getDueForPurchase(horseId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hasHorseIdColumn = await this.hasHorseIdColumn();
        const hasMaterialHorsesTable = await this.hasMaterialHorsesTable();
        const result = horseId
            ? await database_1.default.query(`SELECT materials.*, 
            COALESCE(
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT material_horses.horse_id), NULL),
              '{}'
            ) AS used_for_horses
           FROM materials
           ${hasMaterialHorsesTable ? 'LEFT JOIN material_horses ON material_horses.material_id = materials.id' : ''}
           WHERE materials.is_active = true
           AND ${hasHorseIdColumn && hasMaterialHorsesTable
                ? "(materials.horse_id = $1 OR material_horses.horse_id = $1)"
                : hasHorseIdColumn
                    ? "materials.horse_id = $1"
                    : "material_horses.horse_id = $1"}
           ${hasMaterialHorsesTable ? 'GROUP BY materials.id' : ''}`, [horseId])
            : await database_1.default.query(`SELECT materials.*, 
            ${hasMaterialHorsesTable
                ? "COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT material_horses.horse_id), NULL), '{}')"
                : "'{}'::uuid[]"} AS used_for_horses
           FROM materials
           ${hasMaterialHorsesTable ? 'LEFT JOIN material_horses ON material_horses.material_id = materials.id' : ''}
           WHERE materials.is_active = true
           ${hasMaterialHorsesTable ? 'GROUP BY materials.id' : ''}`);
        const materials = result.rows.map(this.mapRowToMaterial);
        // Filtrer ceux dont la prochaine date d'achat est arrivée
        return materials.filter(material => {
            if (material.needs_repurchase)
                return true;
            if (!material.last_purchase_date)
                return false;
            const nextPurchaseDate = (0, dateUtils_1.calculateNextPurchaseDate)(material.last_purchase_date, material.purchase_interval_months, material.purchase_interval_years);
            if (!nextPurchaseDate)
                return false;
            return nextPurchaseDate <= today;
        });
    }
    async markAsPurchased(id, purchaseDate) {
        const date = purchaseDate || new Date();
        const result = await database_1.default.query('UPDATE materials SET last_purchase_date = $1 WHERE id = $2 RETURNING *', [date, id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToMaterial(result.rows[0]);
    }
    mapRowToMaterial(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category || undefined,
            brand: row.brand || undefined,
            note: row.note || undefined,
            last_purchase_date: row.last_purchase_date ? new Date(row.last_purchase_date) : undefined,
            purchase_interval_months: row.purchase_interval_months,
            purchase_interval_years: row.purchase_interval_years,
            estimated_cost: row.estimated_cost ? parseFloat(row.estimated_cost) : undefined,
            horse_id: row.horse_id || undefined,
            used_for_horses: row.used_for_horses || [],
            needs_repurchase: row.needs_repurchase ?? false,
            is_active: row.is_active,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}
exports.MaterialRepository = MaterialRepository;
exports.default = new MaterialRepository();
//# sourceMappingURL=materialRepository.js.map