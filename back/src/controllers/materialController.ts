import { Request, Response } from 'express';
import materialRepository from '../repositories/materialRepository';
import { CreateMaterialDto, UpdateMaterialDto } from '../types';

export class MaterialController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const materials = await materialRepository.findAll(includeInactive);
      res.json(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ error: 'Failed to fetch materials' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await materialRepository.findById(id);

      if (!material) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json(material);
    } catch (error) {
      console.error('Error fetching material:', error);
      res.status(500).json({ error: 'Failed to fetch material' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateMaterialDto = req.body;

      // Validation
      if (!data.name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const material = await materialRepository.create(data);
      res.status(201).json(material);
    } catch (error) {
      console.error('Error creating material:', error);
      res.status(500).json({ error: 'Failed to create material' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateMaterialDto = req.body;

      const material = await materialRepository.update(id, data);

      if (!material) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json(material);
    } catch (error) {
      console.error('Error updating material:', error);
      res.status(500).json({ error: 'Failed to update material' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await materialRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting material:', error);
      res.status(500).json({ error: 'Failed to delete material' });
    }
  }

  async getDueForPurchase(req: Request, res: Response): Promise<void> {
    try {
      const materials = await materialRepository.getDueForPurchase();
      res.json(materials);
    } catch (error) {
      console.error('Error fetching materials due for purchase:', error);
      res.status(500).json({ error: 'Failed to fetch materials due for purchase' });
    }
  }

  async markAsPurchased(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { purchaseDate } = req.body;

      const purchaseDateObj = purchaseDate ? new Date(purchaseDate) : undefined;
      const material = await materialRepository.markAsPurchased(id, purchaseDateObj);

      if (!material) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json(material);
    } catch (error) {
      console.error('Error marking material as purchased:', error);
      res.status(500).json({ error: 'Failed to mark material as purchased' });
    }
  }
}

export default new MaterialController();

