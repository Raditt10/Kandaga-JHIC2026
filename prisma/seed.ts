// prisma/seed.ts
import { PrismaClient, Role, ProjectType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedDemoTambahan } from './seed-demo'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start Seeding database...')

  // Clear existing records (urutan penting: dependen dulu)
  await prisma.auditLogs.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.partnerships.deleteMany()
  await prisma.contactRequests.deleteMany()
  await prisma.bookmarks.deleteMany()
  await prisma.projectsBadge.deleteMany()
  await prisma.projectsTool.deleteMany()
  await prisma.projectsMedia.deleteMany()
  await prisma.projects.deleteMany()
  await prisma.badges.deleteMany()
  await prisma.skillTool.deleteMany()
  await prisma.company.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.major.deleteMany()
  await prisma.users.deleteMany()

  console.log('🗑️  Existing data cleared.')

  // Hash password sekali, dipakai semua demo user
  // Password: "password123" sesuai login page demo
  const hashedPassword = await bcrypt.hash('password123', 12)

  // ── Demo Users — username sesuai login page demo accounts ──────────
  const userdata = [
    {
      name:  'siswa13',
      email: 'siswa@smkn13bdg.sch.id',
      role:  'student',
    },
    {
      name:  'admin13',
      email: 'admin@smkn13bdg.sch.id',
      role:  'admin',
    },
    {
      name:  'mitra_perusahaan',
      email: 'hr@mitrainovasi.co.id',
      role:  'company',
    },
    {
      name:  'guru13',
      email: 'guru@smkn13bdg.sch.id',
      role:  'teacher',
    },
    {
      name:  'bkk13',
      email: 'bkk@smkn13bdg.sch.id',
      role:  'bkk',
    },
    // Dua akun mitra yang sudah ada di database — dipertahankan supaya seed
    // tidak menghapus pendaftaran yang pernah dilakukan lewat /mitra/daftar.
    // Password-nya ikut menjadi "password123" setelah seed.
    {
      name:  'adit',
      email: 'adit@gmail.com',
      role:  'company',
    },
    {
      name:  'dzaha',
      email: 'mdzakwanhf@gmail.com',
      role:  'company',
    },

  ]

  for (const user of userdata) {
    await prisma.users.create({
      data: {
        name:         user.name,
        email:        user.email,
        passwordHash: hashedPassword,   // bcrypt hash dari "password123"
        role:         mapRole(user.role),
        status:       'aktif',
      },
    })
    console.log(`  ✓ Created: ${user.name} (${user.role})`)
  }

  // ── Majors ─────────────────────────────────────────────────────────
  const majorsdata = [
    {
      name:        'Analis Kimia',
      fullName:    'Analis Kimia',
      image:       '/images/hero-kimia.jpg',
      link:        '/jurusan/analis-kimia',
      description: 'Jurusan yang berfokus pada analisis laboratorium, pengujian bahan kimia, dan riset berbasis sains terapan.',
    },
    {
      name:        'TKJ',
      fullName:    'Teknik Komputer Jaringan',
      image:       '/images/hero-tkj.jpg',
      link:        '/jurusan/tkj',
      description: 'Jurusan yang mempelajari infrastruktur jaringan komputer, keamanan sistem, dan administrasi server.',
    },
    {
      name:        'RPL',
      fullName:    'Rekayasa Perangkat Lunak',
      image:       '/images/preview-rpl.jpg',
      link:        '/jurusan/rpl',
      description: 'Jurusan yang fokus pada pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.',
    },
  ]

  
  for (const major of majorsdata) {
    await prisma.major.create({ data: major })
    console.log(`  ✓ Major: ${major.name}`)
  }

  // ══════════════════════════════════════════════════════════════════════
  // DATA DEMO LENGKAP
  //
  // Tanpa bagian ini, aplikasi tampak "hidup" padahal database kosong:
  // galeri hanya terisi dari data statis (src/data/galleryData.ts) dan
  // semua dashboard selalu kosong. Bagian ini membuat tiap alur bisa
  // didemokan dengan data nyata dari PostgreSQL:
  //   /gallery          ← karya berstatus approved
  //   /teacher          ← karya pending untuk diverifikasi guru
  //   /student          ← karya milik siswa13
  //   /company/katalog  ← karya yang bisa dilamar
  //   /company/riwayat  ← permintaan yang sudah diputuskan
  //   /bkk/verifikasi   ← perusahaan berstatus pending
  //   /bkk/kontak       ← permintaan yang menunggu tindakan BKK
  // ══════════════════════════════════════════════════════════════════════

  const u = Object.fromEntries((await prisma.users.findMany()).map((x) => [x.name, x]))
  const m = Object.fromEntries((await prisma.major.findMany()).map((x) => [x.name, x]))

  const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`

  // ── Profil siswa tambahan (supaya galeri tidak hanya berisi 1 jurusan) ──
  const extraStudentUsers = [
    { name: 'siswa_tkj13',   email: 'siswa.tkj@smkn13bdg.sch.id',   major: 'TKJ',          nis: '2026130001', cls: 'XII TKJ 1' },
    { name: 'siswa_kimia13', email: 'siswa.kimia@smkn13bdg.sch.id', major: 'Analis Kimia', nis: '2026130002', cls: 'XII AK 1'  },
  ]
  for (const s of extraStudentUsers) {
    if (u[s.name]) continue
    u[s.name] = await prisma.users.create({
      data: {
        name:         s.name,
        email:        s.email,
        passwordHash: hashedPassword,
        role:         Role.Student,
        status:       'aktif',
      },
    })
    console.log(`  ✓ Created: ${s.name} (student)`)
  }

  // ── Profil Siswa ───────────────────────────────────────────────────────
  const studentProfiles = [
    { user: 'siswa13',       major: 'RPL',          nis: '2026130000', cls: 'XII RPL 1', gen: 2026, bio: 'Siswa RPL yang fokus pada pengembangan aplikasi web.' },
    { user: 'siswa_tkj13',   major: 'TKJ',          nis: '2026130001', cls: 'XII TKJ 1', gen: 2026, bio: 'Fokus pada infrastruktur jaringan dan keamanan sistem.' },
    { user: 'siswa_kimia13', major: 'Analis Kimia', nis: '2026130002', cls: 'XII AK 1',  gen: 2026, bio: 'Tertarik pada analisis laboratorium dan kimia terapan.' },
  ]
  for (const p of studentProfiles) {
    await prisma.student.create({
      data: {
        userId:     u[p.user].id,
        majorId:    m[p.major].id,
        nis:        p.nis,
        class:      p.cls,
        generation: p.gen,
        status:     'aktif',
        bio:        p.bio,
      },
    })
    console.log(`  ✓ Student profile: ${p.user} (${p.major})`)
  }

  // ── Profil Guru ────────────────────────────────────────────────────────
  await prisma.teacher.create({
    data: { userId: u['guru13'].id, majorId: m['RPL'].id, nip: '198501012010011001' },
  })
  console.log('  ✓ Teacher profile: guru13 (RPL)')

  // ── Profil Perusahaan ──────────────────────────────────────────────────
  // mitra_perusahaan WAJIB punya baris di sini. Tanpa profil perusahaan,
  // verificationStatus bernilai null dan akun demo itu selalu dilempar ke
  // /mitra/menunggu — dashboard perusahaan tidak pernah bisa dicoba.
  const companyProfiles = [
    { user: 'mitra_perusahaan', name: 'PT Mitra Inovasi Nusantara', field: 'Teknologi Informasi', status: 'disetujui' },
    { user: 'adit',             name: 'Ijin Tampil',                field: 'Teknologi Informasi', status: 'disetujui' },
    { user: 'dzaha',            name: 'Creepix Inc',                field: 'Teknologi Informasi', status: 'pending'   },
  ]
  for (const c of companyProfiles) {
    const disetujui = c.status === 'disetujui'
    await prisma.company.create({
      data: {
        userId:             u[c.user].id,
        name:               c.name,
        field:              c.field,
        verificationStatus: c.status,
        documentUrl:        'https://example.com/dokumen-legalitas.pdf',
        verifiedBy:         disetujui ? u['bkk13'].id : null,
        verifiedAt:         disetujui ? new Date() : null,
      },
    })
    console.log(`  ✓ Company profile: ${c.name} (${c.status})`)
  }

  // ── Karya siswa ────────────────────────────────────────────────────────
  const projectSeed = [
    { student: 'siswa13',       type: 'RPL', status: 'approved', title: 'Kandaga — Galeri Digital Karya Siswa',
      desc: 'Platform galeri digital dan portal kolaborasi industri untuk SMKN 13 Bandung, dibangun dengan Next.js, Prisma, dan PostgreSQL.' },
    { student: 'siswa13',       type: 'RPL', status: 'approved', title: 'Sistem Absensi QR Code Berbasis Web',
      desc: 'Absensi siswa memakai QR code dengan rekap otomatis ke dashboard guru dan laporan harian.' },
    { student: 'siswa13',       type: 'RPL', status: 'pending',  title: 'Aplikasi Kasir UMKM Sekolah',
      desc: 'Aplikasi kasir sederhana untuk kantin sekolah, mendukung pencatatan stok dan laporan penjualan harian.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'approved', title: 'Monitoring Jaringan Sekolah dengan SNMP',
      desc: 'Sistem pemantauan perangkat jaringan sekolah berbasis SNMP dengan notifikasi saat perangkat turun.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'approved', title: 'Hotspot Voucher Otomatis Berbasis Mikrotik',
      desc: 'Manajemen hotspot sekolah dengan voucher otomatis, pembatasan kuota, dan laporan penggunaan.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'pending',  title: 'VPN Server untuk Akses Lab Jarak Jauh',
      desc: 'Server VPN untuk mengakses perangkat laboratorium dari luar sekolah dengan autentikasi berlapis.' },
    { student: 'siswa_kimia13', type: 'KA',  status: 'approved', title: 'Analisis Kadar Vitamin C pada Buah Lokal',
      desc: 'Penetapan kadar vitamin C pada buah lokal dengan metode titrasi iodometri, dibandingkan dengan standar literatur.' },
    { student: 'siswa_kimia13', type: 'KA',  status: 'approved', title: 'Uji Kualitas Air Sungai Citarum',
      desc: 'Pengujian parameter kimia air sungai meliputi pH, BOD, dan kadar logam berat, disusun sebagai laporan riset.' },
  ]

  const createdProjects: { id: string; title: string }[] = []
  for (let i = 0; i < projectSeed.length; i++) {
    const p        = projectSeed[i]
    const approved = p.status === 'approved'

    const created = await prisma.projects.create({
      data: {
        studentId:   u[p.student].id,
        advisorId:   u['guru13'].id,
        type:        p.type as ProjectType,
        projectType: p.type as ProjectType,
        title:       p.title,
        description: p.desc,
        year:        2026,
        status:      p.status,
        reviewedBy:  approved ? u['guru13'].id : null,
        publishedAt: approved ? new Date() : null,
        reviewNotes: approved ? 'Karya layak ditampilkan di galeri publik.' : null,
        viewCount:   approved ? 10 + i * 7 : 0,
      },
    })
    createdProjects.push({ id: created.id, title: p.title })

    await prisma.projectsMedia.createMany({
      data: [
        { projectId: created.id, url: IMG(`kandaga-${i}-a`), type: 'photo', order: 0 },
        { projectId: created.id, url: IMG(`kandaga-${i}-b`), type: 'photo', order: 1 },
      ],
    })
  }
  console.log(`  ✓ ${createdProjects.length} karya + media (6 approved, 2 pending)`)

  // ── Permintaan kontak (antrian BKK) ────────────────────────────────────
  const approvedTitles = projectSeed
    .filter((p) => p.status === 'approved')
    .map((p) => p.title)

  const contactSeed: {
    project: string; purpose: string; status: string; message: string; bkkNotes?: string
  }[] = [
    { project: approvedTitles[0], purpose: 'magang', status: 'terkirim',
      message: 'Kami ingin menawarkan program magang 3 bulan untuk siswa pembuat karya ini. Mohon dibantu penghubungan.' },
    { project: approvedTitles[3], purpose: 'kerja', status: 'ditinjau',
      message: 'Kami tertarik merekrut siswa ini sebagai network engineer junior setelah lulus. Mohon informasi lanjutan.' },
    { project: approvedTitles[1], purpose: 'kolaborasi', status: 'diteruskan',
      message: 'Kami ingin berkolaborasi mengembangkan karya ini menjadi produk yang dipakai sekolah lain.',
      bkkNotes: 'Sudah dihubungkan dengan siswa dan guru pembimbing.' },
    { project: approvedTitles[5], purpose: 'magang', status: 'ditolak',
      message: 'Kami ingin mengajak siswa ini magang di laboratorium kami.',
      bkkNotes: 'Ditolak: kuota magang jurusan ini sudah terpenuhi pada periode yang diminta.' },
  ]

  for (const c of contactSeed) {
    const target = createdProjects.find((p) => p.title === c.project)
    if (!target) continue
    await prisma.contactRequests.create({
      data: {
        companyId:  u['mitra_perusahaan'].id,
        projectId:  target.id,
        purpose:    c.purpose,
        message:    c.message,
        status:     c.status,
        bkkNotes:   c.bkkNotes ?? null,
        reviewedBy: c.status === 'terkirim' ? null : u['bkk13'].id,
        reviewedAt: c.status === 'terkirim' ? null : new Date(),
      },
    })
  }
  console.log(`  ✓ ${contactSeed.length} permintaan kontak (2 aktif, 2 riwayat)`)

  // Isi tabel yang selama ini hanya dihapus tanpa pernah diisi (lihat seed-demo.ts)
  await seedDemoTambahan(prisma)

  console.log('\n✅ Seeding completed!')
  console.log('─────────────────────────────────')

  console.log('Demo login credentials (semua password: password123):')
  console.log('  siswa13 / password123          → /student')
  console.log('  admin13 / password123          → /admin/dashboard')
  console.log('  mitra_perusahaan / password123 → /company  (perusahaan disetujui)')
  console.log('  guru13 / password123           → /teacher')
  console.log('  bkk13 / password123            → /bkk')
  console.log('  siswa_tkj13 / password123      → /student')
  console.log('  siswa_kimia13 / password123    → /student')
  console.log('  dzaha / password123            → /mitra/menunggu  (perusahaan pending)')

  console.log('─────────────────────────────────')
}

function mapRole(role: string): Role {
  switch (role.toLowerCase()) {
    case 'admin':   return Role.Admin
    case 'student': return Role.Student
    case 'teacher': return Role.Teacher
    case 'company': return Role.Company
    case 'bkk':     return Role.BKK
    default:        return Role.Student
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
