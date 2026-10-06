import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getCache, setCache } from "@/lib/redis";

export async function GET() {
  try {
    const auth = await requireRole(["admin"]);
    if (auth.error) return auth.error;

    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Data administrator tidak ditemukan." }, { status: 404 });
    }

    const cachedProfile = await getCache<Record<string, unknown>>(`cache:user:profile:${user.id}`);
    const cachedAvatar = await getCache<string>(`cache:user:avatar:${user.id}`);

    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        firstName,
        lastName,
        fullName: user.name,
        email: user.email,
        phone: (cachedProfile?.phone as string) || "0812-9988-1313",
        gender: (cachedProfile?.gender as string) || "male",
        adminId: (cachedProfile?.adminId as string) || "ADM-13-BANDUNG",
        division: "Pusat Data & Sistem Informasi Sekolah",
        school: "SMK Negeri 13 Bandung",
        country: "Indonesia",
        address:
          (cachedProfile?.address as string) ||
          "Jl. Soekarno-Hatta No. 584, Sekejati, Buahbatu, Kota Bandung, Jawa Barat 40286",
        bio:
          (cachedProfile?.bio as string) ||
          "Administrator Utama Platform Digital Kandaga SMKN 13 Bandung. Mengelola tata kelola akses sistem, verifikasi kurasi karya, dan audit integrasi digital sekolah.",
        photoUrl: cachedAvatar || (cachedProfile?.photoUrl as string) || "/images/admin.webp",
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/profil] error:", err);
    return NextResponse.json({ error: "Gagal memuat profil admin." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"]);
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, fullName, bio, photoUrl, phone, address, adminId } = body;

    const combinedName = (fullName || `${firstName || ""} ${lastName || ""}`).trim();

    if (combinedName && combinedName.length >= 3) {
      await prisma.users.update({
        where: { id: auth.userId },
        data: { name: combinedName },
      });
    }

    const current = (await getCache<Record<string, unknown>>(`cache:user:profile:${auth.userId}`)) || {};
    const updated = {
      ...current,
      ...(bio !== undefined ? { bio } : {}),
      ...(photoUrl !== undefined ? { photoUrl } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(adminId !== undefined ? { adminId } : {}),
    };
    await setCache(`cache:user:profile:${auth.userId}`, updated, 86400 * 365);

    if (photoUrl) {
      await setCache(`cache:user:avatar:${auth.userId}`, photoUrl, 86400 * 365);
      const io = (globalThis as unknown as { io?: { emit: (event: string, data: unknown) => void } }).io;
      if (io) {
        io.emit("avatar_updated", {
          userId: auth.userId,
          photoUrl,
          timestamp: Date.now(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profil administrator berhasil diperbarui.",
      photoUrl,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/profil] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui profil admin." }, { status: 500 });
  }
}
