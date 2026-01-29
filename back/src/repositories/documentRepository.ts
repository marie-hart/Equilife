import pool from "../config/database";
import { CreateDocumentDto, Document } from "../types";

export class DocumentRepository {
    async findAll(horseId?: string): Promise<Document[]> {
        const result = horseId
            ? await pool.query(
                  `SELECT *
           FROM documents
           WHERE horse_id = $1
           ORDER BY document_date DESC NULLS LAST, created_at DESC`,
                  [horseId],
              )
            : await pool.query(
                  `SELECT *
           FROM documents
           ORDER BY document_date DESC NULLS LAST, created_at DESC`,
              );
        return result.rows.map(this.mapRowToDocument);
    }

    async create(data: CreateDocumentDto): Promise<Document> {
        const documentDate = data.document_date
            ? new Date(data.document_date)
            : null;
        const result = await pool.query(
            `INSERT INTO documents (horse_id, title, document_date, tag, file_path, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [
                data.horse_id,
                data.title,
                documentDate,
                data.tag || null,
                data.file_path,
                data.note || null,
            ],
        );
        return this.mapRowToDocument(result.rows[0]);
    }

    async delete(id: string): Promise<Document | null> {
        const result = await pool.query(
            `DELETE FROM documents WHERE id = $1 RETURNING *`,
            [id],
        );
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToDocument(result.rows[0]);
    }

    private mapRowToDocument(row: any): Document {
        return {
            id: row.id,
            horse_id: row.horse_id,
            title: row.title,
            document_date: row.document_date
                ? new Date(row.document_date)
                : undefined,
            tag: row.tag || undefined,
            file_path: row.file_path,
            note: row.note || undefined,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}

export default new DocumentRepository();
