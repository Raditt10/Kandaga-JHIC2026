"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel("kandaga_realtime_channel");
  } catch {
    // BroadcastChannel not supported in environment
  }
}

/**
 * Mendapatkan instance Socket.IO client secara singleton.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socketInstance) {
    try {
      socketInstance = io({
        path: "/api/socket/io",
        transports: ["polling", "websocket"],
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      socketInstance.on("connect", () => {
        console.log("[Socket.IO] Terhubung ke server realtime. Socket ID:", socketInstance?.id);
      });

      socketInstance.on("connect_error", (err) => {
        // Log info untuk debugging koneksi socket
        console.debug("[Socket.IO] Status koneksi:", err.message);
      });
    } catch (err) {
      console.warn("[Socket.IO] Gagal inisialisasi socket client:", err);
    }
  }

  return socketInstance;
}

export interface AvatarUpdatePayload {
  userId?: string;
  photoUrl: string;
  timestamp?: number;
}

/**
 * Memancarkan event pembaruan foto profil ke Socket.IO server dan kanal lokal.
 */
export function emitAvatarUpdate(payload: AvatarUpdatePayload) {
  const data: AvatarUpdatePayload = {
    ...payload,
    timestamp: payload.timestamp || Date.now(),
  };

  // 1. Emit via Socket.IO ke server agar dibroadcast ke seluruh client
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("update_avatar", data);
  } else if (socket) {
    // Jika belum terhubung, kirim saat terhubung
    socket.once("connect", () => {
      socket.emit("update_avatar", data);
    });
  }

  // 2. Broadcast ke tab lain via BroadcastChannel
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: "avatar_updated", ...data });
  }

  // 3. Dispatch CustomEvent di window saat ini untuk respons instan
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kandaga:avatar_updated", { detail: data })
    );

    // 4. Update localStorage untuk sinkronisasi cadangan
    try {
      localStorage.setItem("kandaga_avatar_sync", JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

/**
 * Berlangganan event pembaruan foto profil (Socket.IO + local fallback).
 * Mengembalikan fungsi pembersih (unmount cleanup).
 */
export function onAvatarUpdate(
  callback: (payload: AvatarUpdatePayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  // Handler untuk event custom lokal
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<AvatarUpdatePayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  // Handler untuk BroadcastChannel antar-tab
  const handleBroadcast = (e: MessageEvent) => {
    if (e.data && e.data.type === "avatar_updated") {
      callback(e.data);
    }
  };

  // Handler untuk storage event cadangan
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "kandaga_avatar_sync" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener("kandaga:avatar_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBroadcast);
  }

  // Handler Socket.IO
  const socket = getSocket();
  if (socket) {
    socket.on("avatar_updated", callback);
  }

  return () => {
    window.removeEventListener("kandaga:avatar_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBroadcast);
    }
    if (socket) {
      socket.off("avatar_updated", callback);
    }
  };
}
