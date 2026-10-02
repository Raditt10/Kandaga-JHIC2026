// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  console.log('\n✅ Seeding completed!')
  console.log('─────────────────────────────────')
  console.log('Demo login credentials:')
  console.log('  siswa13 / password123      → /student')
  console.log('  admin13 / password123      → /admin/dashboard')
  console.log('  mitra_perusahaan / password123 → /company')
  console.log('  guru13 / password123       → /teacher')
  console.log('  bkk13 / password123        → /bkk')
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
