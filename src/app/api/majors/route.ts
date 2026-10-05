import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const majors = await prisma.major.findMany({
      select: {
        id: true,
        name: true,
        fullName: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(majors)
  } catch (error) {
    console.error("Error in GET /api/majors:", error)
    return NextResponse.json({ error: "Gagal memuat jurusan." }, { status: 500 })
  }
}
