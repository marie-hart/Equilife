"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const materialRoutes_1 = __importDefault(require("./routes/materialRoutes"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = __importDefault(require("./config/redis"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map