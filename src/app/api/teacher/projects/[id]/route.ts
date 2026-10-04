/**
 * PATCH /api/teacher/projects/[id]
 *
 * Aksi kurasi guru:
 *   { action: "approve", score?, reviewNotes? }  → status "approved", tayang di galeri
 *   { action: "revisi",  reviewNotes }           → status "revisi", wajib catatan
 *
 * Aturan yang ditegakkan:
 *   - hanya role teacher (AGENTS.md §5),
 *   - guru hanya boleh mengurasi karya pada jurusannya sendiri,
 *   - "revisi" wajib disertai catatan minimal 10 karakter supaya siswa tahu
 *     apa yang harus diperbaiki,
 *   - siswa pemilik karya menerima notifikasi, dan aksinya tercatat di audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTeacher } from "@/lib/api-auth";
import { resolveTeacherScope, mapTeacherProject, TEACHER_PROJECT_INCLUDE } from "@/lib/teacher-scope";
import { notify, audit } from "@/lib/activity";

const MIN_CATATAN = 10;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTeacher();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action !== "approve" && action !== "revisi") {
      return NextResponse.json(
        { error: 'Aksi harus "approve" atau "revisi".' },
        { status: 400 }
      );
    }

    const project = await prisma.projects.findUnique({
      where: { id },
      include: TEACHER_PROJECT_INCLUDE,
    });

    if (!project || project.deletedAt) {
      return NextResponse.json({ error: "Karya tidak ditemukan." }, { status: 404 });
    }

    const scope = await resolveTeacherScope(auth.userId);

    // Batas jurusan: guru TKJ tidak boleh mengurasi karya Analis Kimia.
    if (!scope.projectType || project.type !== scope.projectType) {
      return NextResponse.json(
        {
          error: `Karya ini bukan dari jurusan Anda (${
            scope.teacher?.majorName ?? "belum ada jurusan"
          }).`,
        },
        { status: 403 }
      );
    }

    const reviewNotes =
      typeof body.reviewNotes === "string" ? body.reviewNotes.trim() : "";

    if (reviewNotes.length > 0 && reviewNotes.length < MIN_CATATAN) {
      return NextResponse.json(
        { error: `Catatan minimal ${MIN_CATATAN} karakter.` },
        { status: 400 }
      );
    }

    if (action === "revisi" && reviewNotes.length < MIN_CATATAN) {
      return NextResponse.json(
        {
          error: `Catatan revisi wajib diisi (minimal ${MIN_CATATAN} karakter) supaya siswa tahu apa yang harus diperbaiki.`,
        },
        { status: 400 }
      );
    }

    // Nilai kurasi 0-100, opsional.
    let score: number | null | undefined = undefined;
    if (body.score !== undefined && body.score !== null && body.score !== "") {
      const parsed = Number(body.score);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return NextResponse.json(
          { error: "Nilai harus berupa angka 0-100." },
          { status: 400 }
        );
      }
      score = Math.round(parsed);
    }

    const approved = action === "approve";

    const updated = await prisma.projects.update({
      where: { id },
      data: {
        status: approved ? "approved" : "revisi",
        reviewedBy: auth.userId,
        publishedAt: approved ? new Date() : null,
        reviewNotes: reviewNotes.length > 0 ? reviewNotes : null,
        ...(score !== undefined ? { score } : {}),
      },
      include: TEACHER_PROJECT_INCLUDE,
    });

    await notify({
      userId: updated.studentId,
      type: "karya",
      title: approved ? "Karya Anda disetujui" : "Karya Anda perlu revisi",
      content: approved
        ? `"${updated.title}" sudah diverifikasi dan tayang di Galeri Kandaga.`
        : `"${updated.title}" dikembalikan untuk revisi. Catatan guru: ${reviewNotes}`,
    });

    await audit({
      userId: auth.userId,
      action: approved ? "project.approve" : "project.revisi",
      entity: "projects",
      entityId: updated.id,
      data: { title: updated.title, score: score ?? null },
    });

    // Invalidate Redis gallery cache
    try {
      const { invalidateGalleryCache } = await import("@/lib/redis");
      await invalidateGalleryCache();
    } catch (cacheErr) {
      console.warn("Cache invalidation error:", cacheErr);
    }

    return NextResponse.json(
      { success: true, project: mapTeacherProject(updated) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/teacher/projects/[id]:", error);
    return NextResponse.json({ error: "Gagal menyimpan hasil kurasi." }, { status: 500 });
  }
}
