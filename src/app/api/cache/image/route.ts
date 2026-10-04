import { NextRequest, NextResponse } from "next/server";
import { getFileCache, setFileCache } from "@/lib/redis";
import crypto from "crypto";

const ALLOWED_HOSTS = [
  "picsum.photos",
  "fastly.picsum.photos",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
];

function isPrivateIpOrHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return true;
  }
  // Check private IP ranges
  if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(h)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(h)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "Parameter url diperlukan" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: "URL gambar tidak valid" }, { status: 400 });
    }

    // Only allow HTTP/HTTPS
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Protokol URL tidak didukung" }, { status: 400 });
    }

    // SSRF prevention: disallow local/private network addresses
    if (isPrivateIpOrHost(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Akses host privat tidak diizinkan" }, { status: 403 });
    }

    // SSRF prevention: ensure host is in allowed hosts list
    const isAllowedHost = ALLOWED_HOSTS.some(
      (allowed) => parsedUrl.hostname === allowed || parsedUrl.hostname.endsWith("." + allowed)
    );
    if (!isAllowedHost) {
      return NextResponse.json(
        { error: `Host gambar "${parsedUrl.hostname}" tidak berada dalam daftar domain yang diizinkan` },
        { status: 403 }
      );
    }

    // Compute unique SHA-256 hash of entire URL to prevent collision
    const urlHash = crypto.createHash("sha256").update(imageUrl).digest("hex");
    const cacheKey = `cache:img:${urlHash}`;

    // 1. Check Redis cache
    const cached = await getFileCache(cacheKey);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=604800, immutable",
          "X-Cache": "HIT",
        },
      });
    }

    // 2. Fetch remote image with timeout and user-agent
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Kandaga-Image-Cache/1.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal mengunduh gambar remote" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Konten yang diunduh bukan berupa berkas gambar" }, { status: 400 });
    }

    // Max 10MB limit
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
    if (contentLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran berkas gambar melebihi 10MB" }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran berkas gambar melebihi 10MB" }, { status: 400 });
    }
    const buffer = Buffer.from(arrayBuffer);

    // 3. Cache into Redis (TTL: 7 days)
    await setFileCache(cacheKey, buffer, contentType, 86400 * 7);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error in /api/cache/image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
