import pool from "../config/database";
import { Horse, CreateHorseDto, UpdateHorseDto } from "../types";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";

export class HorseRepository {
  async findAll(): Promise<Horse[]> {
    const cacheKey = CacheKeys.horsesListKey();
    const cached = await cacheService.get<Horse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        breed, 
        birth_date, 
        calculate_age(birth_date) as age,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      ORDER BY created_at DESC`
    );
    const horses = result.rows.map(this.mapRowToHorse);

    await cacheService.set(cacheKey, horses, 300);
    return horses;
  }

  async findById(id: string): Promise<Horse | null> {
    const cacheKey = CacheKeys.horseKey(id);
    const cached = await cacheService.get<Horse>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        breed, 
        birth_date, 
        calculate_age(birth_date) as age,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const horse = this.mapRowToHorse(result.rows[0]);
    await cacheService.set(cacheKey, horse, 600);
    return horse;
  }

  async findFirst(): Promise<Horse | null> {
    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        breed, 
        birth_date, 
        calculate_age(birth_date) as age,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      ORDER BY created_at ASC 
      LIMIT 1`
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToHorse(result.rows[0]);
  }

  async create(data: CreateHorseDto): Promise<Horse> {
    const birthDate = data.birth_date ? new Date(data.birth_date) : null;

    const result = await pool.query(
      `INSERT INTO horses (name, breed, birth_date, additional_info) 
       VALUES ($1, $2, $3, $4) 
       RETURNING 
         id, 
         name, 
         breed, 
         birth_date, 
         calculate_age(birth_date) as age,
         additional_info, 
         photo_path, 
         created_at, 
         updated_at`,
      [data.name, data.breed || null, birthDate, data.additional_info || null]
    );

    const horse = this.mapRowToHorse(result.rows[0]);
    this.invalidateCache();
    return horse;
  }

  async update(id: string, data: UpdateHorseDto): Promise<Horse | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.breed !== undefined) {
      fields.push(`breed = $${paramIndex++}`);
      values.push(data.breed || null);
    }
    if (data.birth_date !== undefined) {
      fields.push(`birth_date = $${paramIndex++}`);
      values.push(data.birth_date ? new Date(data.birth_date) : null);
    }
    if (data.additional_info !== undefined) {
      fields.push(`additional_info = $${paramIndex++}`);
      values.push(data.additional_info || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE horses 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING 
         id, 
         name, 
         breed, 
         birth_date, 
         calculate_age(birth_date) as age,
         additional_info, 
         photo_path, 
         created_at, 
         updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const horse = this.mapRowToHorse(result.rows[0]);
    this.invalidateCache();
    return horse;
  }

  async updatePhotoPath(id: string, photoPath: string): Promise<Horse | null> {
    const result = await pool.query(
      `UPDATE horses 
       SET photo_path = $1 
       WHERE id = $2
       RETURNING 
         id, 
         name, 
         breed, 
         birth_date, 
         calculate_age(birth_date) as age,
         additional_info, 
         photo_path, 
         created_at, 
         updated_at`,
      [photoPath, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const horse = this.mapRowToHorse(result.rows[0]);
    this.invalidateCache();
    return horse;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM horses WHERE id = $1", [id]);
    this.invalidateCache();
    return result.rowCount !== null && result.rowCount > 0;
  }

  private invalidateCache(): void {
    cacheService.delete(CacheKeys.horsesListKey());
    // Invalider aussi les caches spécifiques si nécessaire
  }

  private mapRowToHorse(row: any): Horse {
    return {
      id: row.id,
      name: row.name,
      breed: row.breed || undefined,
      birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
      age: row.age !== null ? parseInt(row.age) : undefined,
      additional_info: row.additional_info || undefined,
      photo_path: row.photo_path || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

export default new HorseRepository();
