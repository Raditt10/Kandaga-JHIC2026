import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly");

    if (countOnly === "true") {
      const count = await prisma.users.count();
      return NextResponse.json({ count });
    }

    const users = await prisma.users.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      username: u.name,
      email: u.email,
      role: u.role.toLowerCase(),
      password: "••••••••",
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: mapped });
  } catch (error) {
    console.error("GET /api/admin/pengguna error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, username, email, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Role protection: Admin cannot modify student or company profiles directly
    if (existingUser.role === Role.Student || existingUser.role === Role.Company) {
      return NextResponse.json(
        {
          error: `Admin tidak memiliki izin untuk mengubah data akun ${
            existingUser.role === Role.Student ? "siswa" : "perusahaan"
          }.`,
        },
        { status: 403 }
      );
    }

    const trimmedUsername = (username || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail) {
      return NextResponse.json(
        { error: "Username dan email tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Duplicate check
    const duplicate = await prisma.users.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: trimmedUsername }, { email: trimmedEmail }],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Username atau email sudah digunakan oleh pengguna lain" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: trimmedUsername,
      email: trimmedEmail,
    };

    if (role) {
      const normalizedRole = role.toUpperCase();
      if (normalizedRole in Role) {
        updateData.role = normalizedRole as Role;
      }
    }

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 12);
    }

    const updated = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.name,
        email: updated.email,
        role: updated.role.toLowerCase(),
        password: "••••••••",
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/pengguna error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 });
    }

    await prisma.users.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/pengguna error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
