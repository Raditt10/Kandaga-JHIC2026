"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "motion/react";
import { revealUp, staggerChildren } from "@/lib/motion";
import JellyRadio from "@/components/ui/JellyRadio";
import EmptyState from "@/components/ui/EmptyState";
import { Loader2, SearchX, AlertCircle } from "lucide-react";
import { GALLERY_FILTERS } from "@/lib/data";

// ─── Tipe kartu internal deck ─────────────────────────────────────────────────

type DeckCardData = {
  src: string
  alt: string
  tag: string
  title: string
  desc: string
  href: string
}

// ─── Fetch featured projects dari API ────────────────────────────────────────
// Ambil maksimal 5 karya terbaru yang approved, jadikan kartu deck.

async function fetchFeaturedCards(): Promise<DeckCardData[]> {
  const res = await fetch("/api/gallery?pageSize=5")
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const projects: {
    id: string
    title: string
    tagline: string
    major?: string
    jurusan?: string
    majorLabel?: string
    jurusanLabel?: string
    coverImage: string
  }[] = Array.isArray(data.projects) ? data.projects : []

  return projects.map((p) => {
    const slug = p.major ?? p.jurusan ?? "rpl"
    const label = p.majorLabel ?? p.jurusanLabel ?? slug.toUpperCase()
    return {
      src:   p.coverImage || "/images/preview-rpl.jpg",
      alt:   p.title,
      tag:   label,
      title: p.title,
      desc:  p.tagline || "",
      href:  `/gallery/${p.id}`,
    }
  })
}

// ─── Posisi & style per kartu dalam deck ─────────────────────────────────────

function getCardStyle(offset: number) {
  const abs = Math.abs(offset)
  if (abs > 2) return null
  return {
    scale:   offset === 0 ? 1 : abs === 1 ? 0.82 : 0.68,
    rotate:  offset === 0 ? 0 : offset > 0 ? abs * 6 : abs * -6,
    x:       offset * 180,
    zIndex:  10 - abs * 3,
    opacity: abs === 2 ? 0.45 : 1,
  }
}

// ─── Satu kartu dalam deck ────────────────────────────────────────────────────

