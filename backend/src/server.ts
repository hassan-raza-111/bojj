import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDB } from './config/database';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { authenticateSocket } from './middleware/auth.middleware';

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket connection handling
io.on('connection', (socket) => {
  const userId = socket.data.user?.id;

  if (userId) {
    // Join user's personal room
    socket.join(`user_${userId}`);

    console.log(`User ${userId} connected to socket`);

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket`);
    });
  }
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port http://localhost:${config.port}`);
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
