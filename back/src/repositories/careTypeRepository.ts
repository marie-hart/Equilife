import pool from "../config/database";
import { CareType } from "../types";

type CreateCareTypeInput = {
    name: string;
    category: string;
};

type CreateCareTypeResult = {
    careType: CareType;
    created: boolean;
};

class CareTypeRepository {
    private tableReady = false;

    async findAllByUser(userId: string): Promise<CareType[]> {
        await this.ensureTable();
        const result = await pool.query(
            `
                SELECT id, user_id, name, category, created_at, updated_at
                FROM care_types
                WHERE user_id = $1
                ORDER BY category ASC, name ASC
            `,
            [userId],
        );
        return result.rows.map((row) => this.mapRow(row));
    }

    async createForUser(
        userId: string,
        input: CreateCareTypeInput,
    ): Promise<CreateCareTypeResult> {
        await this.ensureTable();
        const normalizedName = input.name.trim();
        const normalizedCategory = input.category.trim();

        const existingResult = await pool.query(
            `
                SELECT id, user_id, name, category, created_at, updated_at
                FROM care_types
                WHERE user_id = $1
                  AND LOWER(name) = LOWER($2)
                LIMIT 1
            `,
            [userId, normalizedName],
        );

        if (existingResult.rows.length > 0) {
            return {
                careType: this.mapRow(existingResult.rows[0]),
                created: false,
            };
        }

        try {
            const insertResult = await pool.query(
                `
                    INSERT INTO care_types (user_id, name, category)
                    VALUES ($1, $2, $3)
                    RETURNING id, user_id, name, category, created_at, updated_at
                `,
                [userId, normalizedName, normalizedCategory],
            );

            return {
                careType: this.mapRow(insertResult.rows[0]),
                created: true,
            };
        } catch (error: any) {
            if (error?.code !== "23505") throw error;
            const duplicatedResult = await pool.query(
                `
                    SELECT id, user_id, name, category, created_at, updated_at
                    FROM care_types
                    WHERE user_id = $1
                      AND LOWER(name) = LOWER($2)
                    LIMIT 1
                `,
                [userId, normalizedName],
            );
            if (!duplicatedResult.rows.length) throw error;
            return {
                careType: this.mapRow(duplicatedResult.rows[0]),
                created: false,
            };
        }
    }

    private async ensureTable(): Promise<void> {
        if (this.tableReady) return;

        await pool.query(`
            CREATE TABLE IF NOT EXISTS care_types (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(160) NOT NULL,
                category VARCHAR(120) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_care_types_user_id
            ON care_types(user_id);
        `);

        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_care_types_user_name_lower
            ON care_types(user_id, LOWER(name));
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_trigger
                    WHERE tgname = 'update_care_types_updated_at'
                ) THEN
                    CREATE TRIGGER update_care_types_updated_at
                        BEFORE UPDATE ON care_types
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                END IF;
            END $$;
        `);

        this.tableReady = true;
    }

    private mapRow(row: any): CareType {
        return {
            id: String(row.id),
            user_id: String(row.user_id),
            name: String(row.name),
            category: String(row.category),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}

export default new CareTypeRepository();
