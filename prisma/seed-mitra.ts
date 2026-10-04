// prisma/seed-mitra.ts
//
// Seed TAMBAHAN untuk data mitra perusahaan (BKK) — aman dijalankan berulang.
// Tidak menghapus data apa pun (beda dengan prisma/seed.ts yang reset total).
//
// Jalankan:
//   npx tsx prisma/seed-mitra.ts
//
// Password semua akun mitra: "password123" (sama seperti akun demo lain).

import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SATU_HARI = 24 * 60 * 60 * 1000
const hariLalu = (n: number) => new Date(Date.now() - n * SATU_HARI)

type StatusVerifikasi = 'pending' | 'disetujui' | 'ditolak'

type SeedMitra = {
  namaPerusahaan: string
  bidang: string
  namaKontak: string
  email: string
  dokumenUrl: string
  status: StatusVerifikasi
  terdaftarHariLalu: number
  diverifikasiHariLalu?: number
  catatanVerifikasi?: string
}

const mitra: SeedMitra[] = [
  // ── Menunggu verifikasi (antrian FIFO: terlama di atas) ─────────────
  {
    namaPerusahaan: 'PT Solusi Digital Nusantara',
    bidang: 'Teknologi Informasi & Pengembangan Perangkat Lunak',
    namaKontak: 'Rizky Maulana',
    email: 'rizky.maulana@solusidigital.co.id',
    dokumenUrl: '/docs/surat-orisinalitas.pdf',
    status: 'pending',
    terdaftarHariLalu: 24,
  },
  {
    namaPerusahaan: 'CV Karya Teknologi Bandung',
    bidang: 'Rekayasa Perangkat Lunak & Konsultasi IT',
    namaKontak: 'Dewi Kartika Sari',
    email: 'dewi.kartika@karyateknologi.co.id',
    dokumenUrl: '/docs/laporan-akhir.pdf',
    status: 'pending',
    terdaftarHariLalu: 15,
  },
  {
    namaPerusahaan: 'PT Kimia Analitik Nusantara',
    bidang: 'Laboratorium Pengujian & Analisis Kimia',
    namaKontak: 'Andi Pratama',
    email: 'andi.pratama@kimiaanalitik.co.id',
    dokumenUrl: '/docs/surat-orisinalitas.pdf',
    status: 'pending',
    terdaftarHariLalu: 6,
  },

  // ── Disetujui ───────────────────────────────────────────────────────
  {
    namaPerusahaan: 'PT Jaringan Nusantara Telekomunikasi',
    bidang: 'Telekomunikasi & Infrastruktur Jaringan',
    namaKontak: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@jaringan-nusantara.co.id',
    dokumenUrl: '/docs/surat-orisinalitas.pdf',
    status: 'disetujui',
    terdaftarHariLalu: 96,
    diverifikasiHariLalu: 90,
  },
  {
    namaPerusahaan: 'PT Logistik Cepat Nusantara',
    bidang: 'Logistik & Rantai Pasok',
    namaKontak: 'Maya Lestari',
    email: 'maya.lestari@logistikcepat.co.id',
    dokumenUrl: '/docs/laporan-akhir.pdf',
    status: 'disetujui',
    terdaftarHariLalu: 72,
    diverifikasiHariLalu: 66,
  },
  {
    namaPerusahaan: 'PT Manufaktur Presisi Cimahi',
    bidang: 'Manufaktur & Otomasi Industri',
    namaKontak: 'Budi Santoso',
    email: 'budi.santoso@presisicimahi.co.id',
    dokumenUrl: '/docs/surat-orisinalitas.pdf',
    status: 'disetujui',
    terdaftarHariLalu: 48,
    diverifikasiHariLalu: 41,
  },

  // ── Ditolak (wajib disertai catatan — constraint perusahaan_catatan_ditolak_chk)
  {
    namaPerusahaan: 'CV Media Kreatif Bandung',
    bidang: 'Desain Grafis & Multimedia',
    namaKontak: 'Fajar Nugraha',
    email: 'fajar.nugraha@mediakreatif.co.id',
    dokumenUrl: '/docs/laporan-akhir.pdf',
    status: 'ditolak',
    terdaftarHariLalu: 36,
    diverifikasiHariLalu: 30,
    catatanVerifikasi:
      'Dokumen NIB tidak terbaca dan alamat perusahaan tidak sesuai dengan data resmi. Mohon unggah ulang surat izin usaha yang jelas.',
  },
  {
    namaPerusahaan: 'PT Sumber Rekrutmen Abadi',
    bidang: 'Jasa Penyediaan Tenaga Kerja',
    namaKontak: 'Hendra Wijaya',
    email: 'hendra.wijaya@sumberrekrutmen.co.id',
    dokumenUrl: '/docs/laporan-akhir.pdf',
    status: 'ditolak',
    terdaftarHariLalu: 30,
    diverifikasiHariLalu: 26,
    catatanVerifikasi:
      'Bidang usaha tidak relevan dengan program keahlian siswa dan dokumen legalitas perusahaan tidak dilampirkan.',
  },
]

