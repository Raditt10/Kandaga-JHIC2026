import { NextResponse } from "next/server"
import { createUser } from "@/lib/users"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, email, password, role } = body

    // Enforce 4 crucial non-nullable fields
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username wajib diisi (non-nullable)" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email wajib diisi (non-nullable)" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { error: "Password wajib diisi (non-nullable)" },
        { status: 400 }
      )
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { error: "Role wajib dipilih (non-nullable)" },
        { status: 400 }
      )
    }

    const result = createUser({ username, email, password, role })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: "Registrasi berhasil!",
        user: {
          id: result.user?.id,
          username: result.user?.username,
          email: result.user?.email,
          role: result.user?.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran. Pastikan data valid." },
      { status: 500 }
    )
  }
}
