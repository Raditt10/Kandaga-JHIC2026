// server.js — Custom Production Server for Next.js (Webuzo & PM2 compatible) with Socket.IO
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");

// Set environment to production by default jika dijalankan lewat server.js
const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 30000;

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

  // Pasang Socket.IO pada server HTTP
  const io = new SocketIOServer(server, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
  });

  // Ekspos io secara global agar route handler Next.js dapat memancarkan event
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client terhubung: ${socket.id}`);

    // Klien bergabung ke room pengguna khusus
    socket.on("join_user", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Client ${socket.id} bergabung ke room: user:${userId}`);
      }
    });

    // Event pembaruan foto profil secara real-time
    socket.on("update_avatar", (payload) => {
      console.log(`[Socket.IO] update_avatar diterima:`, payload);
      // Broadcast ke seluruh klien yang terhubung
      io.emit("avatar_updated", payload);
      if (payload?.userId) {
        io.to(`user:${payload.userId}`).emit("avatar_updated", payload);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Client terputus: ${socket.id} (${reason})`);
    });
  });

  server.once("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Kandaga server is running on http://${hostname}:${port}`);
    console.log(`> Environment: ${dev ? "development" : "production"}`);
    console.log(`> Socket.IO realtime server aktif di path /api/socket/io`);
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
