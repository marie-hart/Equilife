import pool from "../config/database";
import { Product, CreateProductDto, UpdateProductDto } from "../types";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";

const FORBIDDEN_HORSE_ERROR = "FORBIDDEN_HORSE";
const HORSE_REQUIRED_ERROR = "HORSE_REQUIRED";
const PRODUCT_NAME_CONFLICT_ERROR = "PRODUCT_NAME_CONFLICT";

export class ProductRepository {
    async findAll(
        includeInactive = false,
        horseId?: string,
        ownerUserId?: string,
    ): Promise<Product[]> {
        const cacheKey = CacheKeys.productsListKey(
            includeInactive,
            horseId,
            ownerUserId,
        );
        const cached = await cacheService.get<Product[]>(cacheKey);
        if (cached) return cached;

        const conditions: string[] = [];
        const values: unknown[] = [];
        let param = 1;

        if (!includeInactive) {
            conditions.push("products.is_active = true");
        }

        if (horseId) {
            conditions.push(
                `(products.horse_id = $${param} OR product_horses.horse_id = $${param})`,
            );
            values.push(horseId);
            param++;
        }

        if (ownerUserId) {
            conditions.push(
                `(h_primary.user_id = $${param} OR h_linked.user_id = $${param})`,
            );
            values.push(ownerUserId);
            param++;
        }

        let query = `
          SELECT products.*,
            COALESCE(
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT product_horses.horse_id), NULL),
              '{}'
            ) AS used_for_horses
          FROM products
          LEFT JOIN product_horses ON product_horses.product_id = products.id
          LEFT JOIN horses h_primary ON h_primary.id = products.horse_id
          LEFT JOIN horses h_linked ON h_linked.id = product_horses.horse_id
        `;

        if (conditions.length) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += `
          GROUP BY products.id
          ORDER BY products.created_at DESC
        `;

        const result = await pool.query(query, values);
        const products = result.rows.map(this.mapRow);
        await cacheService.set(cacheKey, products, 300);
        return products;
    }

    async findById(id: string, ownerUserId?: string): Promise<Product | null> {
        if (!ownerUserId) {
            const cacheKey = CacheKeys.productKey(id);
            const cached = await cacheService.get<Product>(cacheKey);
            if (cached) return cached;
        }

        const values: unknown[] = [id];
        let whereOwner = "";
        if (ownerUserId) {
            whereOwner = " AND (h_primary.user_id = $2 OR h_linked.user_id = $2)";
            values.push(ownerUserId);
        }

        const result = await pool.query(
            `SELECT products.*,
                    COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT product_horses.horse_id), NULL), '{}') AS used_for_horses
             FROM products
             LEFT JOIN product_horses ON product_horses.product_id = products.id
             LEFT JOIN horses h_primary ON h_primary.id = products.horse_id
             LEFT JOIN horses h_linked ON h_linked.id = product_horses.horse_id
             WHERE products.id = $1 ${whereOwner}
             GROUP BY products.id`,
            values,
        );

        if (!result.rows.length) return null;
        const product = this.mapRow(result.rows[0]);
        if (!ownerUserId) {
            await cacheService.set(CacheKeys.productKey(id), product, 600);
        }
        return product;
    }

