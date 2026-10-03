import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { initialAdminNotifications } from "@/lib/initialNotifications";
import type { AdminNotification } from "@/types/notification";

// Global in-memory list for live demo session
const serverNotifications: AdminNotification[] = [...initialAdminNotifications];

export async function GET() {
  return NextResponse.json({
    success: true,
    notifications: serverNotifications,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newNotification: AdminNotification = {
      id: body.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: body.type || "project_created",
      category: body.category || "project",
      title: body.title || "Aktivitas Web Baru",
      message: body.message || "Aktivitas baru tercatat pada platform Kandaga.",
      timestamp: body.timestamp || new Date().toISOString(),
      read: false,
      priority: body.priority || "normal",
      metadata: body.metadata || {},
    };

    // Prepend to server in-memory list
    serverNotifications.unshift(newNotification);
    if (serverNotifications.length > 50) {
      serverNotifications.pop();
    }

    // Broadcast through Socket.IO if custom server is running
    const io = (global as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to("admin_channel").emit("admin_notification", newNotification);
      console.log(`[API /api/admin/notify] Broadcasted via Socket.IO:`, newNotification.title);
    } else {
      console.log(`[API /api/admin/notify] Socket.IO server not active on global object (fallback mode)`);
    }

    return NextResponse.json({
      success: true,
      notification: newNotification,
      socketBroadcasted: Boolean(io),
    });
  } catch (error: any) {
    console.error("POST /api/admin/notify error:", error);
    return NextResponse.json(
      { error: "Gagal memproses siaran notifikasi" },
      { status: 500 }
    );
  }
}
