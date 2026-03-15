import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.DB_PASSWORD) {
    throw new Error("DB_PASSWORD must be set in production. Do not use default credentials.");
}

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "horse_care_db",
    user: process.env.DB_USER || "horse_user",
    password: process.env.DB_PASSWORD || "horse_password",
});

// Test de connexion
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

export default pool;
