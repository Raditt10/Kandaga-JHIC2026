"use client";

import { useState } from "react";
import Image from "next/image";
import { PARTNERS } from "@/lib/data";
import type { Partner } from "@/types";

/**
 * LogoCard — Kartu logo dengan border dashed, rounded-2xl, background putih
 */
function LogoCard({ partner }: { partner: Partner }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      title={partner.name}
      className="card-dashed-border flex h-24 w-48 shrink-0 items-center justify-center p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow duration-300 hover:shadow-md sm:h-28 sm:w-56"
    >
      {partner.logoUrl && !imgError ? (
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={160}
          height={64}
          className="max-h-12 w-auto max-w-[82%] object-contain"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        /* Fallback teks singkatan jika logo tidak ditemukan */
        <div className="flex h-10 w-28 items-center justify-center text-sm font-bold tracking-wider text-ink-700">
          {partner.abbr}
        </div>
      )}
    </div>
  );
}

export default function TrustBar() {
  // Duplikasi daftar mitra agar animasi scroll marquee berputar mulus tanpa jeda
  const marqueePartners = [...PARTNERS, ...PARTNERS];

  return (
    <section className="relative overflow-hidden border-y border-ink-150 bg-[#F8F9FA] py-8 sm:py-10">
      {/* Efek gradient fade di sisi kiri dan kanan */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#F8F9FA] to-transparent sm:w-32"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#F8F9FA] to-transparent sm:w-32"
        aria-hidden="true"
      />

      {/* Marquee Track */}
      <div className="w-full overflow-hidden">
        <div className="animate-marquee-scroll flex gap-6 sm:gap-8">
          {marqueePartners.map((partner, index) => (
            <LogoCard
              key={`${partner.abbr}-${index}`}
              partner={partner}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

