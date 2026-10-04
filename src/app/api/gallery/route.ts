import { NextRequest, NextResponse } from "next/server";
import { getGalleryProjects, PaginatedGalleryResult } from "@/lib/gallery-server";
import { getCache, setCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const major = (searchParams.get("major") || searchParams.get("jurusan") || "semua").toLowerCase();
    const q = (searchParams.get("q") || "").trim();
    const sort = (searchParams.get("sort") || "terbaru").toLowerCase();

    const validPage = isNaN(page) ? 1 : Math.max(1, page);
    const validLimit = isNaN(limit) ? 12 : Math.min(50, Math.max(1, limit));

    // Cache key for Redis
    const cacheKey = `gallery:list:${major}:${encodeURIComponent(q)}:${sort}:${validPage}:${validLimit}`;

    // Attempt cache retrieval from Redis
    const cachedResult = await getCache<PaginatedGalleryResult>(cacheKey);
    if (cachedResult && Array.isArray(cachedResult.projects)) {
      return NextResponse.json(
        {
          projects: cachedResult.projects,
          pagination: {
            page: cachedResult.page,
            limit: cachedResult.limit,
            total: cachedResult.total,
            totalPages: cachedResult.totalPages,
          },
        },
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const result = await getGalleryProjects({
      page: validPage,
      limit: validLimit,
      major,
      q,
      sort,
    });

    // Store in Redis (TTL: 300 seconds / 5 minutes)
    await setCache(cacheKey, result, 300);

    return NextResponse.json(
      {
        projects: result.projects,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/gallery:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}