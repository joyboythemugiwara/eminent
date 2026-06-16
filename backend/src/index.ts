import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";
import setupDatabase from "./db/schema";
import publicRouter from "./routes/public";
import authRouter from "./routes/admin/auth";
import contentRouter from "./routes/admin/content";

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = "/api/v1";

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts, please try again in an hour." },
});

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiting
app.use(`${API_PREFIX}`, globalLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use(`${API_PREFIX}`, publicRouter);
app.use(`${API_PREFIX}/admin/auth`, authLimiter, authRouter);
app.use(`${API_PREFIX}/admin`, contentRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  });
});

// Initialize database and start server
export const startServer = async () => {
  try {
    await setupDatabase();
    console.log("✓ Database initialized");

    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}${API_PREFIX}`);
    });
    
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    if (import.meta.main) {
      process.exit(1);
    }
    throw error;
  }
};

if (import.meta.main) {
  startServer();
}

export default app;
