// scripts/delete-users.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus akun yang dibuat...");

  const emails = ["admin@gmail.com", "user@gmail.com", "user123@gmail.com"];

  for (const email of emails) {
    const user = await prisma.users.findUnique({
      where: { email },
      include: { studentProfile: true },
    });

    if (user) {
      if (user.studentProfile) {
        await prisma.student.delete({
          where: { userId: user.id },
        });
        console.log(`[OK] Profil Siswa untuk ${email} berhasil dihapus.`);
      }

      await prisma.users.delete({
        where: { id: user.id },
      });
      console.log(`[OK] User ${email} berhasil dihapus dari database.`);
    } else {
      console.log(`[INFO] User ${email} tidak ditemukan di database.`);
    }
  }

  console.log("\nSelesai! Akun admin@gmail.com, user@gmail.com, dan user123@gmail.com telah dihapus.");
}

main()
  .catch((e) => {
    console.error("Gagal menghapus user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
