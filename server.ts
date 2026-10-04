import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./src/lib/prisma";
import type { Notifications } from "@prisma/client";
import type { AdminNotification, NotificationType } from "./src/types/notification";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface BroadcastActivityPayload {
  type?: NotificationType;
  title?: string;
  message?: string;
  content?: string;
  [key: string]: unknown;
}

type SocketCallback<T = Record<string, unknown>> = (
  res: { success: boolean; error?: string } & T
) => void;

function mapPrismaNotification(n: Notifications): AdminNotification {
  return {
    id: n.id,
    type: (n.type || "project_created") as NotificationType,
    category: "project",
    title: n.title,
    message: n.content,
    timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    read: Boolean(n.isRead),
    priority: "normal",
    metadata: {},
  };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// In-memory & Redis cache for Admin User ID to avoid repetitive DB roundtrips on broadcast events
let cachedAdminUserId: string | null = null;
async function getAdminUserId(): Promise<string | null> {
  if (cachedAdminUserId) return cachedAdminUserId;
  try {
    const { getCache, setCache } = await import("./src/lib/redis");
    const fromRedis = await getCache<string>("system:admin_user_id");
    if (fromRedis) {
      cachedAdminUserId = fromRedis;
      return cachedAdminUserId;
    }

    const adminUser = await prisma.users.findFirst({
      where: { role: "Admin" },
      select: { id: true },
    });
    if (adminUser?.id) {
      cachedAdminUserId = adminUser.id;
      await setCache("system:admin_user_id", adminUser.id, 86400);
      return cachedAdminUserId;
    }
  } catch (err) {
    console.error("[Socket.IO Server] Error resolving admin user ID:", err);
  }
  return null;
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
    socket.on(
      "broadcast_activity",
      async (
        payload: BroadcastActivityPayload,
        callback?: SocketCallback<{ notification?: AdminNotification }>
      ) => {
        console.log(`[Socket.IO Server] Activity broadcasted:`, payload?.title || payload);
        try {
          const adminUserId = await getAdminUserId();
          if (!adminUserId) {
            console.warn("[Socket.IO Server] No admin user found in database to assign notification");
            if (typeof callback === "function") {
              callback({ success: false, error: "Admin user not found" });
            }
            return;
          }

          const created = await prisma.notifications.create({
            data: {
              userId: adminUserId,
              type: payload?.type || "project_created",
              title: payload?.title || "Aktivitas Web Baru",
              content:
                payload?.message ||
                payload?.content ||
                "Aktivitas baru tercatat pada platform Kandaga.",
              isRead: false,
            },
          });
          const mapped = mapPrismaNotification(created);
          io.to("admin_channel").emit("admin_notification", mapped);
          if (typeof callback === "function") {
            callback({ success: true, notification: mapped });
          }
        } catch (error: unknown) {
          console.error("[Socket.IO Server] Error saving broadcast activity to Prisma:", error);
          if (typeof callback === "function") {
            callback({ success: false, error: "Database error" });
          }
        }
      }
    );

    // Mark single notification as read via socket
    socket.on(
      "mark_read",
      async (
        payload: { id: string },
        callback?: SocketCallback<{ notification?: AdminNotification }>
      ) => {
        if (!payload?.id || !UUID_REGEX.test(payload.id)) {
          if (typeof callback === "function") {
            callback({ success: false, error: "Invalid notification ID" });
          }
          return;
        }
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
        } catch (error: unknown) {
          console.error("[Socket.IO Server] Error marking read in Prisma:", error);
          if (typeof callback === "function") {
            callback({ success: false, error: "Database error" });
          }
        }
      }
    );

    // Mark all notifications as read via socket
    socket.on("mark_all_read", async (callback?: SocketCallback) => {
      try {
        await prisma.notifications.updateMany({
          where: { isRead: false },
          data: { isRead: true },
        });
        io.to("admin_channel").emit("admin_notifications_all_read");
        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error: unknown) {
        console.error("[Socket.IO Server] Error marking all read in Prisma:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: "Database error" });
        }
      }
    });

    // Delete single notification via socket
    socket.on(
      "delete_notification",
      async (
        payload: { id: string },
        callback?: SocketCallback<{ id?: string }>
      ) => {
        if (!payload?.id || !UUID_REGEX.test(payload.id)) {
          if (typeof callback === "function") {
            callback({ success: false, error: "Invalid notification ID" });
          }
          return;
        }
        try {
          await prisma.notifications.delete({
            where: { id: payload.id },
          });
          io.to("admin_channel").emit("admin_notification_deleted", { id: payload.id });
          if (typeof callback === "function") {
            callback({ success: true, id: payload.id });
          }
        } catch (error: unknown) {
          console.error("[Socket.IO Server] Error deleting notification in Prisma:", error);
          if (typeof callback === "function") {
            callback({ success: false, error: "Database error" });
          }
        }
      }
    );

    // Clear all notifications via socket
    socket.on("clear_all", async (callback?: SocketCallback) => {
      try {
        await prisma.notifications.deleteMany();
        io.to("admin_channel").emit("admin_notifications_cleared");
        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error: unknown) {
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
    getAdminUserId().catch(() => {});
  });
});
