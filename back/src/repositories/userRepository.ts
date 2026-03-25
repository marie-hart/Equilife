import pool from "../config/database";

export type UserRow = {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
};

const EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
    return email.length <= 255 && EMAIL_RE.test(email);
}

export class UserRepository {
    async findByEmail(email: string): Promise<UserRow | null> {
        const normalized = normalizeEmail(email);
        const result = await pool.query<UserRow>(
            `SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1`,
            [normalized],
        );
        return result.rows[0] ?? null;
    }

    async findById(id: string): Promise<UserRow | null> {
        const result = await pool.query<UserRow>(
            `SELECT id, email, password_hash, created_at, updated_at FROM users WHERE id = $1`,
            [id],
        );
        return result.rows[0] ?? null;
    }

    async create(email: string, passwordHash: string): Promise<UserRow> {
        const normalized = normalizeEmail(email);
        const result = await pool.query<UserRow>(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING id, email, password_hash, created_at, updated_at`,
            [normalized, passwordHash],
        );
        return result.rows[0];
    }

    async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
        await pool.query(
            `UPDATE users SET password_hash = $1 WHERE id = $2`,
            [passwordHash, userId],
        );
    }
}

export default new UserRepository();
