import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/api-auth";

export async function GET() {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        studentProfile: {
          select: {
            nis: true,
            class: true,
            generation: true,
            bio: true,
            currentCareer: true,
            photoUrl: true,
            major: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Data pengguna tidak ditemukan." }, { status: 404 });
    }

    // Split name into first name and last name
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
        phone: user.studentProfile?.currentCareer || "",
        gender: "male", // default
        nis: user.studentProfile?.nis || "212210045",
        nisn: "0067829140",
        class: user.studentProfile?.class || "XII RPL 1",
        majorName: user.studentProfile?.major?.name || "RPL",
        majorFullName: user.studentProfile?.major?.fullName || "Rekayasa Perangkat Lunak",
        school: "SMK Negeri 13 Bandung",
        country: "Indonesia",
        address: "Jl. Soekarno-Hatta No. 584, Sekejati, Buahbatu, Kota Bandung, Jawa Barat 40286",
        bio: user.studentProfile?.bio || "Siswa tingkat akhir jurusan RPL SMKN 13 Bandung dengan spesialisasi Next.js, TypeScript, dan arsitektur database relasional PostgreSQL.",
        photoUrl: user.studentProfile?.photoUrl || "/images/siswa.webp",
      },
    });
  } catch (err) {
    console.error("[GET /api/student/profil] error:", err);
    return NextResponse.json({ error: "Gagal memuat profil siswa." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, fullName, bio, photoUrl, phone, class: studentClass } = body;

    const combinedName = (fullName || `${firstName || ""} ${lastName || ""}`).trim();

    // Update Users name if provided
    if (combinedName && combinedName.length >= 3) {
      await prisma.users.update({
        where: { id: auth.userId },
        data: { name: combinedName },
      });
    }

    // Update student bio, photoUrl, phone & class if student profile exists
    const student = await prisma.student.findUnique({
      where: { userId: auth.userId },
    });

    if (student) {
      const updateData: { bio?: string; photoUrl?: string | null; currentCareer?: string; class?: string } = {};
      if (typeof bio === "string") updateData.bio = bio;
      if (typeof photoUrl === "string") updateData.photoUrl = photoUrl;
      if (typeof phone === "string") updateData.currentCareer = phone;
      if (typeof studentClass === "string" && studentClass.trim()) {
        updateData.class = studentClass.trim();
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.student.update({
          where: { userId: auth.userId },
          data: updateData,
        });

        if (typeof photoUrl === "string") {
          try {
            if ((global as unknown as { io?: { emit: (event: string, data: unknown) => void } }).io) {
              (global as unknown as { io: { emit: (event: string, data: unknown) => void } }).io.emit("avatar_updated", {
                userId: auth.userId,
                photoUrl,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            console.warn("[PATCH /api/student/profil] Socket broadcast error:", e);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      photoUrl,
    });
  } catch (err) {
    console.error("[PATCH /api/student/profil] error:", err);
    return NextResponse.json({ error: "Gagal menyimpan perubahan profil." }, { status: 500 });
  }
}
