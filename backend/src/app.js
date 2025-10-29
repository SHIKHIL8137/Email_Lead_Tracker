import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { applySecurityMiddlewares } from "./middlewares/securityMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import mountEmailRoutes from "./routes/emailRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import compression from "compression";

export const createApp = () => {
  const app = express();

  // Security + CORS
  applySecurityMiddlewares(app);

  // Utilities
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));


  // Routes
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
