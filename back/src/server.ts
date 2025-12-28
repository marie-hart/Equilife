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
  console.log(`Server is running on port ${PORT}`);
});

export default app;
