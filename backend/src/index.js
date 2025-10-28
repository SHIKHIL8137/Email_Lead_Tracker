import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import mountEmailRoutes from "./routes/emailRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import cluster from "cluster";
import os from "os";

dotenv.config();

const createApp = () => {
  const app = express();


  app.set("trust proxy", true);


  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));


  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);


  app.use(hpp());


  app.use(mongoSanitize());

  app.use(xss());

  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));


  app.get("/healthz", (req, res) => res.status(200).send("ok"));


  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  mountEmailRoutes(app);
  app.use("/api/stats", statsRoutes);

  app.get("/", (req, res) => {
    res.send({ status: "ok", message: "Lead Tracker API" });
  });

  return app;
};

const PORT = process.env.PORT || 5000;
let server;

const startWorker = async () => {
  try {
    await connectDB();
    const app = createApp();
    server = app.listen(PORT, () => console.log(`Worker ${process.pid} listening on ${PORT}`));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received: closing server (pid ${process.pid})...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      import("mongoose").then(({ default: mongoose }) => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

if (cluster.isPrimary) {
  const numCPUs = Math.max(1, Number(process.env.WEB_CONCURRENCY) || os.cpus().length);
  console.log(`Primary ${process.pid} is running. Forking ${numCPUs} workers...`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} exited (${signal || code}). Spawning a new one...`);
    cluster.fork();
  });
} else {
  startWorker();
}
