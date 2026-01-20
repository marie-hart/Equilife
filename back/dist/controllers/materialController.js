"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialController = void 0;
const materialRepository_1 = __importDefault(require("../repositories/materialRepository"));
class MaterialController {
    resolveDbErrorMessage(error) {
        const code = error.code;
        if (code === '42703') {
            return 'Migration manquante: colonne materials.horse_id.';
        }
        return null;
    }
    async getAll(req, res) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const horseId = req.query.horseId;
            const materials = await materialRepository_1.default.findAll(includeInactive, horseId);
            res.json(materials);
        }
        catch (error) {
            console.error('Error fetching materials:', error);
            res.status(500).json({ error: 'Failed to fetch materials' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const material = await materialRepository_1.default.findById(id);
            if (!material) {
                res.status(404).json({ error: 'Material not found' });
                return;
            }
            res.json(material);
        }
        catch (error) {
            console.error('Error fetching material:', error);
            res.status(500).json({ error: 'Failed to fetch material' });
        }
    }
    async create(req, res) {
        try {
            const data = req.body;
            if (data.name) {
                data.name = data.name.trim();
            }
            // Validation
            if (!data.name) {
                res.status(400).json({ error: 'Name is required' });
                return;
            }
            const material = await materialRepository_1.default.create(data);
            res.status(201).json(material);
        }
        catch (error) {
            if (error.code === '23505') {
                res.status(409).json({ error: 'Material already exists' });
                return;
            }
            const dbMessage = this.resolveDbErrorMessage(error);
            if (dbMessage) {
                res.status(500).json({ error: dbMessage });
                return;
            }
            console.error('Error creating material:', error);
            res.status(500).json({ error: 'Failed to create material' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            if (data.name !== undefined) {
                data.name = data.name.trim();
            }
            const material = await materialRepository_1.default.update(id, data);
            if (!material) {
                res.status(404).json({ error: 'Material not found' });
                return;
            }
            res.json(material);
        }
        catch (error) {
            if (error.code === '23505') {
                res.status(409).json({ error: 'Material already exists' });
                return;
            }
            const dbMessage = this.resolveDbErrorMessage(error);
            if (dbMessage) {
                res.status(500).json({ error: dbMessage });
                return;
            }
            console.error('Error updating material:', error);
            res.status(500).json({ error: 'Failed to update material' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await materialRepository_1.default.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Material not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting material:', error);
            res.status(500).json({ error: 'Failed to delete material' });
        }
    }
    async getDueForPurchase(req, res) {
        try {
            const horseId = req.query.horseId;
            const materials = await materialRepository_1.default.getDueForPurchase(horseId);
            res.json(materials);
        }
        catch (error) {
            console.error('Error fetching materials due for purchase:', error);
            res.status(500).json({ error: 'Failed to fetch materials due for purchase' });
        }
    }
    async markAsPurchased(req, res) {
        try {
            const { id } = req.params;
            const { purchaseDate } = req.body;
            const purchaseDateObj = purchaseDate ? new Date(purchaseDate) : undefined;
            const material = await materialRepository_1.default.markAsPurchased(id, purchaseDateObj);
            if (!material) {
                res.status(404).json({ error: 'Material not found' });
                return;
            }
            res.json(material);
        }
        catch (error) {
            console.error('Error marking material as purchased:', error);
            res.status(500).json({ error: 'Failed to mark material as purchased' });
        }
    }
}
exports.MaterialController = MaterialController;
exports.default = new MaterialController();
//# sourceMappingURL=materialController.js.map