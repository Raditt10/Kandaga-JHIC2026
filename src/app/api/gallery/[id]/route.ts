import { NextRequest, NextResponse } from "next/server";
import { getGalleryProjectById, getRelatedProjects } from "@/lib/gallery-server";
import { getCache, setCache } from "@/lib/redis";
import type { GalleryProjectItem } from "@/types";
import { ProjectType } from "@prisma/client";

interface GalleryDetailPayload {
  project: GalleryProjectItem;
  relatedProjects: GalleryProjectItem[];
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const cacheKey = `gallery:detail:${id}`;

    // Attempt cache retrieval from Redis
    const cachedData = await getCache<GalleryDetailPayload | GalleryProjectItem>(cacheKey);
    if (cachedData) {
      const responseData: GalleryDetailPayload =
        "project" in cachedData && cachedData.project
          ? (cachedData as GalleryDetailPayload)
          : { project: cachedData as GalleryProjectItem, relatedProjects: [] };

      return NextResponse.json(
        responseData,
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const project = await getGalleryProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const pType =
      project.major === "analis-kimia"
        ? ProjectType.KA
        : project.major === "tkj"
        ? ProjectType.TKJ
        : ProjectType.RPL;

    const relatedProjects = await getRelatedProjects(project.id, pType, 3);

    const payload: GalleryDetailPayload = {
      project,
      relatedProjects,
    };

    // Cache in Redis (TTL: 600 seconds / 10 minutes)
    await setCache(cacheKey, payload, 600);

    return NextResponse.json(
      payload,
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery project" },
      { status: 500 }
    );
  }
}