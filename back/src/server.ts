import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import https from 'https';
import fs from 'fs';
import swaggerUi from "swagger-ui-express";
import eventRoutes from "./routes/eventRoutes";
import productRoutes from "./routes/productRoutes";
import horseRoutes from "./routes/horseRoutes";
import documentRoutes from "./routes/documentRoutes";
import rationRoutes from "./routes/rationRoutes";
import pushRoutes from "./routes/pushRoutes";
import pool from "./config/database";
import redis from "./config/redis";
import { swaggerSpec } from "./docs/swagger";
import {
    initPushService,
    startProductStockPushScheduler,
    startReminderPushScheduler,
} from "./services/pushService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middlewares
const corsOrigin = process.env.CORS_ORIGIN;
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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 4. Routes de l'API
app.use("/api/events", eventRoutes);
app.use("/api/products", productRoutes);
app.use("/api/horses", horseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/rations", rationRoutes);
app.use("/api/push", pushRoutes);

// Route d'information (mise à jour pour correspondre à ton schéma réel)
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Equilife App API",
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

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../localhost+1-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../localhost+1.pem')),
};

// 6. Démarrage sécurisé
const start = async () => {
    try {
        // Test de la connexion DB avant de lancer le reste
        await pool.query("SELECT 1");
        console.log("🐘 Database connected");

        if (process.env.NODE_ENV === 'development') {
            const httpsOptions = {
                key: fs.readFileSync('./localhost-key.pem'),
                cert: fs.readFileSync('./localhost.pem'),
            };
            https.createServer(httpsOptions, app).listen(PORT, () => {
                console.log(`🛡️  Local HTTPS: https://localhost:${PORT}`);
            });
        } else {
            app.listen(PORT, () => {
                console.log(`🚀 Production HTTP (behind Proxy): http://localhost:${PORT}`);
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