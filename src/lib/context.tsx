"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io as socketIOClient, Socket } from "socket.io-client";
import type {
  AdminNotification,
  NotificationCategory,
  NotificationItemCategory,
  SocketConnectionStatus,
} from "@/types/notification";
import { playNotificationSound } from "@/lib/notificationSound";

// ─────────────────────────────────────────────
// CENTRAL CLIENT SOCKET INSTANCE & CONTEXT
// ─────────────────────────────────────────────

interface SocketContextType {
  socket: Socket | null;
  connectionStatus: SocketConnectionStatus;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connectionStatus: "disconnected",
  isConnected: false,
});

let sharedClientSocket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!sharedClientSocket) {
    sharedClientSocket = socketIOClient({
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoConnect: true,
    });
  }
  return sharedClientSocket;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>("connecting");

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    setSocket(s);

    const onConnect = () => {
      setConnectionStatus("connected");
    };

    const onDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const onConnectError = () => {
      setConnectionStatus("disconnected");
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    if (s.connected) {
      setConnectionStatus("connected");
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectionStatus,
        isConnected: connectionStatus === "connected",
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  return useContext(SocketContext);
}

// ─────────────────────────────────────────────
// CENTRAL ADMIN NOTIFICATION CONTEXT & HOOKS
// ─────────────────────────────────────────────

export interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  connectionStatus: SocketConnectionStatus;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  activeCategory: NotificationCategory;
  setActiveCategory: (cat: NotificationCategory) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  simulateActivity: (type?: string) => void;
  latestIncoming: AdminNotification | null;
  dismissToast: () => void;
}

export const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(
  undefined
);

const SOUND_SETTING_KEY = "kandaga_admin_notif_sound";

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { socket, connectionStatus } = useSocket();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestIncoming, setLatestIncoming] = useState<AdminNotification | null>(null);

  // Sound preference is a UI setting
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem(SOUND_SETTING_KEY);
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleToggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    try {
      localStorage.setItem(SOUND_SETTING_KEY, String(enabled));
    } catch {
      // Ignored
    }
  }, []);

  // Fetch directly from Prisma via API route - ZERO data in localStorage!
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notification");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("[AdminNotification] Gagal memuat notifikasi:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Wire socket events with the central client socket instance
  useEffect(() => {
    if (!socket) return;

    if (socket.connected) {
      socket.emit("join_admin");
    }

    const handleConnect = () => {
      socket.emit("join_admin");
    };

    const handleNotification = (notif: AdminNotification) => {
      if (!notif?.id) return;
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      if (soundEnabled) {
        playNotificationSound();
      }
      setLatestIncoming(notif);
    };

    const handleUpdated = (updated: AdminNotification) => {
      if (!updated?.id) return;
      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    };

    const handleDeleted = (payload: { id: string }) => {
      if (!payload?.id) return;
      setNotifications((prev) => prev.filter((item) => item.id !== payload.id));
      setLatestIncoming((prev) => (prev?.id === payload.id ? null : prev));
    };

    const handleCleared = () => {
      setNotifications([]);
      setLatestIncoming(null);
    };

    socket.on("connect", handleConnect);
    socket.on("admin_notification", handleNotification);
    socket.on("admin_notification_updated", handleUpdated);
    socket.on("admin_notifications_all_read", handleAllRead);
    socket.on("admin_notification_deleted", handleDeleted);
    socket.on("admin_notifications_cleared", handleCleared);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("admin_notification", handleNotification);
      socket.off("admin_notification_updated", handleUpdated);
      socket.off("admin_notifications_all_read", handleAllRead);
      socket.off("admin_notification_deleted", handleDeleted);
      socket.off("admin_notifications_cleared", handleCleared);
    };
  }, [socket, soundEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      if (socket && socket.connected) {
        socket.emit("mark_read", { id });
      }

      try {
        await fetch(`/api/admin/notification/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    },
    [socket]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (socket && socket.connected) {
      socket.emit("mark_all_read");
    }

    try {
      await fetch("/api/admin/notification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  }, [socket]);

  const deleteNotification = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setLatestIncoming((prev) => (prev?.id === id ? null : prev));

      if (socket && socket.connected) {
        socket.emit("delete_notification", { id });
      }

      try {
        await fetch(`/api/admin/notification/${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("deleteNotification error:", err);
      }
    },
    [socket]
  );

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setLatestIncoming(null);

    if (socket && socket.connected) {
      socket.emit("clear_all");
    }

    try {
      await fetch("/api/admin/notification", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("clearAll error:", err);
    }
  }, [socket]);

  const dismissToast = useCallback(() => {
    setLatestIncoming(null);
  }, []);

  const simulateActivity = useCallback(
    async (customType?: string) => {
      const sample = {
        type: customType || "project_created",
        category: "project" as NotificationItemCategory,
        title: "Karya Siswa Baru Diunggah",
        message: "Ahmad Zaki (XII RPL 1) mengunggah karya baru: 'Smart Greenhouse IoT & AI Crop Analytics'.",
        priority: "normal" as const,
        metadata: {
          studentName: "Ahmad Zaki",
          projectTitle: "Smart Greenhouse IoT",
          badgeText: "RPL",
          url: "/admin/moderasi",
        },
      };

      if (socket && socket.connected) {
        socket.emit("broadcast_activity", sample);
      } else {
        try {
          const res = await fetch("/api/admin/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sample),
          });
          const data = await res.json();
          if (data.success && data.notification) {
            setNotifications((prev) => [data.notification, ...prev]);
            if (soundEnabled) {
              playNotificationSound();
            }
            setLatestIncoming(data.notification);
          }
        } catch (err) {
          console.error("simulateActivity error:", err);
        }
      }
    },
    [socket, soundEnabled]
  );

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        connectionStatus,
        isModalOpen,
        setIsModalOpen,
        activeCategory,
        setActiveCategory,
        soundEnabled,
        setSoundEnabled: handleToggleSound,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        simulateActivity,
        latestIncoming,
        dismissToast,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification(): AdminNotificationContextType {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error("useAdminNotification must be used within AdminNotificationProvider");
  }
  return ctx;
}
