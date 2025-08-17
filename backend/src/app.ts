import cors from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { swaggerDocument, swaggerUi } from "./config/swagger";
import { errorHandler } from "./middleware/error.middleware";
import { dashboardRouter } from "./routes/dashboard.routes";
import { jobRouter } from "./routes/job.routes";
import { paymentRouter } from "./routes/payment.routes";
import { serviceRouter } from "./routes/service.routes";
import { supportRouter } from "./routes/support.routes";
import { userRouter } from "./routes/user.routes";

const app: Express = express();

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log("DEBUG: Incoming request", req.method, req.url, req.body);
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/users", userRouter);
app.use("/api/services", serviceRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/support", supportRouter);
app.use("/api/dashboard", dashboardRouter);

// Error handling
app.use(errorHandler as any);

export default app;
