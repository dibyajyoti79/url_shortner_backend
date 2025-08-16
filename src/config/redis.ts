import { createClient } from "redis";
import { serverConfig } from ".";
import logger from "./logger.config";

export const redisClient = createClient({
  url: serverConfig.REDIS_URL,
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  logger.info("Redis Client Connected");
});

export async function initRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Error connecting to Redis:", error);
    throw error;
  }
}

export async function closeRedis() {
  try {
    await redisClient.quit();
    logger.info("Redis Client Disconnected");
  } catch (error) {
    logger.error("Error disconnecting from Redis:", error);
    throw error;
  }
}
