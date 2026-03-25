import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL?.trim();
const dbPassword = process.env.DB_PASSWORD;

if (isProduction && !databaseUrl) {
    if (!dbPassword || dbPassword.trim() === "") {
        throw new Error(
            "DB_PASSWORD is required in production, or set DATABASE_URL (e.g. Render PostgreSQL).",
        );
    }
    if (dbPassword === "horse_password") {
        throw new Error("DB_PASSWORD must not use the default 'horse_password' in production.");
    }
}

function buildPoolConfig(): PoolConfig {
    if (databaseUrl) {
        // Render / hébergeurs managés : TLS souvent requis ; rejectUnauthorized: false est le réglage courant pour les CA internes
        const ssl =
            process.env.DATABASE_SSL === "false"
                ? undefined
                : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true" };
        return {
            connectionString: databaseUrl,
            ...(ssl && { ssl }),
        };
    }
    return {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "equilife_db",
        user: process.env.DB_USER || "horse_user",
        password: dbPassword || "horse_password",
    };
}

const pool = new Pool(buildPoolConfig());

// Test de connexion
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

export default pool;
