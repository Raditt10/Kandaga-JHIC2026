import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function JurusanCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#8B1A2F] via-[#6B1424] to-[#420A16] text-white relative overflow-hidden">
      {/* Decorative background grid and circles */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Tertarik Merekrut Talenta atau Berkolaborasi dengan SMKN 13 Bandung?
        </h2>

        <p className="text-zinc-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Platform Kandaga memverifikasi kompetensi siswa secara transparan. Dapatkan
          akses langsung ke talenta siap kerja dari jurusan RPL, TKJ, maupun Analis
          Kimia melalui saluran kemitraan resmi BKK sekolah.
        </p>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Link
            href="/#jurusan-section"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <span>Lihat Jurusan lainnya</span>
            <Image
              src="/icons/arrowsplit.svg"
              alt="Lihat Jurusan lainnya"
              width={18}
              height={18}
              unoptimized
              className="w-4.5 h-4.5 object-contain"
            />
          </Link>
        </div>

      </div>
    </section>
  );
}
