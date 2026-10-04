import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { notify } from "@/lib/activity"

/**
 * /api/bkk/kontak — Antrian permintaan kontak (minat dari perusahaan ke karya siswa).
 *
 * Ini sisi BKK dari alurMitra.md §2. Perusahaan tidak pernah menghubungi siswa
 * langsung — semua permintaan lewat BKK, yang meninjau lalu memutuskan.
 *
 * Mesin status (alurMitra.md §5):
 *   terkirim → ditinjau → klarifikasi | diteruskan | ditolak
 *   catatan_bkk WAJIB untuk klarifikasi & ditolak
 *
 * CATATAN PENTING soal penegakan aturan:
 * alurMitra.md §2 mengasumsikan aturan bisnis ditegakkan di level database
 * (trigger, RLS, view). Kenyataannya database proyek ini dibuat lewat
 * `prisma db push` dari schema.prisma saja — hasil pemeriksaan: 0 trigger,
 * 0 view, 0 function aplikasi di schema public. `database/01_schema.sql`
 * juga tidak ada di repo.
 * Karena itu validasi status & catatan WAJIB dijalankan di layer API ini,
 * bukan diserahkan ke trigger/constraint. Kalau nanti `01_schema.sql`
 * benar-benar diterapkan, logika di sini tetap aman (idempoten).
 *
 * Notifikasi ke perusahaan TIDAK dibuat di sini — itu Fase 6 alurMitra.md.
 *
 * Semua endpoint hanya untuk role BKK.
 */

const ACTIVE_STATUSES = ["terkirim", "ditinjau", "klarifikasi"] as const
const ALL_STATUSES    = ["terkirim", "ditinjau", "klarifikasi", "diteruskan", "ditolak"] as const
const FINAL_STATUSES  = ["diteruskan", "ditolak"] as const

/** Batas minimum catatan BKK — samakan dengan constraint pk_note_chk di skema. */
const MIN_CATATAN = 10

/** Pemetaan aksi UI → status tujuan. */
const ACTION_TO_STATUS: Record<string, string> = {
  tinjau:      "ditinjau",
  klarifikasi: "klarifikasi",
  teruskan:    "diteruskan",
  tolak:       "ditolak",
}

async function requireBkk() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 }) }
  }
  if (session.user.role?.toLowerCase() !== "bkk") {
    return { error: NextResponse.json({ error: "Hanya Koordinator BKK yang dapat mengakses." }, { status: 403 }) }
  }
  return { session }
}

/**
 * GET /api/bkk/kontak
 *   ?count=true       → { count } jumlah antrian aktif (untuk widget dashboard)
 *   ?status=semua     → semua status, terbaru dulu (riwayat)
 *   ?status=<status>  → filter satu status
 *   default           → antrian aktif, FIFO (paling lama menunggu di atas)
 */
