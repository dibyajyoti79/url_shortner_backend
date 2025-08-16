import express from "express";
import { serverConfig } from "./config";
import { connectDB } from "./config/db";
import logger from "./config/logger.config";
import { initRedis } from "./config/redis";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { redirectUrlController } from "./controllers/url.controller";
import { trpcRouter } from "./routers/trpc";

const app = express();

app.use(express.json());

app.use(attachCorrelationIdMiddleware);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: trpcRouter,
  })
);

app.get("/:shortUrl", redirectUrlController);

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop the server.`);

  await initRedis();
  await connectDB();
});
