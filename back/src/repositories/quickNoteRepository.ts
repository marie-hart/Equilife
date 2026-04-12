import pool from "../config/database";

export type QuickNoteRow = {
    id: string;
    user_id: string;
    horse_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
};

export class QuickNoteRepository {
    async horseBelongsToUser(horseId: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM horses WHERE id = $1 AND user_id = $2`,
            [horseId, userId],
        );
        return (result.rowCount ?? 0) > 0;
    }

    async findAllByUserId(
        userId: string,
        horseId: string,
    ): Promise<QuickNoteRow[]> {
        const result = await pool.query<QuickNoteRow>(
            `SELECT id, user_id, horse_id, content, created_at, updated_at
             FROM quick_notes
             WHERE user_id = $1
               AND horse_id = $2
             ORDER BY created_at DESC`,
            [userId, horseId],
        );
        return result.rows;
    }

    async create(
        userId: string,
        horseId: string,
        content: string,
    ): Promise<QuickNoteRow> {
        const result = await pool.query<QuickNoteRow>(
            `INSERT INTO quick_notes (user_id, horse_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, horse_id, content, created_at, updated_at`,
            [userId, horseId, content],
        );
        return result.rows[0];
    }

    async update(
        id: string,
        userId: string,
        content: string,
    ): Promise<QuickNoteRow | null> {
        const result = await pool.query<QuickNoteRow>(
            `UPDATE quick_notes
             SET content = $1
             WHERE id = $2 AND user_id = $3
             RETURNING id, user_id, horse_id, content, created_at, updated_at`,
            [content, id, userId],
        );
        return result.rows[0] ?? null;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM quick_notes WHERE id = $1 AND user_id = $2`,
            [id, userId],
        );
        return result.rowCount !== null && result.rowCount > 0;
    }
}

export default new QuickNoteRepository();
