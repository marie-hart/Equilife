import path from "path";
import dotenv from "dotenv";

/** Charge `.env` puis `.env.local` (priorité au local, pratique pour DB / secrets en dev). */
dotenv.config();
if (process.env.NODE_ENV !== "production") {
    dotenv.config({
        path: path.resolve(process.cwd(), ".env.local"),
        override: true,
    });
}
