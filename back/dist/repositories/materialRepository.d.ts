import { Material, CreateMaterialDto, UpdateMaterialDto } from '../types';
export declare class MaterialRepository {
    private hasHorseIdColumnCache;
    private hasMaterialHorsesTableCache;
    private hasHorseIdColumn;
    private hasMaterialHorsesTable;
    findAll(includeInactive?: boolean, horseId?: string): Promise<Material[]>;
    findById(id: string): Promise<Material | null>;
    create(data: CreateMaterialDto): Promise<Material>;
    update(id: string, data: UpdateMaterialDto): Promise<Material | null>;
    delete(id: string): Promise<boolean>;
    getDueForPurchase(horseId?: string): Promise<Material[]>;
    markAsPurchased(id: string, purchaseDate?: Date): Promise<Material | null>;
    private mapRowToMaterial;
}
declare const _default: MaterialRepository;
export default _default;
//# sourceMappingURL=materialRepository.d.ts.map