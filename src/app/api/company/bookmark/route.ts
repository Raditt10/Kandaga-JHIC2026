import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * POST /api/company/bookmark   body: { projectId }  → tambah bookmark
 * DELETE /api/company/bookmark body: { projectId }  → hapus bookmark
 *
 * RLS di DB (bookmark_own) sudah mengizinkan company baca/tulis baris
 * miliknya sendiri — tapi karena kita pakai Prisma (bukan raw SQL dengan
 * app.user_id), validasi ownership kita tangani di level aplikasi di sini.
 */

async function getVerifiedCompanyId(req: Request): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (session.user.role?.toLowerCase() !== "company") return null
  if (session.user.verificationStatus !== "disetujui") return null
  return session.user.id
}

export async function POST(req: Request) {
  try {
    const companyId = await getVerifiedCompanyId(req)
    if (!companyId) {
      return NextResponse.json({ error: "Tidak terautentikasi atau akun belum diverifikasi." }, { status: 401 })
    }

    const { projectId } = await req.json()
    if (!projectId) {
      return NextResponse.json({ error: "projectId wajib diisi." }, { status: 400 })
    }

    // Pastikan karya ada dan sudah approved
    const project = await prisma.projects.findFirst({
      where: { id: projectId, status: "approved", deletedAt: null },
    })
    if (!project) {
      return NextResponse.json({ error: "Karya tidak ditemukan atau belum disetujui." }, { status: 404 })
    }

    // upsert — aman jika sudah ada (idempoten)
    await prisma.bookmarks.upsert({
      where:  { companyId_projectId: { companyId, projectId } },
      create: { companyId, projectId },
      update: {}, // tidak ada yang perlu diupdate
    })

    return NextResponse.json({ bookmarked: true })
  } catch (err) {
    console.error("[POST /api/company/bookmark]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const companyId = await getVerifiedCompanyId(req)
    if (!companyId) {
      return NextResponse.json({ error: "Tidak terautentikasi atau akun belum diverifikasi." }, { status: 401 })
    }

    const { projectId } = await req.json()
    if (!projectId) {
      return NextResponse.json({ error: "projectId wajib diisi." }, { status: 400 })
    }

    // deleteMany supaya tidak error kalau belum ada (idempoten)
    await prisma.bookmarks.deleteMany({
      where: { companyId, projectId },
    })

    return NextResponse.json({ bookmarked: false })
  } catch (err) {
    console.error("[DELETE /api/company/bookmark]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
