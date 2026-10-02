"use client";

import CompanyLayout from "@/components/company/CompanyLayout";
import { Bookmark, Construction } from "lucide-react";

export default function TersimpanPage() {
  return (
    <CompanyLayout pageTitle="Talenta Tersimpan">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Talenta Tersimpan
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Karya siswa yang Anda tandai sebagai favorit untuk ditinjau kembali.
        </p>
      </div>

      {/* Placeholder — Fase 4 */}
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
          <Bookmark className="w-8 h-8 text-violet-600" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Talenta tersimpan — dikerjakan di Fase 4
        </p>
        <p className="mt-1 text-sm text-ink-300 max-w-sm">
          Daftar karya yang Anda bookmark akan tampil di sini setelah
          fitur bookmark di katalog selesai diimplementasi.
        </p>
      </div>
    </CompanyLayout>
  );
}
