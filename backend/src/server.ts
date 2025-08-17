import app from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`Server is running on port http://localhost:${config.port}`);
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
