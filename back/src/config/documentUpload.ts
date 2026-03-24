import multer from "multer";
import path from "path";
import fs from "fs";

// Créer le dossier uploads/documents s'il n'existe pas
const uploadsDir = path.join(__dirname, "../../uploads/documents");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_DOC_EXT = [".pdf", ".jpeg", ".jpg", ".png", ".doc", ".docx"];

/** Extension sûre uniquement (évite path traversal / double extension). */
function getSafeDocumentExtension(originalname: string): string {
    const ext = path.extname(originalname).toLowerCase().replace(/[^a-z.]/g, "");
    return ALLOWED_DOC_EXT.includes(ext) ? ext : ".bin";
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = getSafeDocumentExtension(file.originalname);
        cb(null, `document-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (
    _req: unknown,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    const allowedTypes = /pdf|jpeg|jpg|png|doc|docx/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
    );
    const mimetype =
        file.mimetype === "application/pdf" ||
        file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimetype === "application/msword" ||
        file.mimetype.startsWith("image/");

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error("Format de fichier non autorisé (pdf, doc, docx, images)."));
};

export const documentUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});

export const documentsUploadDirPath = uploadsDir;
