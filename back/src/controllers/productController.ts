import { Request, Response } from "express";
import productRepository from "../repositories/productRepository";
import { CreateProductDto, UpdateProductDto } from "../types";
import {
    PRODUCT_FORBIDDEN_HORSE_ERROR,
    PRODUCT_HORSE_REQUIRED_ERROR,
} from "../repositories/productRepository";

export class ProductController {
    // Message d'aide pour le debug si la DB n'est pas à jour
    private resolveDbErrorMessage(error: unknown): string | null {
        const code = (error as { code?: string }).code;
        // Erreur 42703 = Undefined Column
        if (code === "42703") {
            return "Schéma obsolète: vérifiez les colonnes de la table 'products'.";
        }
        return null;
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.includeInactive === "true";
            const horseId = req.query.horseId as string | undefined;
            
            const products = await productRepository.findAll(
                includeInactive,
                horseId,
                req.userId,
            );
            res.json(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ error: "Failed to fetch products" });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const product = await productRepository.findById(id, req.userId);

            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }

            res.json(product);
        } catch (error) {
            console.error("Error fetching product:", error);
            res.status(500).json({ error: "Failed to fetch product" });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateProductDto = req.body;
            if (data.name) {
                data.name = data.name.trim();
            }

            if (!data.name) {
                res.status(400).json({ error: "Name is required" });
                return;
            }

            const product = await productRepository.create(data, req.userId);
            res.status(201).json(product);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === PRODUCT_HORSE_REQUIRED_ERROR
            ) {
                res.status(400).json({
                    error: "horse_id est requis pour créer un produit en mode utilisateur",
                });
                return;
            }
            if (
                error instanceof Error &&
                error.message === PRODUCT_FORBIDDEN_HORSE_ERROR
            ) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            if ((error as { code?: string }).code === "23505") {
                res.status(409).json({ error: "Product with this name already exists" });
                return;
            }
            const dbMessage = this.resolveDbErrorMessage(error);
            if (dbMessage) {
                res.status(500).json({ error: dbMessage });
                return;
            }
            console.error("Error creating product:", error);
            res.status(500).json({ error: "Failed to create product" });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateProductDto = req.body;
            
            if (data.name !== undefined) {
                data.name = data.name.trim();
            }

            const product = await productRepository.update(id, data, req.userId);

            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }

            res.json(product);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === PRODUCT_FORBIDDEN_HORSE_ERROR
            ) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            // ... gestion erreur 23505 et dbMessage identique à create
            console.error("Error updating product:", error);
            res.status(500).json({ error: "Failed to update product" });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await productRepository.delete(id, req.userId);

            if (!deleted) {
                res.status(404).json({ error: "Product not found" });
                return;
            }

            // Pour une suppression logique (is_active = false), 
            // on renvoie souvent 200 avec le produit mis à jour ou 204.
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ error: "Failed to delete product" });
        }
    }

    // Nouveau : Gestion du budget
    async getBudget(req: Request, res: Response): Promise<void> {
        try {
            const { horseId } = req.params;
            if (!horseId) {
                res.status(400).json({ error: "Horse ID is required" });
                return;
            }
            const budget = await productRepository.getMonthlyBudget(
                horseId,
                req.userId,
            );
            res.json(budget);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === PRODUCT_FORBIDDEN_HORSE_ERROR
            ) {
                res.status(403).json({ error: "Accès refusé à ce cheval" });
                return;
            }
            console.error("Error calculating budget:", error);
            res.status(500).json({ error: "Failed to calculate budget" });
        }
    }
}

export default new ProductController();