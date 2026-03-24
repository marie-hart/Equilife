"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const careHistoryRoutes_1 = __importDefault(require("./routes/careHistoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const horseRoutes_1 = __importDefault(require("./routes/horseRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const rationRoutes_1 = __importDefault(require("./routes/rationRoutes"));
const pushRoutes_1 = __importDefault(require("./routes/pushRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const auth_1 = require("./middleware/auth");
const database_1 = __importDefault(require("./config/database"));
const redis_1 = __importDefault(require("./config/redis"));
const swagger_1 = require("./docs/swagger");
const pushService_1 = require("./services/pushService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 1. Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // L'API sert du JSON, pas de HTML
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
const corsOrigin = process.env.CORS_ORIGIN;
if (process.env.NODE_ENV === "production") {
    if (!corsOrigin || corsOrigin.trim() === "") {
        throw new Error("CORS_ORIGIN is required in production. Set the frontend origin(s) in .env (comma-separated for multiple).");
    }
}
app.use((0, cors_1.default)(corsOrigin
    ? { origin: corsOrigin.split(",").map((o) => o.trim()), credentials: true }
    : undefined));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger docs
// @ts-ignore - Pour ignorer l'incompatibilité de signature mineure
app.use("/api/docs", swagger_ui_express_1.default.serve);
// @ts-ignore - Pour ignorer l'incompatibilité de signature mineure
app.get("/api/docs", swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// 3. Fichiers statiques
// Note: Assure-toi que le dossier 'uploads' existe au démarrage
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// 4. Routes de l'API
app.use("/api/auth", authRoutes_1.default);
app.use("/api/events", auth_1.requireAuth, eventRoutes_1.default);
app.use("/api/care-history", auth_1.requireAuth, careHistoryRoutes_1.default);
app.use("/api/products", auth_1.requireAuth, productRoutes_1.default);
app.use("/api/horses", auth_1.requireAuth, horseRoutes_1.default);
app.use("/api/documents", auth_1.requireAuth, documentRoutes_1.default);
app.use("/api/rations", auth_1.requireAuth, rationRoutes_1.default);
app.use("/api/push", pushRoutes_1.default);
// Route d'information (mise à jour pour correspondre à ton schéma réel)
app.get("/", (req, res) => {
    res.json({
        message: "Equilife App API",
        version: "1.1.0", // Nouvelle version pour ton nouveau schéma
        status: "Running"
    });
});
// Health check avec statut Redis
app.get("/health", async (req, res) => {
    try {
        await database_1.default.query("SELECT 1");
        const redisStatus = redis_1.default.status === "ready" ? "connected" : "disconnected";
        res.json({
            status: "ok",
            database: "connected",
            redis: redisStatus,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});
// 5. Gestion des erreurs
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.use((err, req, res, next) => {
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
        await database_1.default.query("SELECT 1");
        console.log("🐘 Database connected");
        if (process.env.NODE_ENV === 'development') {
            const httpsOptions = {
                key: fs_1.default.readFileSync('./localhost-key.pem'),
                cert: fs_1.default.readFileSync('./localhost.pem'),
            };
            https_1.default.createServer(httpsOptions, app).listen(PORT, () => {
                console.log(`🛡️  Local HTTPS: https://localhost:${PORT}`);
            });
        }
        else {
            app.listen(PORT, () => {
                console.log(`🚀 Production HTTP (behind Proxy): http://localhost:${PORT}`);
            });
        }
        // Initialisation des services de notifications
        const pushEnabled = await (0, pushService_1.initPushService)();
        if (pushEnabled) {
            (0, pushService_1.startReminderPushScheduler)();
            (0, pushService_1.startProductStockPushScheduler)();
            console.log("🔔 Push services and schedulers started");
        }
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
void start();
exports.default = app;
//# sourceMappingURL=server.js.map