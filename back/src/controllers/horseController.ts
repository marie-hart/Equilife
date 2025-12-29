import { Request, Response } from 'express';
import horseRepository from '../repositories/horseRepository';
import { CreateHorseDto, UpdateHorseDto } from '../types';
import path from 'path';
import fs from 'fs';
import { uploadsDirPath } from '../config/upload';

export class HorseController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const horses = await horseRepository.findAll();
      res.json(horses);
    } catch (error) {
      console.error('Error fetching horses:', error);
      res.status(500).json({ error: 'Failed to fetch horses' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const horse = await horseRepository.findById(id);

      if (!horse) {
        res.status(404).json({ error: 'Horse not found' });
        return;
      }

      res.json(horse);
    } catch (error) {
      console.error('Error fetching horse:', error);
      res.status(500).json({ error: 'Failed to fetch horse' });
    }
  }

  async getFirst(req: Request, res: Response): Promise<void> {
    try {
      const horse = await horseRepository.findFirst();

      if (!horse) {
        res.status(404).json({ error: 'No horse found' });
        return;
      }

      res.json(horse);
    } catch (error) {
      console.error('Error fetching first horse:', error);
      res.status(500).json({ error: 'Failed to fetch horse' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateHorseDto = req.body;

      if (!data.name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const horse = await horseRepository.create(data);
      res.status(201).json(horse);
    } catch (error) {
      console.error('Error creating horse:', error);
      res.status(500).json({ error: 'Failed to create horse' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateHorseDto = req.body;

      const horse = await horseRepository.update(id, data);

      if (!horse) {
        res.status(404).json({ error: 'Horse not found' });
        return;
      }

      res.json(horse);
    } catch (error) {
      console.error('Error updating horse:', error);
      res.status(500).json({ error: 'Failed to update horse' });
    }
  }

  async uploadPhoto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Supprimer l'ancienne photo si elle existe
      const horse = await horseRepository.findById(id);
      if (horse?.photo_path) {
        const oldPhotoPath = path.join(uploadsDirPath, path.basename(horse.photo_path));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Enregistrer le nouveau chemin de la photo
      const photoPath = `/uploads/horses/${req.file.filename}`;
      const updatedHorse = await horseRepository.updatePhotoPath(id, photoPath);

      if (!updatedHorse) {
        res.status(404).json({ error: 'Horse not found' });
        return;
      }

      res.json(updatedHorse);
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Supprimer la photo si elle existe
      const horse = await horseRepository.findById(id);
      if (horse?.photo_path) {
        const photoPath = path.join(uploadsDirPath, path.basename(horse.photo_path));
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      const deleted = await horseRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Horse not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting horse:', error);
      res.status(500).json({ error: 'Failed to delete horse' });
    }
  }
}

export default new HorseController();
