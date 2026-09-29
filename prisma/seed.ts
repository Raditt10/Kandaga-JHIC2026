// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing records to prevent duplicates (optional)
  await prisma.user.deleteMany()

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
    const users = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: mapRole(user.role),
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

main()
  .catch((e) => {
    console.error('❌ Error while seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
