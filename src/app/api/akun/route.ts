/**
 * /api/akun — pengaturan akun milik pengguna yang sedang login.
 *
 * Dipakai halaman/tab "Pengaturan" di dashboard Siswa, Guru, Perusahaan, dan
 * BKK. Sebelumnya hanya dashboard admin yang punya halaman pengaturan, dan
 * isinya pun konfigurasi platform dengan state lokal (tanpa API).
 *
 * GET   → data akun + ringkasan profil sesuai peran
 * PATCH → ubah nama tampilan, atau ubah kata sandi (wajib kata sandi lama)
 *
 * Catatan: kolom `username` di database menyimpan nama akun DAN dipakai
 * sebagai salah satu cara login, jadi mengganti nama berarti mengganti
 * username login. Hal ini ditampilkan sebagai peringatan di UI.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { audit } from "@/lib/activity";

const ALL_ROLES = ["student", "teacher", "company", "bkk", "admin"];
const MIN_NAMA = 3;
const MAX_NAMA = 60;
const MIN_PASSWORD = 8;

export async function GET() {
  try {
    const auth = await requireRole(ALL_ROLES);
    if (auth.error) return auth.error;

    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      // `select` eksplisit: passwordHash tidak perlu terbaca di jalur BACA ini.
      // Hanya handler PATCH (ganti kata sandi, baris ~142) yang membutuhkannya
      // untuk memverifikasi kata sandi lama.
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        studentProfile: {
          select: { nis: true, class: true, major: { select: { name: true } }, photoUrl: true },
        },
        teacherProfile: {
          select: { nip: true, major: { select: { name: true } } },
        },
        companyProfile: {
          select: { name: true, field: true, verificationStatus: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    // Ringkasan profil sesuai peran — ditampilkan sebagai daftar data akun.
    const detail: { label: string; value: string }[] = [];
    if (auth.role === "student" && user.studentProfile) {
      detail.push(
        { label: "NIS", value: user.studentProfile.nis ?? "—" },
        { label: "Kelas", value: user.studentProfile.class ?? "—" },
        { label: "Jurusan", value: user.studentProfile.major?.name ?? "—" }
      );
    } else if (auth.role === "teacher" && user.teacherProfile) {
      detail.push(
        { label: "NIP", value: user.teacherProfile.nip ?? "—" },
        { label: "Jurusan", value: user.teacherProfile.major?.name ?? "—" }
      );
    } else if (auth.role === "company" && user.companyProfile) {
      detail.push(
        { label: "Nama Perusahaan", value: user.companyProfile.name ?? "—" },
        { label: "Bidang", value: user.companyProfile.field ?? "—" },
        {
          label: "Status Verifikasi",
          value: user.companyProfile.verificationStatus ?? "pending",
        }
      );
    }

    let googleEmail: string | null = null;
    try {
      const userRows = await prisma.$queryRaw<Array<{ google_email: string | null }>>`
        SELECT google_email FROM users WHERE id = ${auth.userId}::uuid LIMIT 1
      `;
      googleEmail = userRows[0]?.google_email ?? null;
    } catch {
      // Kolom google_email mungkin belum ada di database produksi
      googleEmail = null;
    }

    const { getCache } = await import("@/lib/redis");
    const cachedAvatar = await getCache<string>(`cache:user:avatar:${user.id}`);
    const rawPhoto = user.studentProfile?.photoUrl || cachedAvatar || null;
    const { isCustomAvatar } = await import("@/lib/avatar");
    const photoUrl = isCustomAvatar(rawPhoto) ? rawPhoto : null;

    return NextResponse.json(
      {
        akun: {
          id: user.id,
          nama: user.name,
          email: user.email,
          googleEmail,
          photoUrl,
          role: auth.role,
          status: user.status,
          bergabung: user.createdAt ? user.createdAt.toISOString() : null,
        },
        detail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/akun:", error);
    return NextResponse.json({ error: "Gagal memuat data akun." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(ALL_ROLES);
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));

    const nama = typeof body.nama === "string" ? body.nama.trim() : undefined;
    const passwordLama =
      typeof body.passwordLama === "string" ? body.passwordLama : undefined;
    const passwordBaru =
      typeof body.passwordBaru === "string" ? body.passwordBaru : undefined;
    const googleEmailInput =
      typeof body.googleEmail === "string" ? body.googleEmail.trim() : undefined;
    const unlinkGoogle = body.unlinkGoogle === true;

    if (
      nama === undefined &&
      passwordBaru === undefined &&
      googleEmailInput === undefined &&
      !unlinkGoogle
    ) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    // ── Handle Tautan Akun Google ───────────────────────────────────────────
    if (unlinkGoogle) {
      try {
        await prisma.$executeRaw`
          UPDATE users SET google_email = NULL WHERE id = ${auth.userId}::uuid
        `;
        await audit({
          userId: auth.userId,
          action: "akun.putus_google",
          entity: "users",
          entityId: auth.userId,
          data: {},
        });
        return NextResponse.json(
          {
            success: true,
            pesan: "Tautan akun Google berhasil diputuskan.",
            googleEmail: null,
          },
          { status: 200 }
        );
      } catch (unlinkErr) {
        console.error("unlinkGoogle error:", unlinkErr);
        return NextResponse.json(
          { error: "Fitur tautan akun Google belum siap di database server." },
          { status: 500 }
        );
      }
    }

    if (googleEmailInput !== undefined) {
      const targetGoogleEmail = googleEmailInput.toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetGoogleEmail)) {
        return NextResponse.json(
          { error: "Format alamat akun Google / Gmail tidak valid." },
          { status: 400 }
        );
      }

      try {
        // Pastikan email ini belum dipakai oleh akun lain di sistem
        const conflicting = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM users
          WHERE (email = ${targetGoogleEmail}::citext OR google_email = ${targetGoogleEmail})
            AND id != ${auth.userId}::uuid
          LIMIT 1
        `;
        if (conflicting.length > 0) {
          return NextResponse.json(
            { error: "Alamat akun Google ini sudah tertaut dengan pengguna lain." },
            { status: 409 }
          );
        }

        await prisma.$executeRaw`
          UPDATE users SET google_email = ${targetGoogleEmail} WHERE id = ${auth.userId}::uuid
        `;

        await audit({
          userId: auth.userId,
          action: "akun.tautkan_google",
          entity: "users",
          entityId: auth.userId,
          data: { googleEmail: targetGoogleEmail },
        });

        return NextResponse.json(
          {
            success: true,
            pesan: "Akun Google berhasil ditautkan! Anda kini dapat masuk menggunakan akun Google ini.",
            googleEmail: targetGoogleEmail,
          },
          { status: 200 }
        );
      } catch (linkErr) {
        console.error("linkGoogle error:", linkErr);
        return NextResponse.json(
          { error: "Gagal menautkan akun Google. Pastikan kolom google_email telah dibuat di database server." },
          { status: 500 }
        );
      }
    }

    const data: { name?: string; passwordHash?: string } = {};

    if (nama !== undefined) {
      if (nama.length < MIN_NAMA || nama.length > MAX_NAMA) {
        return NextResponse.json(
          { error: `Nama akun harus ${MIN_NAMA}-${MAX_NAMA} karakter.` },
          { status: 400 }
        );
      }
      data.name = nama;
    }

    if (passwordBaru !== undefined) {
      if (passwordBaru.length < MIN_PASSWORD) {
        return NextResponse.json(
          { error: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.` },
          { status: 400 }
        );
      }
      if (!passwordLama) {
        return NextResponse.json(
          { error: "Kata sandi lama wajib diisi untuk mengubah kata sandi." },
          { status: 400 }
        );
      }

      const user = await prisma.users.findUnique({ where: { id: auth.userId } });
      if (!user) {
        return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
      }

      const cocok = await bcrypt.compare(passwordLama, user.passwordHash);
      if (!cocok) {
        return NextResponse.json(
          { error: "Kata sandi lama salah." },
          { status: 400 }
        );
      }

      data.passwordHash = await bcrypt.hash(passwordBaru, 12);
    }

    try {
      const updated = await prisma.users.update({
        where: { id: auth.userId },
        data,
      });

      await audit({
        userId: auth.userId,
        action: passwordBaru !== undefined ? "akun.ubah_password" : "akun.ubah_nama",
        entity: "users",
        entityId: auth.userId,
        data: { nama: updated.name },
      });

      return NextResponse.json(
        {
          success: true,
          akun: { id: updated.id, nama: updated.name, email: updated.email },
          pesan:
            passwordBaru !== undefined
              ? "Kata sandi berhasil diubah."
              : "Nama akun berhasil diubah. Gunakan nama baru saat login berikutnya.",
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      // Nama akun unik di database (kolom username).
      if (typeof error === "object" && error && (error as { code?: string }).code === "P2002") {
        return NextResponse.json(
          { error: "Nama akun itu sudah dipakai pengguna lain." },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in PATCH /api/akun:", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan akun." }, { status: 500 });
  }
}
