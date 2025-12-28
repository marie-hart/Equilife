"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const dateUtils_1 = require("../utils/dateUtils");
class MaterialRepository {
    async findAll(includeInactive = false) {
        let query = 'SELECT * FROM materials';
        if (!includeInactive) {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY last_purchase_date DESC NULLS LAST';
        const result = await database_1.default.query(query);
        return result.rows.map(this.mapRowToMaterial);
    }
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM materials WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToMaterial(result.rows[0]);
    }
    async create(data) {
        const result = await database_1.default.query(`INSERT INTO materials (
        name, description, last_purchase_date,
        purchase_interval_months, purchase_interval_years, estimated_cost
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`, [
            data.name,
            data.description || null,
            data.last_purchase_date || null,
            data.purchase_interval_months || null,
            data.purchase_interval_years || null,
            data.estimated_cost || null,
        ]);
        return this.mapRowToMaterial(result.rows[0]);
    }
    async update(id, data) {
        const result = await database_1.default.query(`UPDATE materials SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        last_purchase_date = COALESCE($3, last_purchase_date),
        purchase_interval_months = COALESCE($4, purchase_interval_months),
        purchase_interval_years = COALESCE($5, purchase_interval_years),
        estimated_cost = COALESCE($6, estimated_cost),
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *`, [
            data.name || null,
            data.description !== undefined ? data.description : null,
            data.last_purchase_date || null,
            data.purchase_interval_months !== undefined ? data.purchase_interval_months : null,
            data.purchase_interval_years !== undefined ? data.purchase_interval_years : null,
            data.estimated_cost !== undefined ? data.estimated_cost : null,
            data.is_active !== undefined ? data.is_active : null,
            id,
        ]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToMaterial(result.rows[0]);
    }
    async delete(id) {
        // Soft delete en mettant is_active à false
        const result = await database_1.default.query('UPDATE materials SET is_active = false WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async getDueForPurchase() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await database_1.default.query(`SELECT * FROM materials 
       WHERE is_active = true 
       AND last_purchase_date IS NOT NULL
       AND (purchase_interval_months IS NOT NULL OR purchase_interval_years IS NOT NULL)`);
        const materials = result.rows.map(this.mapRowToMaterial);
        // Filtrer ceux dont la prochaine date d'achat est arrivée
        return materials.filter(material => {
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
            last_purchase_date: row.last_purchase_date ? new Date(row.last_purchase_date) : undefined,
            purchase_interval_months: row.purchase_interval_months,
            purchase_interval_years: row.purchase_interval_years,
            estimated_cost: row.estimated_cost ? parseFloat(row.estimated_cost) : undefined,
            is_active: row.is_active,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}
exports.MaterialRepository = MaterialRepository;
exports.default = new MaterialRepository();
//# sourceMappingURL=materialRepository.js.map