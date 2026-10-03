import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Server as SocketIOServer } from "socket.io";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const updated = await prisma.notifications.update({
      where: { id },
      data: { isRead: true },
    });

    const isCompany = updated.type.toLowerCase().includes("company") || updated.type.toLowerCase().includes("mitra");
    const isSecurity = updated.type.toLowerCase().includes("security") || updated.type.toLowerCase().includes("audit");
    const category = isCompany ? "company" : isSecurity ? "system" : "project";

    const formatted = {
      id: updated.id,
      type: updated.type,
      category,
      title: updated.title,
      message: updated.content,
      timestamp: updated.createdAt.toISOString(),
      read: updated.isRead,
      priority: isSecurity ? "urgent" : "normal",
      metadata: {},
    };

    const io = (global as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to("admin_channel").emit("admin_notification_updated", formatted);
    }

    return NextResponse.json({ success: true, notification: formatted });
  } catch (error) {
    console.error("PATCH /api/admin/notification/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui notifikasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.notifications.delete({
      where: { id },
    });

    const io = (global as unknown as { io?: SocketIOServer }).io;
    if (io) {
      io.to("admin_channel").emit("admin_notification_deleted", { id });
    }

    return NextResponse.json({ success: true, message: "Notifikasi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/notification/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus notifikasi" },
      { status: 500 }
    );
  }
}
