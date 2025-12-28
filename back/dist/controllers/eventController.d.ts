import { Request, Response } from 'express';
export declare class EventController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getUpcomingReminders(req: Request, res: Response): Promise<void>;
}
declare const _default: EventController;
export default _default;
//# sourceMappingURL=eventController.d.ts.map