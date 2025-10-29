import dotenv from "dotenv";
import cluster from "cluster";
import connectDB from "./config/db.js";
import { createApp } from "./app.js";
import { setupCluster } from "./utils/clusterManager.js";
import { handleShutdown } from "./utils/shutdownHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
let server;

const startWorker = async () => {
  try {
    await connectDB();
    const app = createApp();
    server = app.listen(PORT, () =>
      console.log(`Worker ${process.pid} listening on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => handleShutdown(server, "SIGINT"));
process.on("SIGTERM", () => handleShutdown(server, "SIGTERM"));

if (cluster.isPrimary) setupCluster();
else startWorker();
