import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getCache, setCache } from "@/lib/redis";

export async function GET() {
  try {
    const auth = await requireRole(["bkk", "admin"]);
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
      return NextResponse.json({ error: "Data koordinator BKK tidak ditemukan." }, { status: 404 });
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
        phone: (cachedProfile?.phone as string) || "0813-8899-7766",
        gender: (cachedProfile?.gender as string) || "female",
        nip: (cachedProfile?.nip as string) || "198503152010012008",
        unitName: "Bursa Kerja Khusus & Kemitraan Industri",
        school: "SMK Negeri 13 Bandung",
        country: "Indonesia",
        address:
          (cachedProfile?.address as string) ||
          "Jl. Soekarno-Hatta No. 584, Sekejati, Buahbatu, Kota Bandung, Jawa Barat 40286",
        bio:
          (cachedProfile?.bio as string) ||
          "Koordinator Bursa Kerja Khusus (BKK) SMKN 13 Bandung. Memfasilitasi hubungan kemitraan industri, verifikasi akun perusahaan, dan penyaluran kerja serta magang siswa.",
        photoUrl: (() => {
          const raw = cachedAvatar || (cachedProfile?.photoUrl as string);
          return raw && !raw.includes("/images/bkk.webp") && !raw.startsWith("/images/") ? raw : null;
        })(),
      },
    });
  } catch (err) {
    console.error("[GET /api/bkk/profil] error:", err);
    return NextResponse.json({ error: "Gagal memuat profil BKK." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["bkk", "admin"]);
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, fullName, bio, photoUrl, phone, address, nip } = body;

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
      ...(nip !== undefined ? { nip } : {}),
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
      message: "Profil BKK berhasil diperbarui.",
      photoUrl,
    });
  } catch (err) {
    console.error("[PATCH /api/bkk/profil] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui profil BKK." }, { status: 500 });
  }
}
