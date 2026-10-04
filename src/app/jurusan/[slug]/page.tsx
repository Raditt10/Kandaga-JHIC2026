import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JurusanHero from "@/components/jurusan/JurusanHero";
import JurusanDetailSection from "@/components/jurusan/JurusanDetailSection";
import JurusanCTA from "@/components/jurusan/JurusanCTA";
import { JURUSAN_DATA } from "@/data/jurusanData";

export function generateStaticParams() {
  return JURUSAN_DATA.map((j) => ({
    slug: j.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jurusan = JURUSAN_DATA.find((j) => j.id === slug);

  if (!jurusan) {
    return {
      title: "Jurusan Tidak Ditemukan",
      robots: { index: false, follow: true },
    };
  }

  return {
    // Akhiran "| Kandaga" ditambahkan otomatis oleh title.template di layout
    // akar, jadi judul di sini cukup menyebut nama jurusan dan sekolahnya.
    title: `${jurusan.name} - SMKN 13 Bandung`,
    description: jurusan.description,
    alternates: { canonical: `/jurusan/${jurusan.id}` },
    openGraph: {
      title: `${jurusan.name} - SMKN 13 Bandung`,
      description: jurusan.description,
      url: `/jurusan/${jurusan.id}`,
    },
  };
}

export default async function JurusanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jurusan = JURUSAN_DATA.find((j) => j.id === slug);

  if (!jurusan) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Global Floating Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Hero Section Spesifik Jurusan dengan Slot Model 3D */}
        <JurusanHero currentMajor={jurusan} />

        {/* Section 2: Penjelasan Detail Mendalam Jurusan Ini */}
        <div id="detail-program" className="scroll-mt-24">
          <JurusanDetailSection jurusan={jurusan} index={0} />
        </div>

        {/* Section 3: Call to Action (CTA) Kemitraan & Galeri */}
        <JurusanCTA />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
