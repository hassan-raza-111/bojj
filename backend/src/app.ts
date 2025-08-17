import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config';
import { swaggerDocument, swaggerUi } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { jobRouter } from './routes/job.routes';
import { paymentRouter } from './routes/payment.routes';
import { serviceRouter } from './routes/service.routes';
import { supportRouter } from './routes/support.routes';
import { userRouter } from './routes/user.routes';

const app: Express = express();

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log('DEBUG: Incoming request', req.method, req.url, req.body);
  next();
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting - Fixed to be more secure
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (was 100000 - too high!)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/services', serviceRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/support', supportRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling
app.use(errorHandler as any);

export default app;
