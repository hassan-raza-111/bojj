import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config';
import { swaggerDocument, swaggerUi } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import adminRouter from './routes/admin.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { jobRouter } from './routes/job.routes';
import vendorRouter from './routes/vendor.routes';
import { VendorController } from './controllers/vendor.controller';
import chatRouter from './routes/chat.routes';
import { vendorPayoutRouter } from './routes/vendor-payout.routes';
// Temporarily commented out due to TypeScript compilation issues
// import { paymentRouter } from './routes/payment.routes';
// import { serviceRouter } from './routes/service.routes';
// import { supportRouter } from './routes/support.routes';
// import { userRouter } from './routes/user.routes';

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
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting - Fixed to be more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs
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
app.use('/api/admin', adminRouter);
app.use('/api/jobs', jobRouter); // Customer side needs this
app.use('/api/dashboard', dashboardRouter); // Customer side needs this
app.use('/api/vendor', vendorRouter); // Vendor dashboard routes
app.get('/api/vendor/public/:vendorId', (req, res) =>
  VendorController.getPublicProfile(req, res)
); // Public vendor profile
app.use('/api/chat', chatRouter); // Chat routes
app.use('/api/vendor-payouts', vendorPayoutRouter); // Vendor payout routes
// Temporarily commented out due to TypeScript compilation issues
// app.use('/api/users', userRouter);
// app.use('/api/services', serviceRouter);
// app.use('/api/payments', paymentRouter);
// app.use('/api/support', supportRouter);

// 404 handler for undefined routes
app.use('/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling
app.use(errorHandler as any);

export default app;
