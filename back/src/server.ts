import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/eventRoutes";
import materialRoutes from "./routes/materialRoutes";
import pool from "./config/database";
import redis from "./config/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - API information
app.get("/", (req: Request, res: Response) => {
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
    },
  });
});

// Health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    const redisStatus = redis.status === "ready" ? "connected" : "disconnected";
    res.json({
      status: "ok",
      database: "connected",
      redis: redisStatus,
    });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/materials", materialRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
