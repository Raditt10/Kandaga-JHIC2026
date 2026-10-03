import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

export async function GET() {
  try {
    const notifs = await prisma.notifications.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mapped = notifs.map((n) => {
      const isCompany = n.type.toLowerCase().includes("company") || n.type.toLowerCase().includes("mitra");
      const isSecurity = n.type.toLowerCase().includes("security") || n.type.toLowerCase().includes("audit");
      const category = isCompany ? "company" : isSecurity ? "system" : "project";

      return {
        id: n.id,
        type: n.type,
        category,
        title: n.title,
        message: n.content,
        timestamp: n.createdAt.toISOString(),
        read: n.isRead,
        priority: isSecurity ? "urgent" : "normal",
        metadata: {},
      };
    });

    return NextResponse.json({
      success: true,
      notifications: mapped,
    });
  } catch (error) {
    console.error("GET /api/admin/notification error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const adminUser = await prisma.users.findFirst({
      where: { role: Role.Admin },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const created = await prisma.notifications.create({
      data: {
        userId: adminUser.id,
        type: body.type || "project_created",
        title: body.title || "Aktivitas Web Baru",
        content: body.message || body.content || "",
        isRead: false,
      },
    });

    const isCompany = created.type.toLowerCase().includes("company") || created.type.toLowerCase().includes("mitra");
    const isSecurity = created.type.toLowerCase().includes("security") || created.type.toLowerCase().includes("audit");
    const category = isCompany ? "company" : isSecurity ? "system" : "project";

    const formattedNotif = {
      id: created.id,
      type: created.type,
      category,
      title: created.title,
      message: created.content,
      timestamp: created.createdAt.toISOString(),
      read: created.isRead,
      priority: isSecurity ? "urgent" : "normal",
      metadata: body.metadata || {},
    };

    // Broadcast Socket.IO
    const io = (global as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to("admin_channel").emit("admin_notification", formattedNotif);
    }

    return NextResponse.json({
      success: true,
      notification: formattedNotif,
    });
  } catch (error) {
    console.error("POST /api/admin/notification error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan notifikasi" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (body.action === "mark_all_read") {
      await prisma.notifications.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      const io = (global as unknown as { io?: SocketIOServer }).io;
      if (io) {
        io.to("admin_channel").emit("admin_notifications_all_read");
      }

      return NextResponse.json({ success: true, message: "Semua notifikasi ditandai dibaca" });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/notification error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui notifikasi" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.notifications.deleteMany({});

    const io = (global as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to("admin_channel").emit("admin_notifications_cleared");
    }

    return NextResponse.json({ success: true, message: "Semua notifikasi dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/notification error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus notifikasi" },
      { status: 500 }
    );
  }
}
