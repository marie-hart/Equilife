"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const materialRoutes_1 = __importDefault(require("./routes/materialRoutes"));
const horseRoutes_1 = __importDefault(require("./routes/horseRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const rationRoutes_1 = __importDefault(require("./routes/rationRoutes"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = __importDefault(require("./config/redis"));
const swagger_1 = require("./docs/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger docs
const swaggerServe = swagger_ui_express_1.default.serve;
const swaggerSetup = swagger_ui_express_1.default.setup(swagger_1.swaggerSpec);
app.use("/api/docs", ...swaggerServe, swaggerSetup);
// Servir les fichiers statiques (photos uploadées)
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Root route - API information
app.get("/", (req, res) => {
    res.json({
        message: "Horse Care App API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            events: {
                base: "/api/events",
                list: "GET /api/events",
                reminders: "GET /api/events/reminders",
                getById: "GET /api/events/:id",
                create: "POST /api/events",
                update: "PUT /api/events/:id",
                delete: "DELETE /api/events/:id",
            },
            materials: {
                base: "/api/materials",
                list: "GET /api/materials",
                dueForPurchase: "GET /api/materials/due-for-purchase",
                getById: "GET /api/materials/:id",
                create: "POST /api/materials",
                update: "PUT /api/materials/:id",
                delete: "DELETE /api/materials/:id",
                markAsPurchased: "POST /api/materials/:id/purchase",
            },
            horses: {
                base: "/api/horses",
                list: "GET /api/horses",
                first: "GET /api/horses/first",
                getById: "GET /api/horses/:id",
                create: "POST /api/horses",
                update: "PUT /api/horses/:id",
                uploadPhoto: "POST /api/horses/:id/photo",
                delete: "DELETE /api/horses/:id",
            },
            documents: {
                base: "/api/documents",
                list: "GET /api/documents",
                create: "POST /api/documents",
                delete: "DELETE /api/documents/:id",
            },
            rations: {
                base: "/api/rations",
                list: "GET /api/rations",
                create: "POST /api/rations",
            },
        },
    });
});
// Health check
app.get("/health", async (req, res) => {
    try {
        await database_1.default.query("SELECT 1");
        const redisStatus = redis_1.default.status === "ready" ? "connected" : "disconnected";
        res.json({
            status: "ok",
            database: "connected",
            redis: redisStatus,
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});
// Routes
app.use("/api/events", eventRoutes_1.default);
app.use("/api/materials", materialRoutes_1.default);
app.use("/api/horses", horseRoutes_1.default);
app.use("/api/documents", documentRoutes_1.default);
app.use("/api/rations", rationRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map