"use client";

import CompanyLayout from "@/components/company/CompanyLayout";
import { Search, Construction } from "lucide-react";

export default function KatalogPage() {
  return (
    <CompanyLayout pageTitle="Jelajahi Katalog">
      {/* h1 di dalam konten */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Jelajahi Katalog Karya
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Temukan portofolio siswa terverifikasi dari jurusan RPL, TKJ, dan Analis Kimia.
        </p>
      </div>

      {/* Placeholder — Fase 4 */}
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-blue-600" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Katalog karya — dikerjakan di Fase 4
        </p>
        <p className="mt-1 text-sm text-ink-300 max-w-sm">
          Grid katalog dengan filter jurusan, tombol "Ajukan Minat via BKK",
          dan bookmark akan tersedia di sini.
        </p>
      </div>
    </CompanyLayout>
  );
}
