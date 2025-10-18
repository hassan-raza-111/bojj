import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './routes/auth.routes';
import adminRouter from './routes/admin.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { jobRouter } from './routes/job.routes';
import vendorRouter from './routes/vendor.routes';
import chatRouter from './routes/chat.routes';
import notificationRouter from './routes/notification.routes';
// Temporarily commented out due to TypeScript compilation issues
// import { paymentRouter } from './routes/payment.routes';
// import { serviceRouter } from './routes/service.routes';
import { supportRouter } from './routes/support.routes';
import dataRouter from './routes/data.routes';
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

// Additional CORS middleware for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

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

// Handle OPTIONS requests for uploads (preflight requests)
app.options('/uploads/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Serve static files with proper CORS configuration
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
      // Set comprehensive CORS headers for all static files
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');

      // Set proper cache headers
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache for images
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Test endpoint for image serving
app.get('/test-image', (req, res) => {
  res.json({
    message: 'Image serving test',
    uploadsPath: path.join(__dirname, '../uploads'),
    profilesPath: path.join(__dirname, '../uploads/profiles'),
    files: require('fs').readdirSync(
      path.join(__dirname, '../uploads/profiles')
    ),
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/jobs', jobRouter); // Customer side needs this
app.use('/api/dashboard', dashboardRouter); // Customer side needs this
app.use('/api/vendor', vendorRouter); // Vendor dashboard routes (includes public profile)
app.use('/api/chat', chatRouter); // Chat routes
app.use('/api/notifications', notificationRouter); // Notification routes
app.use('/api/data', dataRouter); // Data routes (cities, service types)
// Temporarily commented out due to TypeScript compilation issues
// app.use('/api/users', userRouter);
// app.use('/api/services', serviceRouter);
// app.use('/api/payments', paymentRouter);
app.use('/api/support', supportRouter);

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
