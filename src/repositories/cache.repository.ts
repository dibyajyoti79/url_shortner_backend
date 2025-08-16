import { serverConfig } from "../config";
import { redisClient } from "../config/redis";
import logger from "../config/logger.config";

export class CacheRepository {
  async getNextId(): Promise<number> {
    const key = serverConfig.REDIS_URL;

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const result = await redisClient.incr(key);
    logger.info("Generated next ID from Redis", { key, nextId: result });

    return result;
  }

  async setUrlMapping(shortUrl: string, originalUrl: string) {
    const key = `url:${shortUrl}`;

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    await redisClient.set(key, originalUrl, { EX: 86400 });

    logger.info("Cached URL mapping", { shortUrl, originalUrl });
  }

  async getUrlMapping(shortUrl: string): Promise<string | null> {
    const key = `url:${shortUrl}`;

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const result = await redisClient.get(key);

    if (result) {
      return result;
    } else {
      logger.warn("Cache miss", { shortUrl });
      return null;
    }
  }

  async deleteUrlMapping(shortUrl: string) {
    const key = `url:${shortUrl}`;

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    await redisClient.del(key);

    logger.info("Deleted URL mapping from cache", { shortUrl });
  }
}
