import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function JurusanCTA() {
  return (
    <section className="bg-white border-t border-zinc-200">
      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        {/* Blok kotak-kotak marun & putih — pola selalu mengisi penuh bidangnya */}
        <div
          aria-hidden="true"
          className="h-40 sm:h-52 lg:h-auto"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage:
              "repeating-conic-gradient(#8B1A2F 0% 25%, #ffffff 0% 50%)",
            backgroundSize: "50% 50%",
          }}
        />

        {/* Teks */}
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
          <h2 className="font-heading text-[clamp(1.6rem,3.3vw,3.05rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.015em] text-[#8B1A2F] text-balance">
            Tertarik Merekrut Talenta atau Berkolaborasi dengan SMKN 13 Bandung?
          </h2>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600">
            Platform Kandaga memverifikasi kompetensi siswa secara transparan. Dapatkan
            akses langsung ke talenta siap kerja dari jurusan RPL, TKJ, maupun Analis
            Kimia melalui saluran kemitraan resmi BKK sekolah.
          </p>

          <div className="mt-8">
            <Link
              href="/#jurusan-section"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#8B1A2F] hover:bg-[#721426] text-white transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <span>Lihat Jurusan lainnya</span>
              <Image
                src="/icons/arrowsplit.svg"
                alt="Lihat Jurusan lainnya"
                width={18}
                height={18}
                unoptimized
                className="w-4.5 h-4.5 object-contain brightness-0 invert"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
