import { Request, Response } from 'express';
import documentRepository from '../repositories/documentRepository';
import { CreateDocumentDto } from '../types';
import path from 'path';
import fs from 'fs';
import { documentsUploadDirPath } from '../config/documentUpload';

export class DocumentController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const horseId = req.query.horseId as string | undefined;
      const documents = await documentRepository.findAll(horseId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { horse_id, title, document_date, tag, note } = req.body;

      if (!horse_id || !title) {
        res.status(400).json({ error: 'horse_id and title are required' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const filePath = `/uploads/documents/${req.file.filename}`;
      const data: CreateDocumentDto = {
        horse_id,
        title,
        document_date,
        tag,
        file_path: filePath,
        note,
      };

      const document = await documentRepository.create(data);
      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await documentRepository.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      if (deleted.file_path) {
        const filePath = path.join(documentsUploadDirPath, path.basename(deleted.file_path));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
}

export default new DocumentController();
