import { Request, Response } from 'express';
export declare class MaterialController {
    private resolveDbErrorMessage;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getDueForPurchase(req: Request, res: Response): Promise<void>;
    markAsPurchased(req: Request, res: Response): Promise<void>;
}
declare const _default: MaterialController;
export default _default;
//# sourceMappingURL=materialController.d.ts.map