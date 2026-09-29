"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { revealUp, staggerChildren } from "@/lib/motion";
import JellyRadio from "@/components/ui/JellyRadio";
import { GALLERY_FILTERS, FEATURED_PROJECTS } from "@/lib/data";

// Map Project → shape yang dibutuhkan DeckCard
const cards = FEATURED_PROJECTS.map((p) => ({
  src:   p.image,
  alt:   p.title,
  tag:   p.jurusan,
  title: p.title,
  desc:  p.description,
  href:  p.href,
}));

// Hitung posisi & style tiap kartu relatif terhadap kartu aktif
function getCardStyle(offset: number) {
  const absOffset = Math.abs(offset);

  // Kartu yang terlalu jauh tidak ditampilkan
  if (absOffset > 2) return null;

  const scale   = offset === 0 ? 1 : absOffset === 1 ? 0.82 : 0.68;
  const rotate  = offset === 0 ? 0 : offset > 0 ? absOffset * 6 : absOffset * -6;
  const x       = offset === 0 ? 0 : offset > 0 ? offset * 180 : offset * 180;
  const zIndex  = 10 - absOffset * 3;
  const opacity = absOffset === 2 ? 0.45 : 1;

  return { scale, rotate, x, zIndex, opacity };
}

// Satu kartu dalam deck
function DeckCard({
  card,
  offset,
  onDragEnd,
  onDragLeft,
  onDragRight,
  isActive,
}: {
  card: (typeof cards)[0];
  offset: number;
  onDragEnd: (offset: number) => void;
  onDragLeft: () => void;
  onDragRight: () => void;
  isActive: boolean;
}) {
  const router = useRouter();
  const style = getCardStyle(offset);
  if (!style) return null;

  const dragX = useMotionValue(0);
  // Rotasi ekstra saat di-drag (hanya kartu aktif)
  const dragRotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const threshold = 80;
      if (info.offset.x < -threshold) {
        onDragLeft();
      } else if (info.offset.x > threshold) {
        onDragRight();
      } else {
        // Kembalikan ke posisi tengah
        animate(dragX, 0, { type: "spring", stiffness: 500, damping: 40 });
      }
    },
    [onDragLeft, onDragRight, dragX]
  );

  const handleClick = () => {
    if (isActive) router.push(card.href);
  };

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        zIndex: style.zIndex,
        x: dragX,
      }}
      animate={{
        scale: style.scale,
        rotate: style.rotate,
        x: style.x,
        opacity: style.opacity,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      // Hanya kartu aktif yang bisa di-drag
      drag={isActive ? "x" : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={isActive ? { scale: 1.02 } : {}}
      whileTap={isActive ? { scale: 0.98 } : {}}
    >
      {/* Rotasi ekstra saat drag */}
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

        {/* Overlay gradient bawah */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Tag */}
        {card.tag && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink shadow">
            {card.tag}
          </span>
        )}

        {/* Judul di bawah — hanya kartu aktif */}
        {isActive && (
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
        )}

        {/* Hint klik di kartu aktif */}
        {isActive && (
          <div className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            Lihat →
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activeIndex, setActiveIndex] = useState(1); // mulai dari kartu tengah
  const pauseRef = useRef(false); // pause auto-advance saat user interaksi

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % cards.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + cards.length) % cards.length);
  }, []);

  // Auto-advance setiap 7 detik, pause saat user drag/klik navigasi
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pauseRef.current) {
        setActiveIndex((i) => (i + 1) % cards.length);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Reset pause setelah 10 detik tidak ada interaksi
  const handleUserInteraction = useCallback(() => {
    pauseRef.current = true;
    setTimeout(() => { pauseRef.current = false; }, 10000);
  }, []);

  const activeCard = cards[activeIndex];

  return (
    <section id="galeri-section" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      {/* Header */}
      <motion.div
        className="mb-10 max-w-xl"
        variants={staggerChildren}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.span
          variants={revealUp}
          className="text-xs font-semibold tracking-[0.3em] text-ink-600"
        >
          GALERI
        </motion.span>
        <motion.h2
          variants={revealUp}
          className="mt-2 font-heading text-3xl font-semibold text-ink md:text-4xl"
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

      {/* Filter pills — JellyRadio dengan squash & stretch, sticky di bawah navbar */}
      <div className="sticky top-[73px] z-40 -mx-6 mb-14 bg-white/90 px-6 py-3 backdrop-blur">
        <JellyRadio
          name="gallery-filter"
          options={GALLERY_FILTERS}
          defaultValue="Semua"
          onChange={(val) => setActiveFilter(val)}
        />
      </div>

      {/* Card deck */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Deck area */}
        <div className="relative mx-auto flex h-80 max-w-3xl items-center justify-center md:h-96">
          {cards.map((card, index) => {
            const offset = index - activeIndex;
            // Normalisasi offset supaya wrap-around terlihat wajar
            const normalizedOffset =
              offset > cards.length / 2
                ? offset - cards.length
                : offset < -cards.length / 2
                ? offset + cards.length
                : offset;

            return (
              <DeckCard
                key={card.href}
                card={card}
                offset={normalizedOffset}
                isActive={index === activeIndex}
                onDragEnd={() => {}}
                onDragLeft={() => { goNext(); handleUserInteraction(); }}
                onDragRight={() => { goPrev(); handleUserInteraction(); }}
              />
            );
          })}
        </div>

        {/* Kontrol navigasi + dots */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* Tombol prev/next */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { goPrev(); handleUserInteraction(); }}
              aria-label="Karya sebelumnya"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-150 text-ink-700 transition-colors hover:border-ink hover:bg-ink-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots indikator */}
            <div className="flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveIndex(i); handleUserInteraction(); }}
                  aria-label={`Kartu ${i + 1}`}
                  className="transition-all duration-300"
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
              onClick={() => { goNext(); handleUserInteraction(); }}
              aria-label="Karya berikutnya"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-150 text-ink-700 transition-colors hover:border-ink hover:bg-ink-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Hint drag */}
          <p className="text-xs text-ink-300 select-none">
            Geser kartu atau klik untuk melihat detail
          </p>

          {/* Auto-advance progress bar — 7 detik per kartu */}
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
      </motion.div>

      {/* Info karya aktif */}
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
            className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Read More →
          </a>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
