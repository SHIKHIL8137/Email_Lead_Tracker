import cluster from "cluster";
import os from "os";

export const setupCluster = () => {
  const numCPUs = Math.max(1, Number(process.env.WEB_CONCURRENCY) || os.cpus().length);
  console.log(`Primary ${process.pid} is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} exited (${signal || code}). Spawning a new one...`);
    cluster.fork();
  });
};
