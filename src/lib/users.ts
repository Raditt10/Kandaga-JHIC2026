export type Role = "student" | "admin" | "company" | "teacher" | "bkk"

export interface UserAccount {
  id: string
  username: string
  email: string
  password: string
  role: Role
}

// Initial pre-configured seed users for all 5 roles
const initialUsers: UserAccount[] = [
  {
    id: "user-student-1",
    username: "siswa13",
    email: "siswa@smkn13bdg.sch.id",
    password: "password123",
    role: "student",
  },
  {
    id: "user-admin-1",
    username: "admin13",
    email: "admin@smkn13bdg.sch.id",
    password: "password123",
    role: "admin",
  },
  {
    id: "user-company-[#1]",
    username: "mitra_perusahaan",
    email: "hr@mitrainovasi.co.id",
    password: "password123",
    role: "company",
  },
  {
    id: "user-teacher-1",
    username: "guru13",
    email: "guru@smkn13bdg.sch.id",
    password: "password123",
    role: "teacher",
  },
  {
    id: "user-bkk-1",
    username: "bkk13",
    email: "bkk@smkn13bdg.sch.id",
    password: "password123",
    role: "bkk",
  },
]

// Global in-memory storage for runtime users
const globalForUsers = globalThis as unknown as {
  kandagaUsers?: UserAccount[]
}

if (!globalForUsers.kandagaUsers) {
  globalForUsers.kandagaUsers = [...initialUsers]
}

export const usersDatabase = globalForUsers.kandagaUsers!

export function normalizeRole(roleInput: string): Role {
  const r = roleInput.trim().toLowerCase()
  if (r === "students" || r === "student" || r === "siswa") return "student"
  if (r === "admin" || r === "administrator") return "admin"
  if (r === "company" || r === "perusahaan" || r === "mitra") return "company"
  if (r === "teacher" || r === "guru") return "teacher"
  if (r === "bkk") return "bkk"
  return "student"
}

export function findUserByEmailOrUsername(identifier: string): UserAccount | undefined {
  const query = identifier.trim().toLowerCase()
  return usersDatabase.find(
    (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  )
}

export function createUser(data: {
  username: string
  email: string
  password: string
  role: string
}): { user?: UserAccount; error?: string } {
  const { username, email, password, role } = data

  if (!username || !username.trim()) {
    return { error: "Username tidak boleh kosong (non-nullable)" }
  }
  if (!email || !email.trim()) {
    return { error: "Email tidak boleh kosong (non-nullable)" }
  }
  if (!password || !password.trim()) {
    return { error: "Password tidak boleh kosong (non-nullable)" }
  }
  if (!role || !role.trim()) {
    return { error: "Role tidak boleh kosong (non-nullable)" }
  }

  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  // Check uniqueness
  const existingUser = usersDatabase.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername ||
      u.email.toLowerCase() === normalizedEmail
  )

  if (existingUser) {
    return { error: "Username atau Email sudah terdaftar dalam sistem" }
  }

  const validRole = normalizeRole(role)

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    username: username.trim(),
    email: email.trim(),
    password: password.trim(),
    role: validRole,
  }

  usersDatabase.push(newUser)
  return { user: newUser }
}
