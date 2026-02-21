import pool from "../config/database";
import { Product, CreateProductDto, UpdateProductDto } from "../types";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";
import { calculateNextPurchaseDate } from "../utils/dateUtils";

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
      GROUP BY products.id
      ORDER BY last_purchase_date DESC NULLS LAST
    `;

    const result = await pool.query(query, values);
    const products = result.rows.map(this.mapRow);

    await cacheService.set(cacheKey, products, 300); // Cache 5 min
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
      `INSERT INTO products (name, description, category, brand, note, last_purchase_date, 
                            purchase_interval_months, purchase_interval_years, estimated_cost, 
                            horse_id, needs_repurchase)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        data.name, data.description ?? null, data.category ?? null,
        data.brand ?? null, data.note ?? null, data.last_purchase_date ?? null,
        data.purchase_interval_months ?? null, data.purchase_interval_years ?? null,
        data.estimated_cost ?? null, data.horse_id ?? null, data.needs_repurchase ?? false,
      ]
    );

    const product = this.mapRow(result.rows[0]);
    await this.invalidateProductCache(product);
    return product;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product | null> {
    // 1. Récupérer l'état actuel du produit pour les calculs
    const currentProduct = await this.findById(id);
    if (!currentProduct) return null;

    // 2. Préparer les données de rachat automatique
    let autoNeedsRepurchase = data.needs_repurchase;

    // Si on met à jour la date d'achat ou l'intervalle, on recalcule
    const lastDate = data.last_purchase_date || currentProduct.last_purchase_date;
    const intervalMonths = data.purchase_interval_months ?? currentProduct.purchase_interval_months;
    const intervalYears = data.purchase_interval_years ?? currentProduct.purchase_interval_years;

    if (lastDate && (intervalMonths || intervalYears)) {
      const nextPurchaseDate = calculateNextPurchaseDate(
        new Date(lastDate),
        intervalMonths || 0,
        intervalYears || 0
      );

      // Si la date actuelle est après la date de rachat prévue, on force needs_repurchase à true
      if (new Date() >= nextPurchaseDate) {
        autoNeedsRepurchase = true;
      } else if (data.last_purchase_date) { 
        // Si l'utilisateur vient de renseigner un achat récent, on repasse à false
        autoNeedsRepurchase = false;
      }
    }

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        last_purchase_date = COALESCE($2, last_purchase_date),
        purchase_interval_months = COALESCE($3, purchase_interval_months),
        purchase_interval_years = COALESCE($4, purchase_interval_years),
        needs_repurchase = COALESCE($5, needs_repurchase),
        -- ... autres champs
        updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [
        data.name ?? null,
        data.last_purchase_date ?? null,
        data.purchase_interval_months ?? null,
        data.purchase_interval_years ?? null,
        autoNeedsRepurchase ?? null, // Utilise la valeur calculée
        id
      ]
    );

    const updatedProduct = this.mapRow(result.rows[0]);
    await this.invalidateProductCache(updatedProduct);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    // On récupère le produit avant de le désactiver pour savoir quel horseId invalider
    const product = await this.findById(id);
    
    const result = await pool.query(
      `UPDATE products SET is_active = false WHERE id = $1`,
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
    // 1. Invalide le produit spécifique
    await cacheService.delete(CacheKeys.productKey(product.id));
    
    // 2. Invalide les listes globales (actives et inactives)
    await cacheService.delete(CacheKeys.productsListKey(true));
    await cacheService.delete(CacheKeys.productsListKey(false));
    await cacheService.delete(CacheKeys.productsDueKey());

    // 3. Invalide les listes liées au cheval spécifique
    if (product.horse_id) {
        await cacheService.delete(CacheKeys.productsListKey(true, product.horse_id));
        await cacheService.delete(CacheKeys.productsListKey(false, product.horse_id));
        await cacheService.delete(CacheKeys.productsDueKey(product.horse_id));
        
        // CRITIQUE : Si c'est un aliment, la ration du cheval doit être rafraîchie
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
        total: Math.round(total * 100) / 100, // Arrondi à 2 décimales
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