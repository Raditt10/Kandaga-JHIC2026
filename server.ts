import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./src/lib/prisma";
import type { AdminNotification, NotificationItemCategory, NotificationType } from "./src/types/notification";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function mapPrismaNotification(n: any): AdminNotification {
  return {
    id: n.id,
    type: (n.type || "project_created") as NotificationType,
    category: (n.category || "project") as NotificationItemCategory,
    title: n.title,
    message: n.content,
    timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    read: Boolean(n.isRead),
    priority: (n.priority || "normal") as any,
    metadata: (n.metadata as any) || {},
  };
}

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

  // Attach io instance to global object so Next.js API routes can broadcast notifications
  (global as unknown as { io?: SocketIOServer }).io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO Server] Client connected: ${socket.id}`);

    // Join admin channel for privileged notification stream
    socket.on("join_admin", async () => {
      socket.join("admin_channel");
      console.log(`[Socket.IO Server] Client ${socket.id} joined admin_channel`);
      try {
        const unreadCount = await prisma.notifications.count({
          where: { isRead: false },
        });
        socket.emit("admin_joined", {
          status: "ok",
          message: "Terhubung ke kanal notifikasi administrator Kandaga",
          unreadCount,
          timestamp: new Date().toISOString(),
        });
      } catch {
        socket.emit("admin_joined", {
          status: "ok",
          message: "Terhubung ke kanal notifikasi administrator Kandaga",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Leave admin channel
    socket.on("leave_admin", () => {
      socket.leave("admin_channel");
      console.log(`[Socket.IO Server] Client ${socket.id} left admin_channel`);
    });

    // Handle broadcast activity event - saves to Prisma and broadcasts to admin_channel
    socket.on("broadcast_activity", async (payload: any, callback?: (res: any) => void) => {
      console.log(`[Socket.IO Server] Activity broadcasted:`, payload?.title || payload);
      try {
        const adminUser = await prisma.users.findFirst({
          where: { role: "Admin" },
        });

        const created = await prisma.notifications.create({
          data: {
            userId: adminUser?.id || "00000000-0000-0000-0000-000000000000",
            type: payload?.type || "project_created",
            title: payload?.title || "Aktivitas Web Baru",
            content: payload?.message || payload?.content || "Aktivitas baru tercatat pada platform Kandaga.",
            isRead: false,
          },
        });
        const mapped = mapPrismaNotification(created);
        io.to("admin_channel").emit("admin_notification", mapped);
        if (typeof callback === "function") {
          callback({ success: true, notification: mapped });
        }
      } catch (error: any) {
        console.error("[Socket.IO Server] Error saving broadcast activity to Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    // Mark single notification as read via socket
    socket.on("mark_read", async (payload: { id: string }, callback?: (res: any) => void) => {
      if (!payload?.id) return;
      try {
        const updated = await prisma.notifications.update({
          where: { id: payload.id },
          data: { isRead: true },
        });
        const mapped = mapPrismaNotification(updated);
        io.to("admin_channel").emit("admin_notification_updated", mapped);
        if (typeof callback === "function") {
          callback({ success: true, notification: mapped });
        }
      } catch (error: any) {
        console.error("[Socket.IO Server] Error marking read in Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    // Mark all notifications as read via socket
    socket.on("mark_all_read", async (callback?: (res: any) => void) => {
      try {
        await prisma.notifications.updateMany({
          where: { isRead: false },
          data: { isRead: true },
        });
        io.to("admin_channel").emit("admin_notifications_all_read");
        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error: any) {
        console.error("[Socket.IO Server] Error marking all read in Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    // Delete single notification via socket
    socket.on("delete_notification", async (payload: { id: string }, callback?: (res: any) => void) => {
      if (!payload?.id) return;
      try {
        await prisma.notifications.delete({
          where: { id: payload.id },
        });
        io.to("admin_channel").emit("admin_notification_deleted", { id: payload.id });
        if (typeof callback === "function") {
          callback({ success: true, id: payload.id });
        }
      } catch (error: any) {
        console.error("[Socket.IO Server] Error deleting notification in Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    // Clear all notifications via socket
    socket.on("clear_all", async (callback?: (res: any) => void) => {
      try {
        await prisma.notifications.deleteMany();
        io.to("admin_channel").emit("admin_notifications_cleared");
        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error: any) {
        console.error("[Socket.IO Server] Error clearing notifications in Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO Server] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  server.once("error", (err) => {
    console.error("[Server Error]", err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Kandaga server ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO central server interface running on http://${hostname}:${port}`);
  });
});
