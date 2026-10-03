/**
 * seed-demo.ts — data demo untuk tabel yang selama ini dibiarkan KOSONG.
 *
 * Aturan proyek: data dummy hanya boleh tinggal di dalam seed, bukan di dalam
 * file halaman/komponen. Sebelumnya `prisma/seed.ts` hanya MENGHAPUS tabel
 * berikut tanpa pernah mengisinya, sehingga fiturnya tidak bisa didemokan:
 *   project_tools, projects_main_features, projects_badge, bookmarks,
 *   partnerships, notifications, audit_logs
 *
 * Modul ini dipanggil dari `prisma/seed.ts` sehingga ikut pada seed penuh,
 * DAN bisa dijalankan sendiri lewat `npx tsx prisma/_run-seed-demo.ts` untuk
 * mengisi database yang sudah berisi data tanpa menghapus apa pun.
 *
 * Semua operasi bersifat idempotent (upsert / cek-lalu-buat), jadi aman
 * dijalankan berulang.
 */

import type { PrismaClient } from "@prisma/client"

export async function seedDemoTambahan(prisma: PrismaClient): Promise<void> {
  const users = Object.fromEntries(
    (await prisma.users.findMany()).map((u) => [u.name, u])
  )

  const projects = await prisma.projects.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  })
  const approved = projects.filter((p) => p.status === "approved")

  // ── 1. Master alat (tools_skills) ──────────────────────────────────────
  const NAMA_ALAT = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Prisma",
    "PostgreSQL",
    "Mikrotik",
    "SNMP",
    "Cisco",
    "Arduino",
    "Sensor IoT",
    "Titrasi Iodometri",
    "Spektrofotometri",
    "Analisis Kadar Air",
  ]
  for (const name of NAMA_ALAT) {
    await prisma.skillTool.upsert({ where: { name }, update: {}, create: { name } })
  }
  const alat = await prisma.skillTool.findMany()
  const alatByName = new Map(alat.map((a) => [a.name, a]))

  // ── 2. Alat & fitur utama per karya ────────────────────────────────────
  // Dicocokkan lewat potongan judul supaya tidak bergantung pada uuid acak.
  const RINCIAN: { cocok: string; alat: string[]; fitur: string[] }[] = [
    {
      cocok: "Kandaga",
      alat: ["Next.js", "Prisma", "PostgreSQL", "Tailwind CSS"],
      fitur: [
        "Galeri karya yang dikurasi guru",
        "Antrian permintaan kontak lewat BKK",
        "Dashboard terpisah untuk lima peran",
      ],
    },
    {
      cocok: "Absensi QR",
      alat: ["Next.js", "PostgreSQL"],
      fitur: [
        "Presensi harian lewat pemindaian QR",
        "Rekap otomatis per kelas",
        "Laporan bulanan untuk guru",
      ],
    },
    {
      cocok: "Monitoring Jaringan",
      alat: ["SNMP", "Mikrotik", "Cisco"],
      fitur: [
        "Pemantauan perangkat jaringan sekolah",
        "Notifikasi saat perangkat turun",
        "Riwayat uptime untuk audit",
      ],
    },
    {
      cocok: "Hotspot Voucher",
      alat: ["Mikrotik"],
      fitur: [
        "Voucher akses otomatis",
        "Pembatasan kuota per pengguna",
        "Laporan penggunaan harian",
      ],
    },
    {
      cocok: "Vitamin C",
      alat: ["Titrasi Iodometri"],
      fitur: [
        "Penetapan kadar vitamin C tiga sampel buah",
        "Perbandingan dengan standar literatur",
        "Laporan praktikum terverifikasi",
      ],
    },
    {
      cocok: "Citarum",
      alat: ["Spektrofotometri", "Titrasi Iodometri"],
      fitur: [
        "Pengujian parameter pH dan BOD",
        "Analisis kadar logam berat",
        "Laporan riset lingkungan",
      ],
    },
  ]

  for (const r of RINCIAN) {
    const proj = projects.find((p) => p.title.includes(r.cocok))
    if (!proj) continue

    for (const nama of r.alat) {
      let tool = alatByName.get(nama)
      if (!tool) {
        tool = await prisma.skillTool.upsert({
          where: { name: nama },
          update: {},
          create: { name: nama },
        })
        alatByName.set(nama, tool)
      }
      await prisma.projectsTool.upsert({
        where: { projectId_toolId: { projectId: proj.id, toolId: tool.id } },
        update: { name: nama },
        create: { projectId: proj.id, toolId: tool.id, name: nama },
      })
    }

    await prisma.projectsMainFeatures.createMany({
      data: r.fitur.map((feature) => ({ projectId: proj.id, feature })),
      skipDuplicates: true,
    })
  }

  // ── 3. Badge (AGENTS.md §5: 3 tier dari guru + 1 dari BKK) ─────────────
  const DAFTAR_BADGE = [
    { name: "Karya Unggulan", tier: "gold" },
    { name: "Karya Terpilih", tier: "silver" },
    { name: "Karya Baik", tier: "bronze" },
    { name: "Diminati Industri", tier: "industri" },
  ]
  for (const b of DAFTAR_BADGE) {
    await prisma.badges.upsert({
      where: { name: b.name },
      update: { tier: b.tier },
      create: b,
    })
  }
  const badges = await prisma.badges.findMany()
  const badgeByTier = new Map(badges.map((b) => [b.tier, b]))

  const PEMBERIAN: { cocok: string; tier: string; oleh: string }[] = [
    { cocok: "Kandaga", tier: "gold", oleh: "guru13" },
    { cocok: "Monitoring Jaringan", tier: "silver", oleh: "guru13" },
    { cocok: "Vitamin C", tier: "bronze", oleh: "guru13" },
    { cocok: "Kandaga", tier: "industri", oleh: "bkk13" },
  ]

  for (const p of PEMBERIAN) {
    const proj = projects.find((x) => x.title.includes(p.cocok))
    const badge = badgeByTier.get(p.tier)
    const oleh = users[p.oleh]
    if (!proj || !badge || !oleh) continue

    await prisma.projectsBadge.upsert({
      where: { projectId_badgeId: { projectId: proj.id, badgeId: badge.id } },
      update: {},
      create: { projectId: proj.id, badgeId: badge.id, awardedBy: oleh.id },
    })
  }

  // ── 4. Bookmark milik mitra ───────────────────────────────────────────
  const mitra = users["mitra_perusahaan"]
  if (mitra) {
    for (const proj of approved.slice(0, 3)) {
      await prisma.bookmarks.upsert({
        where: {
          companyId_projectId: { companyId: mitra.id, projectId: proj.id },
        },
        update: {},
        create: { companyId: mitra.id, projectId: proj.id },
      })
    }
  }

  // ── 5. Kemitraan dari permintaan yang sudah diteruskan ────────────────
  const diteruskan = await prisma.contactRequests.findFirst({
    where: { status: "diteruskan" },
  })
  if (diteruskan && users["bkk13"]) {
    await prisma.partnerships.upsert({
      where: { requestId: diteruskan.id },
      update: {},
      create: {
        requestId: diteruskan.id,
        type: "kolaborasi",
        startDate: new Date(),
        notes:
          "Dilanjutkan sebagai kerja sama pengembangan produk bersama DUDI, difasilitasi BKK.",
        recordedBy: users["bkk13"].id,
      },
    })
  }

  // ── 6. Notifikasi contoh (tidak punya kunci unik, dicek dulu) ─────────
  const NOTIFIKASI = [
    {
      untuk: "siswa13",
      type: "karya",
      title: "Selamat datang di Kandaga",
      content:
        "Unggah karya tugas akhir Anda, lalu tunggu kurasi dari guru pembimbing sebelum tayang di galeri.",
    },
    {
      untuk: "siswa13",
      type: "karya",
      title: "Karya Anda sedang dikurasi",
      content:
        "Guru pembimbing akan menilai karya Anda. Anda akan menerima notifikasi saat hasilnya keluar.",
    },
    {
      untuk: "guru13",
      type: "karya",
      title: "Ada karya menunggu kurasi",
      content: "Buka tab Antrean untuk menilai karya siswa di jurusan Anda.",
    },
    {
      untuk: "mitra_perusahaan",
      type: "kontak",
      title: "Permintaan kontak sedang ditinjau BKK",
      content:
        "Permintaan Anda sudah diterima dan sedang diproses koordinator BKK sekolah.",
    },
    {
      untuk: "bkk13",
      type: "kontak",
      title: "Ada permintaan kontak baru",
      content: "Buka Antrian Kontak untuk meninjau permintaan dari mitra industri.",
    },
  ]

  for (const n of NOTIFIKASI) {
    const user = users[n.untuk]
    if (!user) continue
    const ada = await prisma.notifications.findFirst({
      where: { userId: user.id, title: n.title },
    })
    if (!ada) {
      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: n.type,
          title: n.title,
          content: n.content,
        },
      })
    }
  }

  // ── 7. Audit log contoh ───────────────────────────────────────────────
  const perusahaanDisetujui = await prisma.company.findFirst({
    where: { verificationStatus: "disetujui" },
  })

  const AUDIT: {
    action: string
    entity: string
    entityId: string | null
    data: Record<string, unknown>
    oleh?: string
  }[] = [
    {
      action: "project.approve",
      entity: "projects",
      entityId: approved[0]?.id ?? null,
      data: { title: approved[0]?.title ?? "-", score: 92 },
      oleh: "guru13",
    },
    {
      action: "company.verify",
      entity: "companies",
      entityId: perusahaanDisetujui?.userId ?? null,
      data: { nama: perusahaanDisetujui?.name ?? "-", status: "disetujui" },
      oleh: "bkk13",
    },
    {
      action: "kontak.teruskan",
      entity: "contact_requests",
      entityId: diteruskan?.id ?? null,
      data: { tujuan: diteruskan?.purpose ?? "-" },
      oleh: "bkk13",
    },
  ]

  for (const a of AUDIT) {
    const ada = await prisma.auditLogs.findFirst({
      where: { action: a.action, entityId: a.entityId },
    })
    if (ada) continue
    await prisma.auditLogs.create({
      data: {
        userId: a.oleh ? users[a.oleh]?.id ?? null : null,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        data: a.data as never,
      },
    })
  }

  console.log(
    "  ✓ seed-demo: alat, fitur utama, badge, bookmark, kemitraan, notifikasi, audit log"
  )
}
