// server.js — Custom Production Server for Next.js (Webuzo & PM2 compatible)
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Set environment to production by default jika dijalankan lewat server.js
const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 	56110;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.once("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Kandaga server is running on http://${hostname}:${port}`);
    console.log(`> Environment: ${dev ? "development" : "production"}`);
  });

  // Graceful shutdown untuk PM2 reload/restart
  const gracefulShutdown = () => {
    console.log("> Closing server gracefully...");
    server.close(() => {
      console.log("> Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}).catch((err) => {
  console.error("Failed to start Next.js application:", err);
  process.exit(1);
});
