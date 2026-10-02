import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/data/galleryData";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const updates = await req.json();

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil diperbarui",
      id,
      updates,
    });
  } catch (error) {
    console.error("PUT /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui proyek" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json({
      success: true,
      message: `Proyek ${id} berhasil dihapus`,
    });
  } catch (error) {
    console.error("DELETE /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus proyek" }, { status: 500 });
  }
}
