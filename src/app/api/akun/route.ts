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
      include: {
        studentProfile: { include: { major: true } },
        teacherProfile: { include: { major: true } },
        companyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    // Ringkasan profil sesuai peran — ditampilkan sebagai daftar data akun.
    const detail: { label: string; value: string }[] = [];
    if (user.studentProfile) {
      detail.push(
        { label: "NIS", value: user.studentProfile.nis ?? "—" },
        { label: "Kelas", value: user.studentProfile.class ?? "—" },
        { label: "Jurusan", value: user.studentProfile.major?.name ?? "—" }
      );
    }
    if (user.teacherProfile) {
      detail.push(
        { label: "NIP", value: user.teacherProfile.nip ?? "—" },
        { label: "Jurusan", value: user.teacherProfile.major?.name ?? "—" }
      );
    }
    if (user.companyProfile) {
      detail.push(
        { label: "Nama Perusahaan", value: user.companyProfile.name ?? "—" },
        { label: "Bidang", value: user.companyProfile.field ?? "—" },
        {
          label: "Status Verifikasi",
          value: user.companyProfile.verificationStatus ?? "pending",
        }
      );
    }

    return NextResponse.json(
      {
        akun: {
          id: user.id,
          nama: user.name,
          email: user.email,
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

    if (nama === undefined && passwordBaru === undefined) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
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
