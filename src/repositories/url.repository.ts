import { IUrl, Url } from "../models/url.model";
import logger from "../config/logger.config";

export interface CreateUrl {
  originalUrl: string;
  shortUrl: string;
}

export interface UrlStats {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UrlRepository {
  async create(data: CreateUrl): Promise<IUrl> {
    const url = new Url(data);
    const saved = await url.save();

    logger.info("URL record created", {
      id: saved._id.toString(),
      shortUrl: saved.shortUrl,
    });

    return saved;
  }

  async findByShortUrl(shortUrl: string): Promise<IUrl | null> {
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      logger.warn("URL not found in DB", { shortUrl });
      return null;
    }

    return url;
  }

  async findAll() {
    const urls = await Url.find()
      .select({
        _id: 1,
        originalUrl: 1,
        shortUrl: 1,
        clicks: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 });

    logger.info("Fetched all URLs", { count: urls.length });

    return urls.map((url) => ({
      id: url._id?.toString() || "",
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));
  }

  async incrementClicks(shortUrl: string) {
    await Url.findOneAndUpdate({ shortUrl }, { $inc: { clicks: 1 } });

    logger.info("Clicks incremented", { shortUrl });
  }

  async findStatsByShortUrl(shortUrl: string): Promise<UrlStats | null> {
    const url = await Url.findOne({ shortUrl });

    if (!url) {
      logger.warn("Stats not found for shortUrl", { shortUrl });
      return null;
    }

    logger.info("Stats fetched for shortUrl", { shortUrl });

    return {
      id: url._id?.toString() || "",
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }
}
