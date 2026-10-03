/**
 * GET /api/teacher/projects
 *
 * Mengembalikan seluruh data yang dibutuhkan portal guru dalam satu panggilan:
 * antrean kurasi (status `pending`), riwayat kurasi (`approved`/`revisi`),
 * statistik ringkas, dan daftar siswa bimbingan.
 *
 * Sebelumnya halaman /teacher memakai data hardcoded di dalam komponennya
 * (`initialCurationQueue`, `verifiedHistory`) sehingga karya siswa yang
 * berstatus `pending` TIDAK PERNAH bisa menjadi `approved` lewat UI — galeri
 * hanya terisi dari seed. Endpoint ini menutup alur tersebut.
 *
 * Lingkup: guru hanya melihat karya pada jurusannya sendiri (AGENTS.md §5).
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacher } from "@/lib/api-auth";
import {
  resolveTeacherScope,
  mapTeacherProject,
  TEACHER_PROJECT_INCLUDE,
} from "@/lib/teacher-scope";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (auth.error) return auth.error;

    const scope = await resolveTeacherScope(auth.userId);

    if (!scope.teacher) {
      return NextResponse.json(
        {
          error:
            "Akun ini belum punya profil guru, jadi belum ada jurusan yang bisa dikurasi. Hubungi administrator.",
          scope: null,
          antrean: [],
          riwayat: [],
          siswa: [],
          stats: { menunggu: 0, disetujui: 0, revisi: 0, siswaBimbingan: 0 },
        },
        { status: 200 }
      );
    }

    if (!scope.projectType) {
      return NextResponse.json(
        {
          error: `Jurusan "${scope.teacher.majorName ?? "tidak diketahui"}" belum dipetakan ke jenis karya (RPL/TKJ/KA).`,
          scope: { majorName: scope.teacher.majorName, projectType: null },
          antrean: [],
          riwayat: [],
          siswa: [],
          stats: { menunggu: 0, disetujui: 0, revisi: 0, siswaBimbingan: 0 },
        },
        { status: 200 }
      );
    }

    const baseWhere = {
      type: scope.projectType,
      deletedAt: null,
    };

    const [antreanRaw, riwayatRaw, menunggu, disetujui, revisi, siswaRaw] =
      await Promise.all([
        prisma.projects.findMany({
          where: { ...baseWhere, status: "pending" },
          include: TEACHER_PROJECT_INCLUDE,
          orderBy: { createdAt: "asc" },
        }),
        prisma.projects.findMany({
          where: { ...baseWhere, status: { in: ["approved", "revisi"] } },
          include: TEACHER_PROJECT_INCLUDE,
          orderBy: { publishedAt: "desc" },
        }),
        prisma.projects.count({ where: { ...baseWhere, status: "pending" } }),
        prisma.projects.count({ where: { ...baseWhere, status: "approved" } }),
        prisma.projects.count({ where: { ...baseWhere, status: "revisi" } }),
        prisma.student.findMany({
          where: { majorId: scope.teacher.majorId },
          include: {
            user: true,
            projects: {
              where: { deletedAt: null },
              select: { id: true, title: true, status: true, type: true, score: true },
            },
          },
          orderBy: { class: "asc" },
        }),
      ]);

    const antrean = antreanRaw.map(mapTeacherProject);
    const riwayat = riwayatRaw.map(mapTeacherProject);

    const siswa = siswaRaw.map((s) => {
      const inJurusan = s.projects.filter((p) => p.type === scope.projectType);
      return {
        id: s.userId,
        name: s.user?.name ?? "Siswa SMKN 13",
        class: s.class ?? "—",
        nis: s.nis ?? "—",
        bio: s.bio ?? null,
        photoUrl: s.photoUrl ?? null,
        totalKarya: inJurusan.length,
        disetujui: inJurusan.filter((p) => p.status === "approved").length,
        menunggu: inJurusan.filter((p) => p.status === "pending").length,
        // Satu baris per karya di tab "Siswa Bimbingan".
        karya: inJurusan.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          score: p.score,
        })),
      };
    });

    return NextResponse.json(
      {
        scope: {
          majorName: scope.teacher.majorName,
          projectType: scope.projectType,
        },
        antrean,
        riwayat,
        siswa,
        stats: { menunggu, disetujui, revisi, siswaBimbingan: siswa.length },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/teacher/projects:", error);
    return NextResponse.json(
      { error: "Gagal memuat data kurasi." },
      { status: 500 }
    );
  }
}
