import dotenv from "dotenv";
import logger from "./logger.config";

type ServerConfig = {
  PORT: number;
  MONGO_URI: string;
  REDIS_URL: string;
  REDIS_COUNTER_KEY: string;
  BASE_URL: string;
};

function loadEnv() {
  dotenv.config();
  logger.info("Environment variables loaded");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  MONGO_URI: process.env.MONGO_URI as string,
  REDIS_URL: process.env.REDIS_URL as string,
  REDIS_COUNTER_KEY: process.env.REDIS_COUNTER_KEY as string,
  BASE_URL: process.env.BASE_URL as string,
};
