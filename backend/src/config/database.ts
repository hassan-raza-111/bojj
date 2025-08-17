import { config } from "./index";
import { logger } from "../utils/logger";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient({
  log: config.env === "development" ? ["query", "error", "warn"] : ["error"],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("Successfully connected to database");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info("Successfully disconnected from database");
  } catch (error) {
    logger.error("Failed to disconnect from database:", error);
    throw error;
  }
};

export { prisma };
