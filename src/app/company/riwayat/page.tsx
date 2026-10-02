"use client";

import CompanyLayout from "@/components/company/CompanyLayout";
import { ClipboardList, Construction } from "lucide-react";

// Mapping status → label + warna (sesuai alurMitra.md §5)
export const STATUS_MAP = {
  terkirim:    { label: "Terkirim, menunggu ditinjau", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ditinjau:    { label: "Sedang ditinjau BKK",          color: "bg-amber-100 text-amber-700 border-amber-200" },
  klarifikasi: { label: "Perlu klarifikasi dari Anda",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  diteruskan:  { label: "Diteruskan ke siswa",          color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ditolak:     { label: "Tidak dapat diproses",         color: "bg-rose-100 text-rose-700 border-rose-200" },
} as const;

export default function RiwayatPage() {
  return (
    <CompanyLayout pageTitle="Riwayat Permintaan">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Riwayat Permintaan
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Pantau status semua ajuan minat rekrutmen dan magang yang pernah Anda kirim.
        </p>
      </div>

      {/* Legend status — sudah siap sebelum data ada */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(STATUS_MAP).map(([key, { label, color }]) => (
          <span
            key={key}
            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${color}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Placeholder — Fase 5 */}
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-amber-600" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Riwayat permintaan — dikerjakan di Fase 5
        </p>
        <p className="mt-1 text-sm text-ink-300 max-w-sm">
          List semua permintaan minat beserta badge status berwarna
          akan tampil di sini setelah Fase 5 selesai.
        </p>
      </div>
    </CompanyLayout>
  );
}