export async function main() {
  console.log('🌱 Seed mitra perusahaan BKK (non-destruktif)...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const verifikator = await prisma.users.findFirst({ where: { role: Role.BKK } })
  if (!verifikator) {
    console.log('⚠️  User BKK tidak ditemukan — kolom verified_by akan dikosongkan.')
  }

  let dibuat = 0
  let diperbarui = 0

  for (const m of mitra) {
    const userLama = await prisma.users.findUnique({ where: { email: m.email } })

    const user = userLama
      ? await prisma.users.update({
          where: { id: userLama.id },
          data: { name: m.namaKontak, role: Role.Company, status: 'aktif' },
        })
      : await prisma.users.create({
          data: {
            name: m.namaKontak,
            email: m.email,
            passwordHash,
            role: Role.Company,
            status: 'aktif',
            createdAt: hariLalu(m.terdaftarHariLalu),
          },
        })

    const dataPerusahaan = {
      name: m.namaPerusahaan,
      field: m.bidang,
      documentUrl: m.dokumenUrl,
      verificationStatus: m.status,
      verifiedBy: m.status === 'disetujui' ? verifikator?.id ?? null : null,
      verifiedAt:
        m.status !== 'pending' && m.diverifikasiHariLalu !== undefined
          ? hariLalu(m.diverifikasiHariLalu)
          : null,
      catatanVerifikasi: m.status === 'ditolak' ? m.catatanVerifikasi ?? null : null,
    }

    const perusahaanLama = await prisma.company.findUnique({ where: { userId: user.id } })

    if (perusahaanLama) {
      await prisma.company.update({ where: { userId: user.id }, data: dataPerusahaan })
      diperbarui++
      console.log(`  ↻ Diperbarui: ${m.namaPerusahaan} — ${m.status}`)
    } else {
      await prisma.company.create({ data: { userId: user.id, ...dataPerusahaan } })
      dibuat++
      console.log(`  ✓ Dibuat:     ${m.namaPerusahaan} — ${m.status}`)
    }
  }

  const [total, pending, disetujui, ditolak] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { verificationStatus: 'pending' } }),
    prisma.company.count({ where: { verificationStatus: 'disetujui' } }),
    prisma.company.count({ where: { verificationStatus: 'ditolak' } }),
  ])

  console.log('\n✅ Selesai.')
  console.log(`   Baru dibuat: ${dibuat} · Diperbarui: ${diperbarui}`)
  console.log(`   Total mitra : ${total}`)
  console.log(`   • Menunggu verifikasi : ${pending}`)
  console.log(`   • Disetujui           : ${disetujui}`)
  console.log(`   • Ditolak             : ${ditolak}`)
  console.log('\nAkun mitra bisa login dengan password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed mitra gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
