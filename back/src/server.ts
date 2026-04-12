import "./config/loadEnv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import https from 'https';
import fs from 'fs';
import swaggerUi from "swagger-ui-express";
import eventRoutes from "./routes/eventRoutes";
import careHistoryRoutes from "./routes/careHistoryRoutes";
import productRoutes from "./routes/productRoutes";
import horseRoutes from "./routes/horseRoutes";
import documentRoutes from "./routes/documentRoutes";
import rationRoutes from "./routes/rationRoutes";
import pushRoutes from "./routes/pushRoutes";
import authRoutes from "./routes/authRoutes";
import quickNoteRoutes from "./routes/quickNoteRoutes";
import { requireAuth } from "./middleware/auth";
import pool from "./config/database";
import redis from "./config/redis";
import { swaggerSpec } from "./docs/swagger";
import {
    initPushService,
    startProductStockPushScheduler,
    startReminderPushScheduler,
} from "./services/pushService";

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middlewares
app.use(
    helmet({
        contentSecurityPolicy: false, // L'API sert du JSON, pas de HTML
        crossOriginResourcePolicy: { policy: "cross-origin" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
);
const corsOrigin = process.env.CORS_ORIGIN;
if (process.env.NODE_ENV === "production") {
    if (!corsOrigin || corsOrigin.trim() === "") {
        throw new Error("CORS_ORIGIN is required in production. Set the frontend origin(s) in .env (comma-separated for multiple).");
    }
}
app.use(
    cors(
        corsOrigin
            ? { origin: corsOrigin.split(",").map((o) => o.trim()), credentials: true }
            : undefined
    )
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
// @ts-ignore - Pour ignorer l'incompatibilité de signature mineure
app.use("/api/docs", swaggerUi.serve);
// @ts-ignore - Pour ignorer l'incompatibilité de signature mineure
app.get("/api/docs", swaggerUi.setup(swaggerSpec) as express.RequestHandler);

// 3. Fichiers statiques
// Note: Assure-toi que le dossier 'uploads' existe au démarrage
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"), {
        maxAge: process.env.UPLOADS_CACHE_MAX_AGE ?? "30d",
        etag: true,
        lastModified: true,
    }),
);

// 4. Routes de l'API
app.use("/api/auth", authRoutes);
app.use("/api/quick-notes", requireAuth, quickNoteRoutes);
app.use("/api/events", requireAuth, eventRoutes);
app.use("/api/care-history", requireAuth, careHistoryRoutes);
app.use("/api/products", requireAuth, productRoutes);
app.use("/api/horses", requireAuth, horseRoutes);
app.use("/api/documents", requireAuth, documentRoutes);
app.use("/api/rations", requireAuth, rationRoutes);
app.use("/api/push", pushRoutes);

// Route d'information (mise à jour pour correspondre à ton schéma réel)
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Equilife API",
        version: "1.1.0", // Nouvelle version pour ton nouveau schéma
        status: "Running"
    });
});

// Health check avec statut Redis
app.get("/health", async (req: Request, res: Response) => {
    try {
        await pool.query("SELECT 1");
        const redisStatus = redis.status === "ready" ? "connected" : "disconnected";
        res.json({
            status: "ok",
            database: "connected",
            redis: redisStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});

// 5. Gestion des erreurs
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    
    // Si c'est une erreur de validation ou de base de données spécifique
    const status = err.status || 500;
    res.status(status).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? "Internal server error" 
            : err.message 
    });
});

// 6. Démarrage sécurisé
const start = async () => {
    try {
        // Test de la connexion DB avant de lancer le reste
        await pool.query("SELECT 1");
        console.log("🐘 Database connected");

        const devHttps =
            process.env.NODE_ENV === "development" &&
            (process.env.DEV_HTTPS === "true" || process.env.DEV_HTTPS === "1");
        const certDir = path.join(__dirname, "..");
        const keyPath = path.join(certDir, "localhost-key.pem");
        const certPath = path.join(certDir, "localhost.pem");

        if (devHttps) {
            try {
                const httpsOptions = {
                    key: fs.readFileSync(keyPath),
                    cert: fs.readFileSync(certPath),
                };
                https.createServer(httpsOptions, app).listen(PORT, () => {
                    console.log(`🛡️  Local HTTPS: https://localhost:${PORT}`);
                });
            } catch (e) {
                console.error(
                    "Certificats HTTPS introuvables, démarrage en HTTP (proxy Vite → http://localhost:%s) :",
                    PORT,
                    e,
                );
                app.listen(PORT, () => {
                    console.log(`🚀 Dev HTTP: http://localhost:${PORT}`);
                });
            }
        } else {
            app.listen(PORT, () => {
                const msg =
                    process.env.NODE_ENV === "development"
                        ? `🚀 Dev HTTP: http://localhost:${PORT} (proxy Vite /api)`
                        : `🚀 Production HTTP (behind proxy): http://localhost:${PORT}`;
                console.log(msg);
            });
        }

        // Initialisation des services de notifications
        const pushEnabled = await initPushService();
        if (pushEnabled) {
            startReminderPushScheduler();
            startProductStockPushScheduler();
            console.log("🔔 Push services and schedulers started");
        }
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

void start();

export default app;