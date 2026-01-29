import multer from "multer";
import path from "path";
import fs from "fs";

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "../../uploads/horses");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom unique avec timestamp + extension originale
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `horse-${uniqueSuffix}${ext}`);
    },
});

// Filtrer les types de fichiers (seulement images)
const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(
            new Error(
                "Seules les images sont autorisées (jpeg, jpg, png, gif, webp)",
            ),
        );
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: fileFilter,
});

export const uploadsDirPath = uploadsDir;
