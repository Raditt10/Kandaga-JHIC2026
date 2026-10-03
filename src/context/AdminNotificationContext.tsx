"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io as socketIOClient, Socket } from "socket.io-client";
import type {
  AdminNotification,
  NotificationCategory,
  SocketConnectionStatus,
} from "@/types/notification";
import { initialAdminNotifications } from "@/lib/initialNotifications";
import { playNotificationSound } from "@/lib/notificationSound";

interface AdminNotificationContextType {
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

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "kandaga_admin_notifications_v1";
const SOUND_SETTING_KEY = "kandaga_admin_notif_sound";

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialAdminNotifications);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>("connecting");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestIncoming, setLatestIncoming] = useState<AdminNotification | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Load persisted notifications and settings on mount
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem(SOUND_SETTING_KEY);
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }

      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
        }
      }
    } catch {
      // LocalStorage access may fail in restricted iframes
    }
  }, []);

  // Save notifications to localStorage on changes
  const saveNotifications = useCallback((updated: AdminNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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

  // Socket.IO Client Connection Setup
  useEffect(() => {
    let socket: Socket | null = null;

    try {
      socket = socketIOClient({
        transports: ["websocket", "polling"],
        reconnectionAttempts: 8,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      setSocketInstance(socket);

      socket.on("connect", () => {
        console.log("[Socket.IO Client] Connected to server successfully! id:", socket?.id);
        setConnectionStatus("connected");
        // Join admin channel
        socket?.emit("join_admin");
      });

      socket.on("admin_joined", (res) => {
        console.log("[Socket.IO Client] Admin channel joined:", res);
      });

      socket.on("admin_notification", (notif: AdminNotification) => {
        console.log("[Socket.IO Client] Received admin_notification:", notif);
        if (!notif || !notif.id) return;

        setNotifications((prev) => {
          // Avoid duplicate by ID
          if (prev.some((item) => item.id === notif.id)) return prev;
          const nextList = [notif, ...prev];
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
          } catch {
            // Ignored
          }
          return nextList;
        });

        // Trigger sound if enabled
        if (soundEnabled) {
          playNotificationSound();
        }

        // Show floating toast
        setLatestIncoming(notif);
      });

      socket.on("connect_error", (err) => {
        console.warn("[Socket.IO Client] Connection error (server may run on standard next dev):", err.message);
        setConnectionStatus("disconnected");
      });

      socket.on("disconnect", (reason) => {
        console.log("[Socket.IO Client] Disconnected:", reason);
        setConnectionStatus("disconnected");
      });
    } catch (err) {
      console.warn("[Socket.IO Client] Socket initialization error:", err);
      setConnectionStatus("disconnected");
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [soundEnabled]);

  // Derived unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(
    (id: string) => {
      const updated = notifications.filter((n) => n.id !== id);
      saveNotifications(updated);
      if (latestIncoming?.id === id) {
        setLatestIncoming(null);
      }
    },
    [notifications, latestIncoming, saveNotifications]
  );

  const clearAll = useCallback(() => {
    saveNotifications([]);
    setLatestIncoming(null);
  }, [saveNotifications]);

  const dismissToast = useCallback(() => {
    setLatestIncoming(null);
  }, []);

  // Simulate activity on the web for live demonstration and testing
  const simulateActivity = useCallback(
    (customType?: string) => {
      const samples: AdminNotification[] = [
        {
          id: `sim-${Date.now()}-1`,
          type: "project_created",
          category: "project",
          title: "Karya Siswa Baru Diunggah",
          message: "Ahmad Zaki (XII RPL 1) mengunggah karya baru: 'Smart Greenhouse IoT & AI Crop Analytics'.",
          timestamp: new Date().toISOString(),
          read: false,
          priority: "normal",
          metadata: {
            studentName: "Ahmad Zaki",
            projectTitle: "Smart Greenhouse IoT",
            badgeText: "RPL",
            url: "/admin/moderasi",
          },
        },
        {
          id: `sim-${Date.now()}-2`,
          type: "company_registered",
          category: "mitra",
          title: "Mitra Industri Baru Mendaftar",
          message: "PT GoTo Gojek Tokopedia mengajukan kemitraan magang PKL ke BKK SMKN 13.",
          timestamp: new Date().toISOString(),
          read: false,
          priority: "urgent",
          metadata: {
            companyName: "PT GoTo Gojek Tokopedia",
            badgeText: "BKK",
            url: "/admin/bkk",
          },
        },
        {
          id: `sim-${Date.now()}-3`,
          type: "curation_review",
          category: "curation",
          title: "Catatan Kurasi Guru Masuk",
          message: "Ibu Nurul Hidayah, S.T. meloloskan kurasi karya 'Aplikasi Presensi GPS Siswa' ke Galeri Publik.",
          timestamp: new Date().toISOString(),
          read: false,
          priority: "success",
          metadata: {
            actor: "Nurul Hidayah, S.T.",
            projectTitle: "Aplikasi Presensi GPS Siswa",
            badgeText: "TKJ",
            url: "/admin/moderasi",
          },
        },
        {
          id: `sim-${Date.now()}-4`,
          type: "security_alert",
          category: "security",
          title: "Peringatan Audit Keamanan",
          message: "Pemberian hak akses guru kurator baru disahkan oleh Administrator Utama.",
          timestamp: new Date().toISOString(),
          read: false,
          priority: "normal",
          metadata: {
            actor: "Superadmin",
            badgeText: "Security",
            url: "/admin/audit-log",
          },
        },
      ];

      const sample = samples[Math.floor(Math.random() * samples.length)];

      if (socketInstance && socketInstance.connected) {
        // Emit via live Socket.IO connection
        socketInstance.emit("broadcast_activity", sample);
      } else {
        // Fallback: local dispatch + API broadcast
        fetch("/api/admin/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sample),
        }).catch(() => {
          // Ignored
        });

        setNotifications((prev) => {
          const next = [sample, ...prev];
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
          } catch {
            // Ignored
          }
          return next;
        });

        if (soundEnabled) {
          playNotificationSound();
        }
        setLatestIncoming(sample);
      }
    },
    [socketInstance, soundEnabled]
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
