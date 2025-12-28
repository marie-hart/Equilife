import { Material, CreateMaterialDto, UpdateMaterialDto } from '../types';
export declare class MaterialRepository {
    findAll(includeInactive?: boolean): Promise<Material[]>;
    findById(id: string): Promise<Material | null>;
    create(data: CreateMaterialDto): Promise<Material>;
    update(id: string, data: UpdateMaterialDto): Promise<Material | null>;
    delete(id: string): Promise<boolean>;
    getDueForPurchase(): Promise<Material[]>;
    markAsPurchased(id: string, purchaseDate?: Date): Promise<Material | null>;
    private mapRowToMaterial;
}
declare const _default: MaterialRepository;
export default _default;
//# sourceMappingURL=materialRepository.d.ts.map