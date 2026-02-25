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
        sex,
        breed, 
        coat,
        birth_date, 
        calculate_age(birth_date) as age,
        stable_location,
        feed,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      ORDER BY created_at DESC`,
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
        sex,
        breed, 
        coat,
        birth_date, 
        calculate_age(birth_date) as age,
        stable_location,
        feed,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      WHERE id = $1`,
            [id],
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
        sex,
        breed, 
        coat,
        birth_date, 
        calculate_age(birth_date) as age,
        stable_location,
        feed,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses 
      ORDER BY created_at ASC 
      LIMIT 1`,
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToHorse(result.rows[0]);
    }

    async create(data: CreateHorseDto): Promise<Horse> {
        const birthDate = data.birth_date ? new Date(data.birth_date) : null;

        const result = await pool.query(
            `INSERT INTO horses (
                name,
                sex,
                breed,
                coat,
                birth_date,
                stable_location,
                feed,
                additional_info
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) -- Corrigé : on s'arrête à $8
            RETURNING 
                id, 
                name, 
                sex,
                breed, 
                coat,
                birth_date, 
                calculate_age(birth_date) as age,
                stable_location,
                feed,
                additional_info, 
                photo_path, 
                created_at, 
                updated_at`,
            [
                data.name,
                data.sex || null,
                data.breed || null,
                data.coat || null,
                birthDate,
                data.stable_location || null,
                data.feed || null,
                data.additional_info || null,
            ],
        );

        const horse = this.mapRowToHorse(result.rows[0]);
        this.invalidateCache(horse.id);
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
        if (data.sex !== undefined) {
            fields.push(`sex = $${paramIndex++}`);
            values.push(data.sex || null);
        }
        if (data.breed !== undefined) {
            fields.push(`breed = $${paramIndex++}`);
            values.push(data.breed || null);
        }
        if (data.coat !== undefined) {
            fields.push(`coat = $${paramIndex++}`);
            values.push(data.coat || null);
        }
        if (data.birth_date !== undefined) {
            fields.push(`birth_date = $${paramIndex++}`);
            values.push(data.birth_date ? new Date(data.birth_date) : null);
        }
        if (data.stable_location !== undefined) {
            fields.push(`stable_location = $${paramIndex++}`);
            values.push(data.stable_location || null);
        }
        if (data.feed !== undefined) {
            fields.push(`feed = $${paramIndex++}`);
            values.push(data.feed || null);
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
         sex,
         breed, 
         coat,
         birth_date, 
         calculate_age(birth_date) as age,
         stable_location,
         feed,
         additional_info, 
         photo_path, 
         created_at, 
         updated_at`,
            values,
        );

        if (result.rows.length === 0) {
            return null;
        }

        const horse = this.mapRowToHorse(result.rows[0]);
        this.invalidateCache(id);
        return horse;
    }

    async updatePhotoPath(
        id: string,
        photoPath: string,
    ): Promise<Horse | null> {
        const result = await pool.query(
            `UPDATE horses 
       SET photo_path = $1 
       WHERE id = $2
       RETURNING 
         id, 
         name, 
         sex,
         breed, 
         coat,
         birth_date, 
         calculate_age(birth_date) as age,
         stable_location,
         feed,
         additional_info, 
         photo_path, 
         created_at, 
         updated_at`,
            [photoPath, id],
        );

        if (result.rows.length === 0) {
            return null;
        }

        const horse = this.mapRowToHorse(result.rows[0]);
        this.invalidateCache(id);
        return horse;
    }

    async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            "DELETE FROM horses WHERE id = $1",
            [id],
        );

        const deleted = result.rowCount !== null && result.rowCount > 0;
        if (deleted) {
            this.invalidateCache(id);
        }
        return deleted;
    }

    private invalidateCache(horseId?: string): void {
        cacheService.delete(CacheKeys.horsesListKey());
        if (horseId) {
            cacheService.delete(CacheKeys.horseKey(horseId));
        }
    }

    private mapRowToHorse(row: any): Horse {
        return {
            id: row.id,
            name: row.name,
            sex: row.sex || undefined,
            breed: row.breed || undefined,
            coat: row.coat || undefined,
            birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
            age: row.age !== null ? parseInt(row.age) : undefined,
            stable_location: row.stable_location || undefined,
            feed: row.feed || undefined,
            additional_info: row.additional_info || undefined,
            photo_path: row.photo_path || undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}

export default new HorseRepository();
