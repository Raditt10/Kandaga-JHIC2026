// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start Seeding database...')

  // Clear existing records (urutan penting: hapus tabel dependen dulu)
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

  // ── Users ──
  const userdata = [
    { name: "Alice Smith",    email: "alicesmith@gmail.com",   passwordHash: "pass1234", role: "student"  },
    { name: "Bob Jones",      email: "bobjones@gmail.com",     passwordHash: "pass1234", role: "teacher"  },
    { name: "Charlie Brown",  email: "charliebrown@gmail.com", passwordHash: "pass1234", role: "company"  },
    { name: "David Wilson",   email: "davidwilson@gmail.com",  passwordHash: "pass1234", role: "admin"    },
    { name: "Eve Martinez",   email: "evemartinez@gmail.com",  passwordHash: "pass1234", role: "bkk"      },
  ]

  for (const user of userdata) {
    await prisma.users.create({
      data: {
        name:         user.name,
        email:        user.email,
        passwordHash: user.passwordHash,
        role:         mapRole(user.role),
      },
    })
  }

  // ── Majors ──
  const majorsdata = [
    {
      slug: "analis-kimia",
      name: "Analis Kimia",
      fullName: "Analis Kimia",
      image: "/images/hero-kimia.jpg",
      link: "/majors/chemistry-analyst",
      description: "Jurusan yang berfokus pada analisis laboratorium, pengujian bahan kimia, dan riset berbasis sains terapan.",
    },
    {
      slug: "tkj",
      name: "TKJ",
      fullName: "Teknik Komputer Jaringan",
      image: "/images/hero-tkj.jpg",
      link: "/majors/computer-network-engineer",
      description: "Jurusan yang mempelajari infrastruktur jaringan komputer, keamanan sistem, dan administrasi server.",
    },
    {
      slug: "rpl",
      name: "RPL",
      fullName: "Rekayasa Perangkat Lunak",
      image: "/images/preview-rpl.jpg",
      link: "/majors/software-engineer",
      description: "Jurusan yang fokus pada pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.",
    },
  ]

  for (const major of majorsdata) {
    await prisma.major.create({
      data: {
        name:        major.name,
        fullName:    major.fullName,
        image:       major.image,
        link:        major.link,
        description: major.description,
      },
    })
  }

  console.log('✅ Seeding completed successfully.')
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
    console.error('❌ Error while seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
