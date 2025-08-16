import { serverConfig } from "../config";
import { CacheRepository } from "../repositories/cache.repository";
import { UrlRepository } from "../repositories/url.repository";
import { encodeBase62 } from "../utils/base62";
import { NotFoundError } from "../utils/errors/app.error";
import logger from "../config/logger.config";

export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly cacheRepository: CacheRepository
  ) {}

  async createShortUrl(originalUrl: string) {
    logger.info("Creating short URL", {
      action: "createShortUrl",
      originalUrl,
    });

    const nextId = await this.cacheRepository.getNextId();
    const shortUrl = encodeBase62(nextId);

    const url = await this.urlRepository.create({ originalUrl, shortUrl });
    await this.cacheRepository.setUrlMapping(shortUrl, originalUrl);

    const baseUrl = serverConfig.BASE_URL;
    const fullUrl = `${baseUrl}/${shortUrl}`;

    logger.info("Short URL created successfully", {
      action: "createShortUrl",
      shortUrl,
      fullUrl,
    });

    return {
      id: url._id.toString(),
      shortUrl,
      originalUrl,
      fullUrl,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  async getOrignalUrl(shortUrl: string) {
    logger.info("Fetching original URL", { action: "getOrignalUrl", shortUrl });

    const originalUrl = await this.cacheRepository.getUrlMapping(shortUrl);

    if (originalUrl) {
      await this.urlRepository.incrementClicks(shortUrl);
      return { originalUrl, shortUrl };
    }

    logger.warn("Cache miss, checking repository", { shortUrl });
    const url = await this.urlRepository.findByShortUrl(shortUrl);

    if (!url) {
      logger.warn("Short URL not found in repository", { shortUrl });
      throw new NotFoundError("Url not found");
    }

    await this.cacheRepository.setUrlMapping(shortUrl, url.originalUrl);
    await this.urlRepository.incrementClicks(shortUrl);

    return { originalUrl: url.originalUrl, shortUrl };
  }

  async getUrlStats(shortUrl: string) {
    logger.info("Fetching Url status", { action: "getUrlStatus", shortUrl });

    const url = await this.urlRepository.findStatsByShortUrl(shortUrl);
    if (!url) {
      logger.warn("Short URL not found in repository", { shortUrl });
      throw new NotFoundError("Url not found");
    }
    return url;
  }
}
