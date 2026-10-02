"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef, useState } from "react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { BENEFITS } from "@/lib/data";
import type { Benefit } from "@/types";


// ── Grid blueprint tipis ──────────────────────────────────────────────────
function BlueprintGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="bp-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
    </svg>
  );
}

// ── Ilustrasi blueprint "kartu karya diperiksa" ───────────────────────────
function BlueprintIllustration() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });

  const lp = (delay: number) => ({
    stroke: "#8B1A2F", strokeWidth: 1, strokeLinecap: "round" as const,
    strokeDasharray: 200, strokeDashoffset: 200,
    animate: isInView ? { strokeDashoffset: 0 } : {},
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number], delay },
  });

  return (
    <svg ref={ref} viewBox="0 0 320 280" className="w-full max-w-sm" fill="none"
      aria-label="Ilustrasi kartu karya yang sedang diperiksa">
      <motion.rect x="40" y="40" width="200" height="140" rx="12"
        stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="600" strokeDashoffset="600"
        animate={isInView ? { strokeDashoffset: 0 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} />
      <motion.rect x="40" y="40" width="200" height="36" rx="12"
        fill="#8B1A2F" fillOpacity="0.08"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} />
      <motion.line x1="60" y1="102" x2="200" y2="102" {...lp(0.6)} />
      <motion.line x1="60" y1="118" x2="180" y2="118" {...lp(0.7)} />
      <motion.line x1="60" y1="134" x2="160" y2="134" {...lp(0.8)} />
      <motion.path d="M40 60 L28 60 M40 40 L40 28"
        stroke="#8B1A2F" strokeWidth="1" strokeLinecap="round"
        strokeDasharray="30" strokeDashoffset="30"
        animate={isInView ? { strokeDashoffset: 0 } : {}} transition={{ duration: 0.4, delay: 1.1 }} />
      <motion.path d="M240 160 L252 160 M240 180 L240 192"
        stroke="#8B1A2F" strokeWidth="1" strokeLinecap="round"
        strokeDasharray="30" strokeDashoffset="30"
        animate={isInView ? { strokeDashoffset: 0 } : {}} transition={{ duration: 0.4, delay: 1.2 }} />
      <motion.line x1="240" y1="100" x2="285" y2="80" {...lp(1.3)} />
      <motion.text x="290" y="76" fontSize="9" fill="#8B1A2F" fontFamily="monospace" fontWeight="600"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
        VERIFIED
      </motion.text>
      <motion.line x1="40" y1="160" x2="15" y2="190" {...lp(1.4)} />
      <motion.text x="8" y="200" fontSize="8" fill="#555" fontFamily="monospace"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}>
        RPL / TKJ
      </motion.text>
      <motion.line x1="40" y1="220" x2="240" y2="220" stroke="#CCCCCC" strokeWidth="1"
        strokeDasharray="200" strokeDashoffset="200"
        animate={isInView ? { strokeDashoffset: 0 } : {}} transition={{ duration: 0.8, delay: 1.0 }} />
      <motion.line x1="40" y1="215" x2="40" y2="225" stroke="#CCCCCC" strokeWidth="1"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }} />
      <motion.line x1="240" y1="215" x2="240" y2="225" stroke="#CCCCCC" strokeWidth="1"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.8 }} />
      <motion.text x="115" y="235" fontSize="8" fill="#AAAAAA" fontFamily="monospace" textAnchor="middle"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.9 }}>
        200 × 140 px
      </motion.text>
    </svg>
  );
}

// ── 3 poin manfaat dengan leader-line + tooltip hotspot ───────────────────

function BenefitItem({ b }: { b: Benefit }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.li
      variants={revealUp}
      className="flex items-start gap-4"
    >
      {/* Leader line indicator */}
      <div className="mt-0.5 flex flex-shrink-0 items-center gap-2">
        <span className="font-mono text-xs font-semibold text-ink-300">{b.code}</span>
        <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
          <line x1="0" y1="6" x2="20" y2="6" stroke="#CCCCCC" strokeWidth="1" />
          <path d="M18 3 L22 6 L18 9" fill="none" stroke="#8B1A2F" strokeWidth="1"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="relative flex-1">
        {/* Hotspot: ikon info kecil dengan tooltip */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-sm font-semibold text-ink md:text-base">{b.title}</p>
            <p className="mt-1 text-sm text-ink-600">{b.desc}</p>
          </div>

          <motion.button
            className="mt-0.5 flex-shrink-0 rounded-full p-1 text-ink-300 transition-colors hover:text-primary"
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label={`Detail: ${b.title}`}
            whileHover={{ scale: 1.15 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </motion.button>
        </div>

        {/* Tooltip */}
        <AnimatePresenceWrapper show={showTooltip}>
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-8 z-10 w-64 rounded-xl border border-ink-150 bg-white px-4 py-3 shadow-md"
            role="tooltip"
          >
            <p className="text-xs leading-relaxed text-ink-600">{b.tooltip}</p>
            {/* Panah kecil ke atas */}
            <span className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-ink-150 bg-white" />
          </motion.div>
        </AnimatePresenceWrapper>
      </div>
    </motion.li>
  );
}

// Helper supaya AnimatePresence tetap bisa pakai conditional render
function AnimatePresenceWrapper({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <AnimatePresence>{show ? children : null}</AnimatePresence>;
}

export default function IndustrySection() {
  return (
    <section id="industri-section" className="relative overflow-hidden bg-cream py-20 md:py-28">
      <BlueprintGrid />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[3fr_2fr] lg:gap-24">

          {/* Kolom kiri */}
          <div>
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.h2 variants={revealUp}
                className="font-heading text-3xl font-semibold leading-tight text-ink md:text-4xl">
                Rekrut talenta yang sudah teruji,{" "}
                <span className="text-primary">bukan tebakan.</span>
              </motion.h2>

              <motion.p variants={revealUp}
                className="mt-4 max-w-lg text-sm leading-relaxed text-ink-600 md:text-base">
                Setiap karya di Kandaga telah melalui kurasi guru pembimbing —
                Anda melihat portofolio nyata, bukan sekadar CV.
              </motion.p>
            </motion.div>

            {/* Benefits dengan tooltip */}
            <motion.ul
              className="mt-10 space-y-7"
              variants={staggerChildren}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              {BENEFITS.map((b) => (
                <BenefitItem key={b.code} b={b} />
              ))}
            </motion.ul>

            {/* CTA */}
            <motion.div
              className="mt-10 flex flex-col items-start gap-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              <Link href="/mitra/daftar"
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                Daftar Sebagai Mitra Industri
              </Link>
              <Link
                href="#cara-kerja-bkk"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-primary group"
              >
                <span>Pelajari cara kerja BKK</span>
                <Image
                  src="/icons/arrowright.svg"
                  alt="Arrow"
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 object-contain transition-transform group-hover:translate-x-1"
                />
              </Link>
              <p className="text-xs text-ink-300">
                Akun perusahaan diverifikasi oleh Koordinator BKK sebelum dapat mengakses katalog.
              </p>
            </motion.div>
          </div>

          {/* Kolom kanan — ilustrasi blueprint */}
          <motion.div
            className="hidden items-center justify-center lg:flex"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <BlueprintIllustration />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
