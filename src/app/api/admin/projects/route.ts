import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const whereClause: any = {
      deletedAt: null,
    };

    if (statusParam && statusParam !== "all") {
      whereClause.status = statusParam;
    }

    const projects = await prisma.projects.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: true,
            major: true,
          },
        },
        advisor: {
          include: {
            user: true,
            major: true,
          },
        },
        media: {
          orderBy: { order: "asc" },
        },
        tools: {
          include: { tool: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = projects.map((p, index) => {
      const typeLabel =
        p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL";
      const mediaUrls = (p.media || []).map((m) => m.url);
      const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";

      return {
        id: p.id,
        title: p.title,
        category: typeLabel,
        image: cover,
        author: p.student?.user?.name || "Siswa SMKN 13",
        authorRole: p.student?.class ? `Siswa ${p.student.class}` : "Siswa SMKN 13",
        likes: p.stars || 0,
        description: p.description || "",
        uploadOrder: index + 1,
        uploadedAt: p.createdAt.toISOString(),
        status: p.status,
        documents: [
          {
            id: `doc-${p.id}-1`,
            name: "Laporan Akhir & Dokumentasi Teknis",
            type: "pdf" as const,
            url: "/docs/laporan-akhir.pdf",
            meta: "PDF · 2.4 MB",
            required: true,
          },
          {
            id: `doc-${p.id}-2`,
            name: "Surat Pernyataan Orisinalitas",
            type: "pdf" as const,
            url: "/docs/surat-orisinalitas.pdf",
            meta: "PDF · 620 KB",
            required: true,
          },
          {
            id: `doc-${p.id}-3`,
            name: "Dokumentasi & Galeri Proyek",
            type: "image" as const,
            url: cover,
            meta: "JPG · Pratinjau Karya",
          },
        ],
        details: {
          description: p.description || "Deskripsi proyek sedang dalam kurasi pembimbing.",
          highlights: [
            "Proyek terverifikasi dan memenuhi standar kurikulum SMK.",
            "Telah melalui review kelayakan teknis oleh guru pembimbing.",
          ],
          tools: (p.tools || []).map((t) => t.name || t.tool?.name).filter(Boolean),
          links: [
            { label: "Pratinjau Langsung (Demo)", url: "https://demo.kandaga.smkn13bdg.sch.id" },
            { label: "Repositori Kode Sumber", url: "https://github.com/smkn13bandung/kandaga-project" },
          ],
          mentors: [
            {
              name: p.advisor?.user?.name || "Guru Pembimbing",
              role: "Guru Pembimbing Kompetensi Keahlian",
              initial: (p.advisor?.user?.name || "GP").slice(0, 2).toUpperCase(),
            },
          ],
        },
        creator: {
          id: p.student?.userId || p.studentId,
          name: p.student?.user?.name || "Siswa SMKN 13",
          class: p.student?.class || "XII",
          jurusan: typeLabel,
          avatar: p.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          nisn: p.student?.nis || "1324001",
          email: p.student?.user?.email || "siswa@smkn13bdg.sch.id",
          submissionCount: 1,
          portfolioCount: 1,
          status: p.student?.status === "aktif" ? "Aktif" : "Alumni",
        },
      };
    });

    const verifiedCount = await prisma.projects.count({
      where: { status: "approved", deletedAt: null },
    });

    const pendingCount = await prisma.projects.count({
      where: { status: "pending", deletedAt: null },
    });

    const totalCount = await prisma.projects.count({
      where: { deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      projects: mapped,
      stats: {
        verified: verifiedCount,
        pending: pendingCount,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data karya kurasi" },
      { status: 500 }
    );
  }
}
