import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      take: 6,
      include: { user: true },
      orderBy: { user: { createdAt: "desc" } },
    });

    const mapped = companies.map((c, idx) => {
      const words = (c.name || "Perusahaan Mitra").split(" ").filter(Boolean);
      const initial = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : words[0]?.slice(0, 2).toUpperCase() || "PT";

      const targetJurusan =
        c.field?.toLowerCase().includes("kimia")
          ? ["Analis Kimia"]
          : c.field?.toLowerCase().includes("jaringan") || c.field?.toLowerCase().includes("telekomunikasi")
          ? ["TKJ"]
          : ["RPL", "TKJ"];

      const positions =
        c.field?.toLowerCase().includes("kimia")
          ? ["Quality Control Intern", "Lab Assistant"]
          : c.field?.toLowerCase().includes("jaringan") || c.field?.toLowerCase().includes("telekomunikasi")
          ? ["Network Admin", "Cloud Infra Intern"]
          : ["Frontend Jr.", "IoT Firmware Dev"];

      return {
        id: c.userId,
        name: c.name,
        field: c.field || "Teknologi Informasi",
        initial,
        badge: c.verificationStatus === "disetujui" ? "Disetujui BKK" : "Verifikasi BKK",
        quotaSiswa: 3 + (idx % 3),
        targetJurusan,
        positions,
      };
    });

    return NextResponse.json({ success: true, partners: mapped });
  } catch (error) {
    console.error("GET /api/admin/partners error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data mitra industri" },
      { status: 500 }
    );
  }
}
