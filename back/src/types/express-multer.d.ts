/**
 * Extension Express pour les routes avec multer (req.file).
 * Complète @types/multer si la résolution des types échoue (CI, IDE).
 */
import "express";

declare global {
    namespace Express {
        namespace Multer {
            interface File {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
            }
        }
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

export {};
