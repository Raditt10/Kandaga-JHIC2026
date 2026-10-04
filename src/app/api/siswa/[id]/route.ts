import { NextRequest, NextResponse } from "next/server";
import { getStudentProfileById, StudentProfileResult } from "@/lib/student-server";
import { getCache, setCache } from "@/lib/redis";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID siswa tidak valid" }, { status: 400 });
    }

    const cacheKey = `student:profile:${id}`;

    // Attempt cache retrieval from Redis
    const cachedData = await getCache<StudentProfileResult>(cacheKey);
    if (cachedData && cachedData.student) {
      return NextResponse.json(
        {
          success: true,
          student: cachedData.student,
          projects: cachedData.projects,
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

    const result = await getStudentProfileById(id);

    if (!result || !result.student) {
      return NextResponse.json(
        { success: false, error: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cache in Redis (TTL: 600 seconds / 10 minutes)
    await setCache(cacheKey, result, 600);

    return NextResponse.json(
      {
        success: true,
        student: result.student,
        projects: result.projects,
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
    console.error("GET /api/siswa/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil profil siswa" },
      { status: 500 }
    );
  }
}
