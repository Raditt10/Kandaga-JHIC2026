/**
 * loading.tsx — Next.js App Router streaming skeleton.
 * Ditampilkan INSTAN saat navigasi ke /jurusan/[slug],
 * menggantikan layar kosong/diam selama halaman di-fetch.
 * Setelah page.tsx selesai render, skeleton diganti konten asli.
 */

import { Skeleton } from "@/components/ui/Skeleton";

function Pulse({ className }: { className: string }) {
  return <Skeleton className={className} />;
}

export default function JurusanDetailLoading() {
  return (
    <div className="min-h-screen bg-white" aria-label="Memuat halaman jurusan...">

      {/* ── Navbar skeleton ── */}
      <div className="fixed top-5 left-0 right-0 mx-auto z-50 w-[96%] max-w-5xl">
        <div className="bg-white/95 border border-ink-150 rounded-full px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Pulse className="h-8 w-8 rounded-full" />
            <Pulse className="h-4 w-24" />
          </div>
          <Pulse className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* ── Hero skeleton ── */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-[#FBF9F6] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Kolom kiri */}
            <div className="lg:col-span-6 space-y-5">
              {/* Label pill */}
              <Pulse className="h-6 w-56 rounded-full" />

              {/* H1 */}
              <div className="space-y-2">
                <Pulse className="h-10 w-full" />
                <Pulse className="h-10 w-4/5" />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2 pt-1">
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-5/6" />
                <Pulse className="h-4 w-4/6" />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                {["Semua Jurusan", "RPL", "TKJ", "Analis Kimia"].map((l) => (
                  <Pulse key={l} className="h-10 w-28 rounded-full" />
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <Pulse className="h-11 w-44 rounded-full" />
                <Pulse className="h-11 w-40 rounded-full" />
              </div>

              {/* Trust bar */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ink-150">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Pulse className="h-5 w-24" />
                    <Pulse className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom kanan — slot 3D */}
            <div className="lg:col-span-6 flex justify-center">
              <Pulse className="w-full max-w-lg aspect-square rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── JurusanNavTabs skeleton ── */}
      <div className="sticky top-20 z-40 bg-white/90 border-y border-ink-150 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Pulse key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* ── JurusanDetailSection skeleton ── */}
      <section className="py-16 md:py-24 border-b border-ink-150">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Badges header */}
          <div className="flex gap-2">
            <Pulse className="h-7 w-20 rounded-full" />
            <Pulse className="h-7 w-24 rounded-full" />
            <Pulse className="h-7 w-28 rounded-full" />
          </div>

          {/* H2 */}
          <Pulse className="h-9 w-72" />
          <Pulse className="h-5 w-52" />

          {/* Deskripsi */}
          <div className="space-y-2 max-w-[65ch]">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-4 w-4/6" />
          </div>

          {/* Competency chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Pulse key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>

          {/* Tab nav */}
          <div className="border-b border-ink-150 flex gap-6 pb-1">
            {[1, 2, 3, 4].map((i) => (
              <Pulse key={i} className="h-5 w-28" />
            ))}
          </div>

          {/* Tab content — program unggulan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-ink-150 space-y-3">
                <div className="flex justify-between">
                  <Pulse className="h-10 w-10 rounded-xl" />
                  <Pulse className="h-6 w-20 rounded-full" />
                </div>
                <Pulse className="h-5 w-3/4" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
