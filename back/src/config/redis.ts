import "./loadEnv";
import Redis from "ioredis";
import MockRedis from "ioredis-mock";

const redisDisabled =
    process.env.REDIS_ENABLED === "false" ||
    process.env.REDIS_ENABLED === "0";

const redisUrl = process.env.REDIS_URL?.trim();

function createRedis(): Redis {
    if (redisDisabled) {
        console.log(
            "[redis] REDIS_ENABLED=false — cache en mémoire (pas de serveur Redis)",
        );
        return new MockRedis() as unknown as Redis;
    }

    if (redisUrl) {
        return new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
    }

    return new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });
}

const redis = createRedis();

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    if (!redisDisabled) {
        console.error("Redis connection error:", err);
    }
});

redis.on("close", () => {
    if (!redisDisabled) {
        console.log("Redis connection closed");
    }
});

export default redis;
