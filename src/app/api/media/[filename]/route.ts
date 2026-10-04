import { NextRequest, NextResponse } from "next/server";
import { getFileCache, setFileCache } from "@/lib/redis";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const cacheKey = `cache:media:${filename}`;

    // 1. Try to serve directly from Redis cache
    const cachedFile = await getFileCache(cacheKey);
    if (cachedFile) {
      return new NextResponse(new Uint8Array(cachedFile.buffer), {
        status: 200,
        headers: {
          "Content-Type": cachedFile.contentType,
          "Cache-Control": "public, max-age=604800, immutable",
          "X-Cache": "HIT",
        },
      });
    }

    // 2. Fall back to local file on disk: check public/assets/uploads and public/images
    const uploadDir = path.join(process.cwd(), "public", "assets", "uploads");
    const imagesDir = path.join(process.cwd(), "public", "images");

    let fileBuffer: Buffer | null = null;

    try {
      fileBuffer = await readFile(path.join(uploadDir, filename));
    } catch {
      try {
        fileBuffer = await readFile(path.join(imagesDir, filename));
      } catch {
        fileBuffer = null;
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Populate Redis cache for future requests (TTL: 7 days)
    await setFileCache(cacheKey, fileBuffer, contentType, 86400 * 7);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error serving cached media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
