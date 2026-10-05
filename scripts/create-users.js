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

  // 2. Buat / Update Akun Student
  const student = await prisma.users.upsert({
    where: { email: "user123@gmail.com" },
    update: {
      passwordHash: hash,
      role: "Student",
      status: "aktif",
    },
    create: {
      name: "user123",
      email: "user123@gmail.com",
      passwordHash: hash,
      role: "Student",
      status: "aktif",
    },
  });
  console.log(`[OK] Student berhasil dibuat: ${student.email} (Role: ${student.role})`);

  // 3. Pastikan profil Student terhubung dengan Major (misal RPL)
  let major = await prisma.major.findFirst({
    where: { name: "RPL" },
  });

  if (!major) {
    major = await prisma.major.findFirst();
  }

  if (major) {
    await prisma.student.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        majorId: major.id,
        nis: "2026139999",
        class: "XII RPL 1",
        generation: 2026,
        status: "aktif",
        bio: "Akun siswa demo",
      },
    });
    console.log(`[OK] Profil Siswa berhasil dihubungkan ke jurusan: ${major.name}`);
  }

  console.log("\nSelesai! Kedua akun siap digunakan untuk login:");
  console.log("1. Admin  -> Email: admin@gmail.com | Password: password123");
  console.log("2. Student -> Email: user123@gmail.com | Password: password123\n");
}

main()
  .catch((e) => {
    console.error("Gagal membuat user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
