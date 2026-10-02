"use client";
import BKKLayout from "@/components/bkk/BKKLayout";
import { MessageSquare, Construction } from "lucide-react";

export default function BKKKontakPage() {
  return (
    <BKKLayout pageTitle="Antrian Kontak">
      <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight mb-6">
        Antrian Permintaan Kontak
      </h1>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-blue-500" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Antrian kontak — dikerjakan di fase lanjutan
        </p>
        <p className="text-sm text-ink-300 mt-1 max-w-sm">
          Review permintaan minat dari perusahaan ke siswa (alurMitra.md Fase 5 lanjutan).
        </p>
      </div>
    </BKKLayout>
  );
}
