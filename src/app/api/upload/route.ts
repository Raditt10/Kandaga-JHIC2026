import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    // Validasi tipe berkas gambar
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Format berkas harus berupa gambar (JPG, PNG, WebP, SVG)" },
        { status: 400 }
      );
    }

    // Batasi ukuran gambar (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimal 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ambil ekstensi berkas asli atau default ke .jpg
    const originalExt = path.extname(file.name) || ".jpg";
    const cleanExt = originalExt.toLowerCase().replace(/[^a-z0-9.]/g, "");
    const safeExt = cleanExt || ".jpg";

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `kandaga-${timestamp}-${randomSuffix}${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "assets", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/assets/uploads/${filename}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar ke server" },
      { status: 500 }
    );
  }
}