    async create(data: CreateProductDto, ownerUserId?: string): Promise<Product> {
        if (ownerUserId && !data.horse_id) {
            throw new Error(HORSE_REQUIRED_ERROR);
        }
        if (ownerUserId && data.horse_id) {
            const isOwner = await this.horseBelongsToUser(data.horse_id, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
            const hasDuplicate = await this.hasNameConflictForUser(
                data.name,
                ownerUserId,
            );
            if (hasDuplicate) throw new Error(PRODUCT_NAME_CONFLICT_ERROR);
        }

        const result = await pool.query(
            `INSERT INTO products (
              name, brand, category, note,
              last_purchase_date, purchase_interval_months,
              quantity_purchased, daily_usage, unit,
              horse_id, needs_repurchase
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                data.name,
                data.brand ?? null,
                data.category,
                data.note ?? null,
                data.last_purchase_date ?? null,
                data.purchase_interval_months ?? null,
                data.quantity_purchased ?? null,
                data.daily_usage ?? null,
                data.unit ?? "kg",
                data.horse_id ?? null,
                data.needs_repurchase ?? false,
            ],
        );

        const product = this.mapRow(result.rows[0]);
        await this.invalidateProductCache(product, ownerUserId);
        return product;
    }

    async update(
        id: string,
        data: UpdateProductDto,
        ownerUserId?: string,
    ): Promise<Product | null> {
        const currentProduct = await this.findById(id, ownerUserId);
        if (!currentProduct) return null;
        if (ownerUserId && data.horse_id) {
            const isOwner = await this.horseBelongsToUser(data.horse_id, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
        }
        if (ownerUserId && data.name) {
            const hasDuplicate = await this.hasNameConflictForUser(
                data.name,
                ownerUserId,
                id,
            );
            if (hasDuplicate) throw new Error(PRODUCT_NAME_CONFLICT_ERROR);
        }

        const result = await pool.query(
            `UPDATE products SET
                name = COALESCE($1, name),
                category = COALESCE($2, category),
                brand = COALESCE($3, brand),
                note = COALESCE($4, note),
                last_purchase_date = COALESCE($5, last_purchase_date),
                quantity_purchased = COALESCE($6, quantity_purchased),
                daily_usage = COALESCE($7, daily_usage),
                unit = COALESCE($8, unit),
                purchase_interval_months = COALESCE($9, purchase_interval_months),
                updated_at = NOW()
            WHERE id = $10
            RETURNING *`,
            [
                data.name ?? null,
                data.category ?? null,
                data.brand ?? null,
                data.note ?? null,
                data.last_purchase_date ?? null,
                data.quantity_purchased ?? null,
                data.daily_usage ?? null,
                data.unit ?? null,
                data.purchase_interval_months ?? null,
                id,
            ],
        );

        const updatedProduct = this.mapRow(result.rows[0]);
        await this.invalidateProductCache(updatedProduct, ownerUserId);
        return updatedProduct;
    }

    async delete(id: string, ownerUserId?: string): Promise<boolean> {
        const product = await this.findById(id, ownerUserId);
        if (!product) return false;

        const result = await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
        if (product) {
            await this.invalidateProductCache(product, ownerUserId);
        }
        return (result.rowCount ?? 0) > 0;
    }

    private async invalidateProductCache(
        product: Product,
        ownerUserId?: string,
    ): Promise<void> {
        await cacheService.delete(CacheKeys.productKey(product.id));

        await cacheService.delete(CacheKeys.productsListKey(true, undefined, ownerUserId));
        await cacheService.delete(CacheKeys.productsListKey(false, undefined, ownerUserId));
        await cacheService.delete(CacheKeys.productsDueKey(undefined, ownerUserId));

        if (product.horse_id) {
            await cacheService.delete(
                CacheKeys.productsListKey(true, product.horse_id, ownerUserId),
            );
            await cacheService.delete(
                CacheKeys.productsListKey(false, product.horse_id, ownerUserId),
            );
            await cacheService.delete(
                CacheKeys.productsDueKey(product.horse_id, ownerUserId),
            );
            await cacheService.delete(CacheKeys.horseRationKey(product.horse_id));
        }
    }

    async getMonthlyBudget(
        horseId: string,
        ownerUserId?: string,
    ): Promise<{ total: number; details: any[] }> {
        if (ownerUserId) {
            const isOwner = await this.horseBelongsToUser(horseId, ownerUserId);
            if (!isOwner) throw new Error(FORBIDDEN_HORSE_ERROR);
        }

        const result = await pool.query(
            `SELECT
                name,
                estimated_cost,
                purchase_interval_months,
                purchase_interval_years,
                CASE
                    WHEN purchase_interval_years > 0 THEN (estimated_cost / (purchase_interval_years * 12))
                    WHEN purchase_interval_months > 0 THEN (estimated_cost / purchase_interval_months)
                    ELSE estimated_cost
                END as monthly_cost
             FROM products
             WHERE (horse_id = $1 OR id IN (SELECT product_id FROM product_horses WHERE horse_id = $1))
               AND is_active = true
               AND estimated_cost IS NOT NULL`,
            [horseId],
        );

        const details = result.rows;
        const total = details.reduce(
            (sum, item) => sum + parseFloat(item.monthly_cost),
            0,
        );

        return {
            total: Math.round(total * 100) / 100,
            details,
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

    private async hasNameConflictForUser(
        name: string,
        ownerUserId: string,
        excludeProductId?: string,
    ): Promise<boolean> {
        const trimmedName = name.trim();
        if (!trimmedName) return false;
        const values: string[] = [ownerUserId, trimmedName];
        let excludeClause = "";
        if (excludeProductId) {
            values.push(excludeProductId);
            excludeClause = " AND p.id <> $3";
        }
        const result = await pool.query(
            `
                SELECT 1
                FROM products p
                INNER JOIN horses h ON h.id = p.horse_id
                WHERE h.user_id = $1
                  AND LOWER(TRIM(p.name)) = LOWER(TRIM($2))
                  ${excludeClause}
                LIMIT 1
            `,
            values,
        );
        return (result.rowCount ?? 0) > 0;
    }

    private mapRow(row: any): Product {
        return {
            ...row,
            last_purchase_date: row.last_purchase_date
                ? new Date(row.last_purchase_date)
                : undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}

export {
    FORBIDDEN_HORSE_ERROR as PRODUCT_FORBIDDEN_HORSE_ERROR,
    HORSE_REQUIRED_ERROR as PRODUCT_HORSE_REQUIRED_ERROR,
    PRODUCT_NAME_CONFLICT_ERROR,
};
export default new ProductRepository();