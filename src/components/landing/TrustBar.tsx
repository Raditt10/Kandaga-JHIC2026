"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { PARTNERS } from "@/lib/data";
import type { Partner } from "@/types";

/**
 * LogoItem — tampilkan logo jika tersedia, fallback ke abbr teks
 * Pakai grayscale + hover full-color supaya terlihat konsisten di atas background putih
 */
function LogoItem({ partner }: { partner: Partner }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={revealUp}
      title={partner.name}
      className="group flex h-14 w-32 items-center justify-center transition-all duration-200"
    >
      {partner.logoUrl && !imgError ? (
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={120}
          height={48}
          className="h-10 w-auto object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        /* Fallback: abbr dalam kotak tipis */
        <div className="flex h-10 w-28 items-center justify-center rounded-lg border border-ink-150 text-xs font-bold tracking-wide text-ink-300 transition-colors group-hover:border-ink-300 group-hover:text-ink-700">
          {partner.abbr}
        </div>
      )}
    </motion.div>
  );
}

export default function TrustBar() {
  return (
    <section className="border-y border-ink-150 bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Label */}
          <motion.p
            variants={revealUp}
            className="mb-10 text-center text-xs font-semibold tracking-[0.3em] text-ink-300"
          >
            DIPERCAYA OLEH MITRA INDUSTRI
          </motion.p>

          {/* Grid logo — grayscale default, full-color saat hover */}
          <motion.div
            variants={staggerChildren}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          >
            {PARTNERS.map((partner) => (
              <LogoItem key={partner.abbr} partner={partner} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
