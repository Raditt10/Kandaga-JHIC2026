import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Attach io instance to global object so API routes can broadcast notifications
  (global as unknown as { io?: SocketIOServer }).io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join admin channel for privileged activity alerts
    socket.on("join_admin", () => {
      socket.join("admin_channel");
      console.log(`[Socket.IO] Client ${socket.id} joined admin_channel`);
      socket.emit("admin_joined", {
        status: "ok",
        message: "Terhubung ke kanal notifikasi administrator Kandaga",
        timestamp: new Date().toISOString(),
      });
    });

    // Leave admin channel
    socket.on("leave_admin", () => {
      socket.leave("admin_channel");
      console.log(`[Socket.IO] Client ${socket.id} left admin_channel`);
    });

    // Handle broadcast activity event from client or testing tools
    socket.on("broadcast_activity", (payload) => {
      console.log(`[Socket.IO] Activity broadcasted:`, payload?.title || payload);
      const notification = {
        ...payload,
        id: payload?.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: payload?.timestamp || new Date().toISOString(),
      };
      io.to("admin_channel").emit("admin_notification", notification);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  server.once("error", (err) => {
    console.error("[Server Error]", err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Kandaga server ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO interface running on http://${hostname}:${port}`);
  });
});
