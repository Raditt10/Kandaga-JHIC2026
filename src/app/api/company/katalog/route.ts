import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * GET /api/company/katalog
 * Ambil karya yang sudah approved (status="approved") dari database.
 * Hanya bisa diakses oleh company yang sudah diverifikasi.
 *
 * Query params:
 *   ?jurusan=rpl|tkj|analis-kimia   (opsional, filter per jurusan)
 *   ?q=keyword                       (opsional, search judul)
 *   ?page=1                          (pagination, 12 per halaman)
 *
 * Response shape per item:
 *   { id, title, description, year, viewCount, thumbnailUrl,
 *     jurusanKode, jurusanNama, siswaNama, badges }
 */
export async function GET(req: Request) {
  try {
    // ── Auth guard ─────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    if (session.user.role?.toLowerCase() !== "company") {
      return NextResponse.json({ error: "Hanya akun perusahaan yang dapat mengakses katalog." }, { status: 403 })
    }
    if (session.user.verificationStatus !== "disetujui") {
      return NextResponse.json({ error: "Akun belum diverifikasi BKK." }, { status: 403 })
    }

    // ── Parse query params ─────────────────────────────────────────
    const { searchParams } = new URL(req.url)
    const jurusanFilter = searchParams.get("jurusan")  // "rpl" | "tkj" | "analis-kimia"
    const keyword       = searchParams.get("q")?.trim()
    const page          = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize      = 12

    // ── Ambil bookmark milik company ini untuk flag isBookmarked ───
    const myBookmarks = await prisma.bookmarks.findMany({
      where:  { companyId: session.user.id },
      select: { projectId: true },
    })
    const bookmarkedIds = new Set(myBookmarks.map((b) => b.projectId))

    // ── Query Projects approved ────────────────────────────────────
    // Prisma tidak punya view v_katalog_publik, kita query langsung
    // dengan include sesuai schema
    const where = {
      status:    "approved",
      deletedAt: null,
      ...(keyword ? {
        OR: [
          { title:       { contains: keyword, mode: "insensitive" as const } },
          { description: { contains: keyword, mode: "insensitive" as const } },
        ],
      } : {}),
      ...(jurusanFilter ? {
        student: {
          major: {
            // Cocokkan slug jurusan dengan nama jurusan di DB
            name: jurusanFromSlug(jurusanFilter),
          },
        },
      } : {}),
    }

    const [projects, total] = await Promise.all([
      prisma.projects.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
        include: {
          student: {
            include: {
              user:  { select: { name: true } },
              major: { select: { name: true, id: true } },
            },
          },
          media:  { orderBy: { order: "asc" }, take: 1 },
          badges: { include: { badge: true } },
        },
      }),
      prisma.projects.count({ where }),
    ])

    // ── Transform ke shape yang dibutuhkan frontend ────────────────
    const items = projects.map((p) => ({
      id:           p.id,
      title:        p.title,
      description:  p.description ?? "",
      year:         p.year,
      viewCount:    p.viewCount,
      thumbnailUrl: p.media[0]?.url ?? null,
      jurusanKode:  slugFromMajorName(p.student.major.name),
      jurusanNama:  p.student.major.name,
      siswaNama:    p.student.user.name,
      badges:       p.badges.map((kb) => ({ tier: kb.badge.tier, nama: kb.badge.name })),
      isBookmarked: bookmarkedIds.has(p.id),
    }))

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error("[GET /api/company/katalog]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Konversi slug URL ke nama jurusan di DB */
function jurusanFromSlug(slug: string): string {
  const map: Record<string, string> = {
    "rpl":          "RPL",
    "tkj":          "TKJ",
    "analis-kimia": "Analis Kimia",
  }
  return map[slug] ?? slug
}

/** Konversi nama jurusan DB ke slug untuk URL */
function slugFromMajorName(name: string): string {
  const map: Record<string, string> = {
    "RPL":          "rpl",
    "TKJ":          "tkj",
    "Analis Kimia": "analis-kimia",
  }
  return map[name] ?? name.toLowerCase().replace(/\s+/g, "-")
}
