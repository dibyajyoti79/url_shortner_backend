import { z } from "zod";
import { publicProcedure } from "../routers/trpc/context";
import { UrlService } from "../services/url.service";
import logger from "../config/logger.config";
import { UrlRepository } from "../repositories/url.repository";
import { CacheRepository } from "../repositories/cache.repository";
import { Request, Response } from "express";

const urlService = new UrlService(new UrlRepository(), new CacheRepository());

export const urlController = {
  create: publicProcedure
    .input(
      z.object({
        originalUrl: z.string().url("Invalid url"),
      })
    )
    .mutation(async ({ input }) => {
      logger.info("CreateShortUrl request received", {
        action: "createShortUrl",
        originalUrl: input.originalUrl,
      });

      const result = await urlService.createShortUrl(input.originalUrl);
      return result;
    }),

  getUrlStats: publicProcedure
    .input(
      z.object({
        shortUrl: z.string().min(1, "Short url is required"),
      })
    )
    .query(async ({ input }) => {
      logger.info("GetUrlStats request received", {
        action: "getUrlStats",
        shortUrl: input.shortUrl,
      });
      const result = await urlService.getUrlStats(input.shortUrl);
      return result;
    }),
};

export const redirectUrlController = async (req: Request, res: Response) => {
  const { shortUrl } = req.params;

  logger.info("Redirect request received", {
    action: "redirectUrl",
    shortUrl,
  });

  const url = await urlService.getOrignalUrl(shortUrl);

  logger.info("Redirecting to original URL", {
    action: "redirectUrl",
    shortUrl,
    originalUrl: url.originalUrl,
  });

  return res.redirect(url.originalUrl);
};
