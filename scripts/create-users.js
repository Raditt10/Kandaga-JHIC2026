// scripts/create-users.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Membuat user di database...");

  const hash = await bcrypt.hash("password123", 12);

  // 1. Buat / Update Akun Admin
  const admin = await prisma.users.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      passwordHash: hash,
      role: "Admin",
      status: "aktif",
    },
    create: {
      name: "Admin",
      email: "admin@gmail.com",
      passwordHash: hash,
      role: "Admin",
      status: "aktif",
    },
  });
  console.log(`[OK] Admin berhasil dibuat: ${admin.email} (Role: ${admin.role})`);

  // Cari major (misal RPL) untuk profil siswa
  let major = await prisma.major.findFirst({
    where: { name: "RPL" },
  });

  if (!major) {
    major = await prisma.major.findFirst();
  }

  // 2. Buat / Update Akun Siswa (Student): user@gmail.com & user123@gmail.com
  const studentAccounts = [
    {
      name: "user",
      email: "user@gmail.com",
      nis: "2026139998",
      class: "XII RPL 1",
      bio: "Akun siswa demo 1",
    },
    {
      name: "user123",
      email: "user123@gmail.com",
      nis: "2026139999",
      class: "XII RPL 1",
      bio: "Akun siswa demo 2",
    },
  ];

  for (const s of studentAccounts) {
    const student = await prisma.users.upsert({
      where: { email: s.email },
      update: {
        passwordHash: hash,
        role: "Student",
        status: "aktif",
      },
      create: {
        name: s.name,
        email: s.email,
        passwordHash: hash,
        role: "Student",
        status: "aktif",
      },
    });
    console.log(`[OK] Student berhasil dibuat: ${student.email} (Role: ${student.role})`);

    if (major) {
      await prisma.student.upsert({
        where: { userId: student.id },
        update: {
          majorId: major.id,
          class: s.class,
          status: "aktif",
        },
        create: {
          userId: student.id,
          majorId: major.id,
          nis: s.nis,
          class: s.class,
          generation: 2026,
          status: "aktif",
          bio: s.bio,
        },
      });
      console.log(`[OK] Profil Siswa (${student.email}) berhasil dihubungkan ke jurusan: ${major.name}`);
    }
  }

  console.log("\nSelesai! Ketiga akun siap digunakan untuk login:");
  console.log("1. Admin   -> Email: admin@gmail.com   | Password: password123");
  console.log("2. Student -> Email: user@gmail.com     | Password: password123");
  console.log("3. Student -> Email: user123@gmail.com  | Password: password123\n");
}

main()
  .catch((e) => {
    console.error("Gagal membuat user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
