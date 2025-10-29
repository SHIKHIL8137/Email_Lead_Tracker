import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cors from "cors";

export const applySecurityMiddlewares = (app) => {

  app.set("trust proxy", true);


  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );


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

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.options("*", cors());
};
