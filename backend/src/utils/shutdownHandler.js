export const handleShutdown = (server, signal) => {
  console.log(`\n${signal} received. Closing server...`);
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
