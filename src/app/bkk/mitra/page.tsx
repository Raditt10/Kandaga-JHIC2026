"use client";
import BKKLayout from "@/components/bkk/BKKLayout";
import { Building2, Construction } from "lucide-react";

export default function BKKMitraPage() {
  return (
    <BKKLayout pageTitle="Manajemen Mitra">
      <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight mb-6">
        Manajemen Mitra
      </h1>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-violet-500" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Manajemen mitra — dikerjakan di Fase 4 alurKonfirmasiBKK
        </p>
        <p className="text-sm text-ink-300 mt-1 max-w-sm">
          Riwayat semua perusahaan yang pernah mendaftar dengan filter status.
        </p>
      </div>
    </BKKLayout>
  );
}
