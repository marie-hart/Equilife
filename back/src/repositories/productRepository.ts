import pool from "../config/database";
import { Product, CreateProductDto, UpdateProductDto } from "../types";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";

export class ProductRepository {
  
  async findAll(includeInactive = false, horseId?: string): Promise<Product[]> {
    const cacheKey = CacheKeys.productsListKey(includeInactive, horseId);
    const cached = await cacheService.get<Product[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];
    let param = 1;

    if (!includeInactive) {
      conditions.push("products.is_active = true");
    }

    if (horseId) {
      conditions.push(
        `(products.horse_id = $${param} OR product_horses.horse_id = $${param})`
      );
      values.push(horseId);
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
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += `
      GROUP BY products.id, products.last_purchase_date -- Ajoute la colonne ici
      ORDER BY products.last_purchase_date DESC NULLS LAST
    `;
    const result = await pool.query(query, values);
    const products = result.rows.map(this.mapRow);

    await cacheService.set(cacheKey, products, 300);
    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const cacheKey = CacheKeys.productKey(id);
    const cached = await cacheService.get<Product>(cacheKey);
    if (cached) return cached;

    const result = await pool.query(
      `SELECT products.*, 
              COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT product_horses.horse_id), NULL), '{}') AS used_for_horses
       FROM products
       LEFT JOIN product_horses ON product_horses.product_id = products.id
       WHERE products.id = $1
       GROUP BY products.id`,
      [id]
    );

    if (!result.rows.length) return null;
    const product = this.mapRow(result.rows[0]);
    
    await cacheService.set(cacheKey, product, 600);
    return product;
  }

  async create(data: CreateProductDto): Promise<Product> {
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
      data.needs_repurchase ?? false
    ]
  );

  const product = this.mapRow(result.rows[0]);
  await this.invalidateProductCache(product);
  return product;
}

  async update(id: string, data: UpdateProductDto): Promise<Product | null> {
    const currentProduct = await this.findById(id);
    if (!currentProduct) return null;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        brand = COALESCE($3, brand),
        note = COALESCE($4, note),
        last_purchase_date = $5,             -- Pas de COALESCE ici pour permettre de vider la date
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
        id                                    
      ]
    );

    const updatedProduct = this.mapRow(result.rows[0]);
    await this.invalidateProductCache(updatedProduct);
    return updatedProduct;
  }

 async delete(id: string): Promise<boolean> {
  const product = await this.findById(id);
  
  // Utilise DELETE au lieu de UPDATE
  const result = await pool.query(
    `DELETE FROM products WHERE id = $1`,
    [id]
  );

  if (product) {
    await this.invalidateProductCache(product);
  }
  return (result.rowCount ?? 0) > 0;
}

  /**
   * Invalidation intelligente du cache
   */
  private async invalidateProductCache(product: Product): Promise<void> {
    await cacheService.delete(CacheKeys.productKey(product.id));
    
    await cacheService.delete(CacheKeys.productsListKey(true));
    await cacheService.delete(CacheKeys.productsListKey(false));
    await cacheService.delete(CacheKeys.productsDueKey());

    if (product.horse_id) {
        await cacheService.delete(CacheKeys.productsListKey(true, product.horse_id));
        await cacheService.delete(CacheKeys.productsListKey(false, product.horse_id));
        await cacheService.delete(CacheKeys.productsDueKey(product.horse_id));
        
        await cacheService.delete(CacheKeys.horseRationKey(product.horse_id));
    }
  }

  async getMonthlyBudget(horseId: string): Promise<{ total: number; details: any[] }> {
    const result = await pool.query(
        `SELECT 
            name,
            estimated_cost,
            purchase_interval_months,
            purchase_interval_years,
            CASE 
                WHEN purchase_interval_years > 0 THEN (estimated_cost / (purchase_interval_years * 12))
                WHEN purchase_interval_months > 0 THEN (estimated_cost / purchase_interval_months)
                ELSE estimated_cost -- Si pas d'intervalle, on compte le coût total (achat unique)
            END as monthly_cost
         FROM products
         WHERE (horse_id = $1 OR id IN (SELECT product_id FROM product_horses WHERE horse_id = $1))
           AND is_active = true
           AND estimated_cost IS NOT NULL`,
        [horseId]
    );

    const details = result.rows;
    const total = details.reduce((sum, item) => sum + parseFloat(item.monthly_cost), 0);

    return {
        total: Math.round(total * 100) / 100,
        details
    };
  }

  private mapRow(row: any): Product {
    return {
      ...row,
      last_purchase_date: row.last_purchase_date ? new Date(row.last_purchase_date) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

export default new ProductRepository();