function DeckCard({
  card,
  offset,
  onDragLeft,
  onDragRight,
  isActive,
}: {
  card: DeckCardData
  offset: number
  onDragLeft: () => void
  onDragRight: () => void
  isActive: boolean
}) {
  const router = useRouter()
  // All hooks MUST be called before any early return (Rules of Hooks)
  const dragX = useMotionValue(0)
  const dragRotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12])

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -80) onDragLeft()
      else if (info.offset.x > 80) onDragRight()
      else animate(dragX, 0, { type: "spring", stiffness: 500, damping: 40 })
    },
    [dragX, onDragLeft, onDragRight]
  )

  const style = getCardStyle(offset)
  if (!style) return null

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{ zIndex: style.zIndex, x: dragX }}
      animate={{ scale: style.scale, rotate: style.rotate, x: style.x, opacity: style.opacity }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onClick={() => { if (isActive) router.push(card.href) }}
      whileHover={isActive ? { scale: 1.02 } : {}}
      whileTap={isActive ? { scale: 0.98 } : {}}
    >
      <motion.div
        style={{ rotate: isActive ? dragRotate : 0 }}
        className="relative h-60 w-44 overflow-hidden rounded-2xl shadow-2xl md:h-72 md:w-52"
      >
        <Image
          src={card.src}
          alt={card.alt}
          fill
          draggable={false}
          className="pointer-events-none object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {card.tag && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink shadow">
            {card.tag}
          </span>
        )}

        {isActive && (
          <>
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-xs font-semibold leading-tight text-white line-clamp-2">
                {card.title}
              </p>
            </motion.div>
            <div className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              Lihat →
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Skeleton saat loading ────────────────────────────────────────────────────

function DeckSkeleton() {
  return (
    <div className="relative mx-auto flex h-80 max-w-3xl items-center justify-center md:h-96">
      {[-1, 0, 1].map((offset) => {
        const s = getCardStyle(offset)!
        return (
          <div
            key={offset}
            className="absolute h-60 w-44 md:h-72 md:w-52 rounded-2xl bg-ink-150 animate-pulse"
            style={{
              transform: `translateX(${s.x}px) scale(${s.scale}) rotate(${s.rotate}deg)`,
              zIndex: s.zIndex,
              opacity: s.opacity,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Section utama ────────────────────────────────────────────────────────────

export default function GallerySection() {
  const [cards, setCards] = useState<DeckCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const [activeFilter, setActiveFilter] = useState("Semua")
  const [activeIndex, setActiveIndex] = useState(0)
  const pauseRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  /*
   * Auto-advance 7 detik hanya boleh berdetak saat galeri terlihat. Sebelumnya
   * interval tetap jalan walau galeri jauh di luar layar, sehingga animasi kartu
   * terus dipicu selama pengguna menggulir bagian lain halaman.
   */
  const autoAdvanceInView = useInView(sectionRef, { margin: "0px 0px -10% 0px" })

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setFetchError(false)

    fetchFeaturedCards()
      .then((data) => {
        if (cancelled) return
        setCards(data)
        setActiveIndex(data.length > 1 ? 1 : 0)
      })
      .catch(() => {
        if (!cancelled) setFetchError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % Math.max(cards.length, 1))
  }, [cards.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + Math.max(cards.length, 1)) % Math.max(cards.length, 1))
  }, [cards.length])

  const handleUserInteraction = useCallback(() => {
    pauseRef.current = true
    setTimeout(() => { pauseRef.current = false }, 10000)
  }, [])

  // ── Auto-advance setiap 7 detik ─────────────────────────────────────────────
  useEffect(() => {
    if (cards.length === 0 || !autoAdvanceInView) return
    const id = setInterval(() => {
      if (!pauseRef.current) setActiveIndex((i) => (i + 1) % cards.length)
    }, 7000)
    return () => clearInterval(id)
  }, [cards.length, autoAdvanceInView])

  const activeCard = cards[activeIndex]

  return (
    /*
     * overflow-x-clip memotong kartu samping card deck yang diposisikan absolut
     * pada x = ±180px. Section ini selebar viewport, jadi pemotongannya jatuh
     * tepat di tepi layar — tampilan tidak berubah, tetapi lebar dokumen tidak
     * lagi ikut membengkak. `overflow-x: clip` pada body mencegah gulir
     * menyamping, namun documentElement.scrollWidth tetap membengkak dan itu
     * ditandai audit Lighthouse sebagai konten yang tidak sesuai viewport.
     * `clip` dipakai, bukan `hidden`, agar sticky di dalam tetap bekerja.
     */
    <section
      ref={sectionRef}
      id="galeri-section"
      className="mx-auto max-w-7xl overflow-x-clip px-6 py-20 md:py-24"
    >
      {/* Header */}
      <motion.div
        className="mb-10 max-w-xl"
        variants={staggerChildren}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h2
          variants={revealUp}
          className="font-heading text-3xl font-semibold text-ink md:text-4xl"
        >
          Temukan karya yang bicara.
        </motion.h2>
        <motion.p
          variants={revealUp}
          className="mt-3 text-sm text-ink-600 md:text-base"
        >
          Jelajahi koleksi karya terbaik dari siswa-siswi SMKN 13 Bandung —
          mulai dari aplikasi, desain, hingga riset laboratorium.
        </motion.p>
      </motion.div>

      {/* Filter pills */}
      <div className="sticky top-[73px] z-40 -mx-6 mb-14 bg-white/90 px-6 py-3 backdrop-blur">
        <JellyRadio
          name="gallery-filter"
          options={GALLERY_FILTERS}
          defaultValue="Semua"
          onChange={(val) => setActiveFilter(val)}
        />
      </div>

      {/* ── Deck area ── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Loading skeleton */}
        {isLoading && <DeckSkeleton />}

        {/* Error / empty state */}
        {!isLoading && (fetchError || cards.length === 0) && (
          <div className="mx-auto flex min-h-[320px] max-w-3xl items-center justify-center px-4 py-8">
            {fetchError ? (
              <EmptyState
                icon={<AlertCircle className="w-7 h-7 text-rose-600" />}
                title="Gagal Memuat Karya"
                description="Terjadi kendala saat mengambil data karya siswa. Silakan coba muat ulang halaman."
                action={{
                  label: "Muat Ulang Halaman",
                  onClick: () => window.location.reload(),
                }}
              />
            ) : (
              <EmptyState
                icon={<SearchX className="w-7 h-7 text-[#8B1A2F]" />}
                title="Belum Ada Karya yang Dipublikasikan"
                description="Karya inovasi siswa masih dalam proses bimbingan dan kurasi resmi guru SMKN 13 Bandung."
              />
            )}
          </div>
        )}

        {/* Deck */}
        {!isLoading && !fetchError && cards.length > 0 && (
          <>
            <div className="relative mx-auto flex h-80 max-w-3xl items-center justify-center md:h-96">
              {cards.map((card, index) => {
                const offset = index - activeIndex
                const normalized =
                  offset > cards.length / 2
                    ? offset - cards.length
                    : offset < -cards.length / 2
                    ? offset + cards.length
                    : offset

                return (
                  <DeckCard
                    key={card.href}
                    card={card}
                    offset={normalized}
                    isActive={index === activeIndex}
                    onDragLeft={() => { goNext(); handleUserInteraction() }}
                    onDragRight={() => { goPrev(); handleUserInteraction() }}
                  />
                )
              })}
            </div>

            {/* Navigasi + dots */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { goPrev(); handleUserInteraction() }}
                  aria-label="Karya sebelumnya"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-150 text-ink-700 transition-colors hover:border-ink hover:bg-ink-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  {cards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveIndex(i); handleUserInteraction() }}
                      aria-label={`Kartu ${i + 1}`}
                    >
                      <motion.span
                        className="block rounded-full bg-ink-300"
                        animate={{
                          width:  i === activeIndex ? 24 : 8,
                          height: 8,
                          backgroundColor: i === activeIndex ? "#8B1A2F" : "#CCCCCC",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { goNext(); handleUserInteraction() }}
                  aria-label="Karya berikutnya"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-150 text-ink-700 transition-colors hover:border-ink hover:bg-ink-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-ink-300 select-none">
                Geser kartu atau klik untuk melihat detail
              </p>

              {/* Auto-advance progress bar */}
              <div className="h-0.5 w-40 overflow-hidden rounded-full bg-ink-150">
                <motion.div
                  key={activeIndex}
                  className="h-full bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 7, ease: "linear" }}
                />
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Info karya aktif */}
      {!isLoading && activeCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard.href}
            className="mx-auto mt-10 max-w-xl text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-heading text-2xl font-semibold text-ink">
              {activeCard.title}
            </h3>
            <p className="mt-3 text-sm text-ink-600 md:text-base">
              {activeCard.desc}
            </p>
            <a
              href={activeCard.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark group"
            >
              <span>Read More</span>
              <Image
                src="/icons/arrowright.svg"
                alt=""
                aria-hidden="true"
                width={14}
                height={14}
                unoptimized
                className="w-3.5 h-3.5 object-contain transition-transform group-hover:translate-x-1"
              />
            </a>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  )
}
