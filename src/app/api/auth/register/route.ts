import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

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

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.users.create({
      data: {
        name: username,
        email,
        passwordHash: hashedPassword,
        role: mapRole(role)
      }
    })

    return NextResponse.json(
      {
        message: "Registrasi berhasil!",
        user: {
          id: result.id,
          username: result.name,
          email: result.email,
          role: result.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "terjadi kesalahan saat registrasi akun. " },
      { status: 500 }
    )
  }
}

function mapRole(value: string) {
  switch (value.trim().toLowerCase()) {
    case 'student':
      return Role.Student
    case 'teacher':
      return Role.Teacher
    case 'company':
      return Role.Company
    case 'admin':
      return Role.Admin
    case 'bkk':
      return Role.BKK
    default:
      return Role.Student
  }
}