// prisma/seed.ts
import { PrismaClient, Role, ProjectType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start Seeding database...')

  // Clear existing records to prevent duplicates (optional)
  await prisma.users.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.company.deleteMany()
  await prisma.projects.deleteMany()
  await prisma.major.deleteMany()
  await prisma.projectsMedia.deleteMany()
  await prisma.projectsTool.deleteMany()
  await prisma.skillTool.deleteMany()
  await prisma.badges.deleteMany()
  await prisma.projectsBadge.deleteMany()
  await prisma.bookmarks.deleteMany()
  await prisma.contactRequests.deleteMany()
  await prisma.partnerships.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.auditLogs.deleteMany()
  console.log('🌱 remove initial data complete. Seeding database...')


  const userdata = [
    {
      name: "Alice Smith",
      email: "alicesmith@gmail.com",
      passwordHash: "pass1234",
      role: "student"
    },
    {
      name: "Bob Jones",
      email: "bobjones@gmail.com",
      passwordHash: "pass1234",
      role: "teacher"
    },
    {
      name: "Charlie Brown",
      email: "charliebrown@gmail.com",
      passwordHash: "pass1234",
      role: "company"
    },
    {
      name: "David Wilson",
      email: "davidwilson@gmail.com",
      passwordHash: "pass1234",
      role: "admin"
    },
    {
      name: "Eve Martinez",
      email: "evemartinez@gmail.com",
      passwordHash: "pass1234",
      role: "bkk"
    }
  ]

  // Add your seed data here
  for (const user of userdata) {
    const users = await prisma.users.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: mapRole(user.role),
      }
    });
  };

  const majorsdata = [
    {
      slug: "analis-kimia",
      name: "Analis Kimia",
      fullName: "Analis Kimia",
      image: "/images/hero-kimia.jpg",
      link: "/majors/chemistry-analyst",
      description:
        "Jurusan yang berfokus pada analisis laboratorium, pengujian bahan kimia, dan riset berbasis sains terapan.",
    },
    {
      slug: "tkj",
      name: "TKJ",
      fullName: "Teknik Komputer Jaringan",
      image: "/images/hero-tkj.jpg",
      link: "/majors/computer-network-engineer",
      description:
        "Jurusan yang mempelajari infrastruktur jaringan komputer, keamanan sistem, dan administrasi server.",
    },
    {
      slug: "rpl",
      name: "RPL",
      fullName: "Rekayasa Perangkat Lunak",
      image: "/images/preview-rpl.jpg",
      link: "/majors/software-engineer",
      description:
        "Jurusan yang fokus pada pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.",
    },
  ];

  for (const major of majorsdata) {
    await prisma.major.create({
      data: {
        slug: major.slug,
        name: major.name,
        fullName: major.fullName,
        image: major.image,
        link: major.link,
        description: major.description,
      }
    });
  };

  const projectsdata = [
    {
      id: "riset-logam-berat",
      title: "Riset Analisis Kadar Logam Berat",
      studentId: 1,
      description: "Penelitian laboratorium tentang kadar logam berat pada sampel air sungai di sekitar Bandung.",
      major: "analis-kimia",
      image: "/images/preview-kimia.jpg",
      status: "verified",
      year: 2025,
    },
    {
      id: "absensi-iot",
      title: "Sistem Absensi Wajah Berbasis IoT",
      studentId: 2,
      description: "Karya TKJ yang memanfaatkan pengenalan wajah untuk mencatat kehadiran siswa secara otomatis.",
      major: "web",
      image: "/images/preview-iot.jpg",
      status: "featured",
      year: 2025,
    },
    {
      id: "manajemen-perpustakaan",
      title: "Aplikasi Manajemen Perpustakaan",
      studentId: 3,
      description: "Sistem manajemen perpustakaan digital dengan fitur pencarian, peminjaman, dan notifikasi.",
      major: "rpl",
      image: "/images/preview-rpl.jpg",
      status: "verified",
      year: 2025,
    },
    {
      id: "kolaborasi-siswa",
      title: "Platform Kolaborasi Siswa",
      studentId: 4,
      description: "Web app untuk koordinasi proyek antar jurusan dengan fitur task management dan chat real-time.",
      major: "rpl",
      image: "/images/hero-kolaborasi.jpg",
      status: "verified",
      year: 2024,
    },
    {
      id: "monitoring-jaringan",
      title: "Monitoring Jaringan Sekolah",
      studentId: 5,
      description: "Dashboard monitoring kondisi jaringan LAN sekolah dengan alert otomatis saat terjadi gangguan.",
      major: "tkj",
      image: "/images/hero-tkj.jpg",
      status: "verified",
      year: 2024,
    },
  ];

  for (const project of projectsdata) {
    await prisma.projects.create({
      data: {
        id: project.id,
        studentId: project.studentId.toString(),
        title: project.title,
        description: project.description,
        type: mapProjectType(project.major),
        media: {
          create: [
            { 
              url: project.image, 
              type: 'image' 
            }
          ]
        },
        status: project.status,
        year: project.year,
      }
    });
  };

  console.log('✅ Seeding completed successfully.')
}

function mapRole(role: string) {
  switch (role) {
    case 'admin':
      return Role.Admin
    case 'student':
      return Role.Student
    case 'teacher':
      return Role.Teacher
    case 'company':
      return Role.Company
    default:
      return Role.BKK
  }
}

function mapProjectType(value: string) {
  switch (value){
    case 'rpl': return ProjectType.RPL
    case 'tkj': return ProjectType.TKJ
    case 'ka': return ProjectType.KA
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
