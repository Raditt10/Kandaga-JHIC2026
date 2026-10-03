/**
 * Lingkup kerja guru pembimbing.
 *
 * AGENTS.md §5: guru hanya mengurasi karya pada jurusannya sendiri, dan
 * hanya guru yang boleh memberi badge (3 tier pertama). Modul ini menentukan
 * jurusan guru dari sesi, lalu menerjemahkannya ke `ProjectType`.
 *
 * Dipakai bersama oleh /api/teacher/projects dan /api/teacher/projects/[id]
 * supaya aturan lingkupnya hanya ada di satu tempat.
 */

import prisma from "@/lib/prisma"
import type { ProjectType } from "@prisma/client"

/** Nama jurusan di tabel `majors` → nilai enum ProjectType. */
const MAJOR_TO_PROJECT_TYPE: Record<string, ProjectType> = {
  "RPL": "RPL",
  "TKJ": "TKJ",
  "Analis Kimia": "KA",
}

export type TeacherScope = {
  /** Profil guru; null bila akun ber-role teacher belum punya baris di `teachers`. */
  teacher: { userId: string; majorId: string; majorName: string | null } | null
  /** Jenis karya yang boleh dikurasi. null = tidak ada jurusan terdeteksi. */
  projectType: ProjectType | null
}

export async function resolveTeacherScope(userId: string): Promise<TeacherScope> {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: { major: true },
  })

  if (!teacher) return { teacher: null, projectType: null }

  const majorName = teacher.major?.name ?? null
  const projectType = majorName ? MAJOR_TO_PROJECT_TYPE[majorName] ?? null : null

  return {
    teacher: { userId: teacher.userId, majorId: teacher.majorId, majorName },
    projectType,
  }
}

type ProjectWithRelations = {
  id: string
  title: string
  description: string | null
  type: ProjectType | null
  status: string
  score: number | null
  reviewNotes: string | null
  coverImage: string | null
  createdAt: Date
  publishedAt: Date | null
  student: { class: string | null; user: { name: string } | null } | null
  advisor: { user: { name: string } | null } | null
  tools: { name: string; tool: { name: string } | null }[]
}

/** Bentuk data yang dipakai halaman /teacher. */
export function mapTeacherProject(p: ProjectWithRelations) {
  const typeLabel =
    p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL"

  return {
    id: p.id,
    title: p.title,
    summary: p.description ?? "Belum ada deskripsi dari siswa.",
    category: typeLabel,
    major: p.type ?? "RPL",
    majorLabel: typeLabel,
    studentName: p.student?.user?.name ?? "Siswa SMKN 13",
    studentClass: p.student?.class ?? "—",
    advisorName: p.advisor?.user?.name ?? "—",
    submittedAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    status: p.status,
    score: p.score,
    reviewNotes: p.reviewNotes,
    coverImage: p.coverImage,
    // Nama alat bebas dari siswa, jatuh ke master SkillTool bila kosong.
    techStack: p.tools.map((t) => t.name || t.tool?.name).filter(Boolean),
  }
}

export const TEACHER_PROJECT_INCLUDE = {
  student: { include: { user: true } },
  advisor: { include: { user: true } },
  tools: { include: { tool: true } },
} as const
