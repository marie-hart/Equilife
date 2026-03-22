import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const dbPassword = process.env.DB_PASSWORD;
if (isProduction) {
    if (!dbPassword || dbPassword.trim() === "") {
        throw new Error("DB_PASSWORD is required in production. Set it in your .env or environment.");
    }
    if (dbPassword === "horse_password") {
        throw new Error("DB_PASSWORD must not use the default 'horse_password' in production.");
    }
}

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "equilife_db",
    user: process.env.DB_USER || "horse_user",
    password: dbPassword || "horse_password",
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
