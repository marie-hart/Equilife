import pool from "../config/database";
import { Horse, CreateHorseDto, UpdateHorseDto } from "../types";
import cacheService from "../services/cacheService";
import { CacheKeys } from "../services/cacheKeys";

/** Âge en années, équivalent à calculate_age(birth_date) sans fonction SQL dédiée (évite les 500 si migration absente). */
const HORSE_AGE_SQL = `CASE WHEN birth_date IS NULL THEN NULL ELSE EXTRACT(YEAR FROM age(birth_date))::integer END`;

/** DATE PostgreSQL au format YYYY-MM-DD ; évite Invalid Date / fuseaux. */
function normalizeBirthDateForPg(input?: string | null): string | null {
    if (input == null || typeof input !== "string") return null;
    const t = input.trim();
    if (!t) return null;
    const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
}

const BASE_SELECT = `SELECT 
        id, 
        name, 
        sex,
        breed, 
        coat,
        birth_date, 
        ${HORSE_AGE_SQL} AS age,
        stable_location,
        feed,
        additional_info, 
        photo_path, 
        created_at, 
        updated_at 
      FROM horses`;

export class HorseRepository {
    async findAll(ownerUserId?: string): Promise<Horse[]> {
        const cacheKey = CacheKeys.horsesListKey(ownerUserId);
        const cached = await cacheService.get<Horse[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const params: string[] = [];
        let sql = `${BASE_SELECT}`;
        if (ownerUserId) {
            params.push(ownerUserId);
            sql += ` WHERE user_id = $1`;
        }
        sql += ` ORDER BY created_at DESC`;

        const result = await pool.query(sql, params);
        const horses = result.rows.map(this.mapRowToHorse);

        await cacheService.set(cacheKey, horses, 300);
        return horses;
    }

    async findById(id: string, ownerUserId?: string): Promise<Horse | null> {
        if (!ownerUserId) {
            const cacheKey = CacheKeys.horseKey(id);
            const cached = await cacheService.get<Horse>(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const params: string[] = [id];
        let sql = `${BASE_SELECT} WHERE id = $1`;
        if (ownerUserId) {
            params.push(ownerUserId);
            sql += ` AND user_id = $2`;
        }

        const result = await pool.query(sql, params);

        if (result.rows.length === 0) {
            return null;
        }

        const horse = this.mapRowToHorse(result.rows[0]);
        if (!ownerUserId) {
            await cacheService.set(CacheKeys.horseKey(id), horse, 600);
        }
        return horse;
    }

    async findFirst(ownerUserId?: string): Promise<Horse | null> {
        const params: string[] = [];
        let sql = `${BASE_SELECT}`;
        if (ownerUserId) {
            params.push(ownerUserId);
            sql += ` WHERE user_id = $1`;
        }
        sql += ` ORDER BY created_at ASC LIMIT 1`;

        const result = await pool.query(sql, params);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToHorse(result.rows[0]);
    }

    async create(data: CreateHorseDto, ownerUserId?: string): Promise<Horse> {
        const birthDate = normalizeBirthDateForPg(data.birth_date);

        if (ownerUserId) {
            const result = await pool.query(
                `INSERT INTO horses (
                name,
                sex,
                breed,
                coat,
                birth_date,
                stable_location,
                feed,
                additional_info,
                user_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING 
                id, 
                name, 
                sex,
                breed, 
                coat,
                birth_date, 
                ${HORSE_AGE_SQL} AS age,
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
                    ownerUserId,
                ],
            );

            const horse = this.mapRowToHorse(result.rows[0]);
            this.invalidateCache(horse.id, ownerUserId);
            return horse;
        }

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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
                id, 
                name, 
                sex,
                breed, 
                coat,
                birth_date, 
                ${HORSE_AGE_SQL} AS age,
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

    async update(
        id: string,
        data: UpdateHorseDto,
        ownerUserId?: string,
    ): Promise<Horse | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
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
            values.push(normalizeBirthDateForPg(data.birth_date));
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
            return this.findById(id, ownerUserId);
        }

        values.push(id);
        let whereClause = `WHERE id = $${paramIndex}`;
        if (ownerUserId) {
            paramIndex++;
            values.push(ownerUserId);
            whereClause += ` AND user_id = $${paramIndex}`;
        }

        const result = await pool.query(
            `UPDATE horses 
       SET ${fields.join(", ")} 
       ${whereClause}
       RETURNING 
         id, 
         name, 
         sex,
         breed, 
         coat,
         birth_date, 
         ${HORSE_AGE_SQL} AS age,
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
        this.invalidateCache(id, ownerUserId);
        return horse;
    }

    async updatePhotoPath(
        id: string,
        photoPath: string,
        ownerUserId?: string,
    ): Promise<Horse | null> {
        const values: unknown[] = [photoPath, id];
        let whereClause = "WHERE id = $2";
        if (ownerUserId) {
            values.push(ownerUserId);
            whereClause = "WHERE id = $2 AND user_id = $3";
        }

        const result = await pool.query(
            `UPDATE horses 
       SET photo_path = $1 
       ${whereClause}
       RETURNING 
         id, 
         name, 
         sex,
         breed, 
         coat,
         birth_date, 
         ${HORSE_AGE_SQL} AS age,
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
        this.invalidateCache(id, ownerUserId);
        return horse;
    }

    async delete(id: string, ownerUserId?: string): Promise<boolean> {
        const values: unknown[] = [id];
        let whereClause = "WHERE id = $1";
        if (ownerUserId) {
            values.push(ownerUserId);
            whereClause = "WHERE id = $1 AND user_id = $2";
        }

        const result = await pool.query(
            `DELETE FROM horses ${whereClause}`,
            values,
        );

        const deleted = result.rowCount !== null && result.rowCount > 0;
        if (deleted) {
            this.invalidateCache(id, ownerUserId);
        }
        return deleted;
    }

    private invalidateCache(horseId?: string, ownerUserId?: string): void {
        cacheService.delete(CacheKeys.horsesListKey(ownerUserId));
        if (horseId) {
            cacheService.delete(CacheKeys.horseKey(horseId));
        }
    }

    private mapRowToHorse(row: Record<string, unknown>): Horse {
        return {
            id: row.id as string,
            name: row.name as string,
            sex: (row.sex as Horse["sex"]) || undefined,
            breed: (row.breed as string) || undefined,
            coat: (row.coat as string) || undefined,
            birth_date: row.birth_date
                ? new Date(row.birth_date as string)
                : undefined,
            age:
                row.age !== null && row.age !== undefined
                    ? parseInt(String(row.age), 10)
                    : undefined,
            stable_location: (row.stable_location as string) || undefined,
            feed: (row.feed as string) || undefined,
            additional_info: (row.additional_info as string) || undefined,
            photo_path: (row.photo_path as string) || undefined,
            created_at: new Date(row.created_at as string),
            updated_at: new Date(row.updated_at as string),
        };
    }
}

export default new HorseRepository();