export async function GET(req: Request) {
  try {
    const auth = await requireBkk()
    if (auth.error) return auth.error

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get("status")

    const isHistory = statusParam === "semua"
    const isActive  = statusParam === null || statusParam === "aktif"

    // Default & "aktif" = antrian aktif; "semua" = riwayat; selain itu = 1 status spesifik
    let where: { status?: string | { in: string[] } }
    if (isHistory) {
      where = {}
    } else if (isActive) {
      where = { status: { in: [...ACTIVE_STATUSES] } }
    } else if (ALL_STATUSES.includes(statusParam as (typeof ALL_STATUSES)[number])) {
      where = { status: statusParam as string }
    } else {
      return NextResponse.json({ error: "Parameter status tidak dikenal." }, { status: 400 })
    }

    if (searchParams.get("count") === "true") {
      const count = await prisma.contactRequests.count({ where })
      return NextResponse.json({ count })
    }

    const requests = await prisma.contactRequests.findMany({
      where,
      // Antrian aktif = FIFO (paling lama menunggu dulu). Riwayat = terbaru dulu.
      orderBy: { createdAt: isHistory ? "desc" : "asc" },
      include: {
        company: {
          include: { user: { select: { name: true, email: true } } },
        },
        project: {
          include: {
            student: {
              include: {
                major: { select: { name: true } },
                user:  { select: { name: true } },
              },
            },
            media: { take: 1, orderBy: { order: "asc" } },
          },
        },
      },
    })

    const items = requests.map((r) => ({
      id:         r.id,
      status:     r.status,
      tujuan:     r.purpose,
      pesan:      r.message,
      catatanBkk: r.bkkNotes,
      createdAt:  r.createdAt.toISOString(),
      updatedAt:  r.updatedAt.toISOString(),
      reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      perusahaan: {
        nama:   r.company?.name ?? "—",
        bidang: r.company?.field ?? null,
        kontak: r.company?.user?.name ?? "—",
        email:  r.company?.user?.email ?? "—",
      },
      karya: {
        id:           r.project.id,
        title:        r.project.title,
        thumbnailUrl: r.project.media[0]?.url ?? null,
        jurusanNama:  r.project.student.major.name,
        siswaNama:    r.project.student.user.name,
        year:         r.project.year,
      },
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error("[GET /api/bkk/kontak]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

/**
 * PATCH /api/bkk/kontak
 * Tinjau / minta klarifikasi / teruskan ke siswa / tolak sebuah permintaan.
 *
 * Body: { id, action: "tinjau" | "klarifikasi" | "teruskan" | "tolak", catatan? }
 * - "klarifikasi" & "tolak" wajib disertai catatan (min. 10 karakter)
 * - Permintaan yang sudah final (diteruskan/ditolak) tidak bisa diproses ulang
 */
export async function PATCH(req: Request) {
  try {
    const auth = await requireBkk()
    if (auth.error) return auth.error
    if (!auth.session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }

    const { id, action, catatan } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "id permintaan wajib diisi." }, { status: 400 })
    }

    const newStatus = ACTION_TO_STATUS[action]
    if (!newStatus) {
      return NextResponse.json({
        error: "action harus salah satu dari: tinjau, klarifikasi, teruskan, tolak.",
      }, { status: 400 })
    }

    const butuhCatatan = newStatus === "klarifikasi" || newStatus === "ditolak"
    const catatanTrim  = typeof catatan === "string" ? catatan.trim() : ""

    if (butuhCatatan && catatanTrim.length < MIN_CATATAN) {
      return NextResponse.json({
        error: `Catatan wajib diisi minimal ${MIN_CATATAN} karakter untuk aksi ini.`,
      }, { status: 400 })
    }

    // Pastikan permintaan ada dan belum diputuskan
    const existing = await prisma.contactRequests.findUnique({
      where:  { id },
      select: { id: true, status: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Permintaan tidak ditemukan." }, { status: 404 })
    }
    if (FINAL_STATUSES.includes(existing.status as (typeof FINAL_STATUSES)[number])) {
      return NextResponse.json({
        error: "Permintaan ini sudah diputuskan sebelumnya dan tidak bisa diubah lagi.",
      }, { status: 409 })
    }

    try {
      await prisma.contactRequests.update({
        where: { id },
        data: {
          status:     newStatus,
          bkkNotes:   butuhCatatan ? catatanTrim : null,
          reviewedBy: auth.session.user.id,
          reviewedAt: new Date(),
        },
      })
    } catch (dbErr: unknown) {
      // Jaga-jaga kalau constraint pk_note_chk masih aktif di database
      const msg = dbErr instanceof Error ? dbErr.message : ""
      if (msg.includes("pk_note_chk")) {
        return NextResponse.json({ error: "Catatan wajib diisi untuk aksi ini." }, { status: 400 })
      }
      throw dbErr
    }

    const pesan: Record<string, string> = {
      ditinjau:    "Permintaan ditandai sedang ditinjau.",
      klarifikasi: "Permintaan klarifikasi dikirim ke perusahaan.",
      diteruskan:  "Permintaan diteruskan ke siswa.",
      ditolak:     "Permintaan ditolak dengan catatan.",
    }

    // Kirim notifikasi ke siswa saat BKK meneruskan permintaan kontak
    if (newStatus === "diteruskan") {
      try {
        const kontak = await prisma.contactRequests.findUnique({
          where: { id },
          select: {
            project: {
              select: {
                title: true,
                studentId: true,
              },
            },
            company: {
              select: { name: true },
            },
          },
        })

        if (kontak) {
          await notify({
            userId: kontak.project.studentId,
            type: "kontak",
            title: "Ada perusahaan yang ingin menghubungi Anda",
            content: `${kontak.company?.name ?? "Sebuah perusahaan"} tertarik dengan karya "${kontak.project.title}" Anda. BKK telah meneruskan permintaan ini — harap hubungi Koordinator BKK untuk tindak lanjut.`,
          })
        }
      } catch (notifErr) {
        // Kegagalan notifikasi tidak boleh membatalkan aksi utama
        console.warn("[PATCH /api/bkk/kontak] notify student error:", notifErr)
      }
    }

    return NextResponse.json({ message: pesan[newStatus], status: newStatus })
  } catch (err) {
    console.error("[PATCH /api/bkk/kontak]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
