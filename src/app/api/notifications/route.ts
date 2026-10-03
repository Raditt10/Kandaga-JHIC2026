/**
 * /api/notifications — pusat notifikasi semua role.
 *
 * Tabel `notifications` sebelumnya tidak pernah diisi oleh kode mana pun,
 * padahal UI sudah menjanjikan notifikasi (lihat /mitra/daftar dan /student).
 * Sekarang notifikasi ditulis lewat `notify()` di src/lib/activity.ts —
 * misalnya saat guru menyetujui karya atau BKK memutuskan permintaan kontak.
 *
 * GET   → daftar notifikasi terbaru + jumlah yang belum dibaca
 * PATCH → tandai satu notifikasi (body.id) atau semua (body.all) sebagai dibaca
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

const ALL_ROLES = ["student", "teacher", "company", "bkk", "admin"];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(ALL_ROLES);
    if (auth.error) return auth.error;

    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "10");
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.trunc(limitParam), 1), 50)
      : 10;

    const [items, unread] = await Promise.all([
      prisma.notifications.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notifications.count({ where: { userId: auth.userId, isRead: false } }),
    ]);

    return NextResponse.json(
      {
        unread,
        items: items.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          content: n.content,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(ALL_ROLES);
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));

    if (body.all === true) {
      await prisma.notifications.updateMany({
        where: { userId: auth.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { error: "Sertakan id notifikasi, atau all: true untuk menandai semua." },
        { status: 400 }
      );
    }

    // updateMany dengan userId sebagai filter: notifikasi milik orang lain
    // tidak bisa ditandai dari akun ini.
    const result = await prisma.notifications.updateMany({
      where: { id, userId: auth.userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi." }, { status: 500 });
  }
}
