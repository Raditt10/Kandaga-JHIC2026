"use client";

import CompanyLayout from "@/components/company/CompanyLayout";
import { useSession } from "next-auth/react";
import { User, Construction, ShieldCheck } from "lucide-react";

export default function ProfilPage() {
  const { data: session } = useSession();

  return (
    <CompanyLayout pageTitle="Profil Perusahaan">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Profil Perusahaan
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Kelola data perusahaan dan dokumen legalitas Anda.
        </p>
      </div>

      {/* Info akun read-only (status verifikasi tidak bisa diedit — alurMitra §2) */}
      <div className="mb-6 rounded-2xl border border-ink-150 bg-white p-5 space-y-4">
        <h2 className="font-heading text-sm font-semibold text-ink">
          Informasi Akun
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Nama narahubung</p>
            <p className="text-sm font-semibold text-ink">
              {session?.user?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Email</p>
            <p className="text-sm font-semibold text-ink font-mono">
              {session?.user?.email ?? "—"}
            </p>
          </div>
          {/* Status verifikasi: READ-ONLY sesuai alurMitra §2 */}
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Status verifikasi BKK</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Disetujui
            </span>
          </div>
        </div>
      </div>

      {/* Placeholder form edit — Fase 8 */}
      <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-emerald-600" aria-hidden="true" />
        </div>
        <Construction className="w-5 h-5 text-ink-300 mb-2" aria-hidden="true" />
        <p className="font-heading text-base font-semibold text-ink-600">
          Form edit profil — dikerjakan di Fase 8
        </p>
        <p className="mt-1 text-sm text-ink-300 max-w-sm">
          Form untuk mengubah nama perusahaan, bidang usaha, dan dokumen
          akan tersedia di sini. Status verifikasi tetap read-only.
        </p>
      </div>
    </CompanyLayout>
  );
}
