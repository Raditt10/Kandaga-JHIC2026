import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireRole } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["student", "teacher", "company", "bkk", "admin"]);
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan dalam permintaan." }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/") ||
      ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"].includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Format berkas harus berupa gambar (JPG, PNG, WebP) atau video (MP4, WebM, MOV)." },
        { status: 400 }
      );
    }

    // Gambar maks 10 MB, video maks 100 MB
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran berkas melebihi batas maksimal ${isVideo ? "100MB (video)" : "10MB (gambar)"}.` },
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

    // Cache uploaded image in Redis for instant subsequent access
    const { setFileCache } = await import("@/lib/redis");
    await setFileCache(`cache:media:${filename}`, buffer, file.type, 86400 * 7);

    const publicUrl = `/assets/uploads/${filename}`;
    const mediaType = isVideo ? "video" : "photo";

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type,
        mediaType,
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
