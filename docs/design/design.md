# Kandaga — Motion & Interaction Design Guide

> Dokumen ini adalah spesifikasi animasi dan interaksi untuk situs Kandaga.
> Ditulis dengan prinsip: **animasi harus punya alasan naratif, bukan dekorasi**.

---

## 1. Filosofi Gerak: "Membuka Kandaga"

"Kandaga" berarti peti penyimpanan benda berharga dalam bahasa Sunda. Ini bukan
cuma nama — ini bisa jadi **bahasa gerak** yang menyatukan seluruh situs, dan
inilah yang bikin animasi kamu terasa unik, bukan template generik.

Prinsip gerak:
- Konten tidak "muncul" — konten **diungkap** (revealed), seolah tutup peti
  perlahan terbuka.
- Badge tidak "muncul" — badge **berkilau** sesaat saat pertama terlihat,
  seperti koin/medali yang baru diangkat dari peti.
- Angka statistik tidak langsung tampil — dihitung naik (count-up), memberi
  kesan "sedang dihitung/diverifikasi", selaras dengan tema kurasi Kandaga.
- Kartu preview karya di-tata seperti benda diletakkan satu per satu di meja
  pameran — bukan muncul serempak.

Ini yang membedakan dari 90% situs sekolah/portofolio yang cuma pakai
"fade-up on scroll" di semua elemen tanpa makna.

### Aturan emas
1. **Restraint di atas segalanya** — kalau ragu, kurangi. Animasi yang
   berlebihan bikin situs terasa murah, bukan premium.
2. **Motion punya hierarki** — elemen penting (headline, CTA, badge) dapat
   perhatian gerak lebih; elemen pendukung (body text, footer) diam atau
   minimal.
3. **Tidak pernah menghalangi konten** — orang yang scroll cepat harus tetap
   bisa baca semuanya, animasi jangan sampai membuat delay yang mengganggu.
4. **Hormati `prefers-reduced-motion`** — wajib, bukan opsional.

---

## 2. Tech Stack & Alasan Pemilihan

| Kebutuhan | Library | Kenapa |
|---|---|---|
| Smooth scroll momentum | **Lenis** | ~4kb gzip, momentum scroll bikin situs "terasa berat/premium" tanpa lag, mudah diintegrasikan dengan Next.js App Router |
| Reveal & orkestrasi animasi | **Motion** (dulu Framer Motion, sekarang paket `motion`) | Deklaratif, terintegrasi baik dengan React/Next, punya `whileInView` bawaan (tidak perlu Intersection Observer manual), tree-shakeable |
| Micro-interaction (hover, tap) | CSS transition native | Lebih ringan dari JS untuk interaksi sederhana — simpan budget JS untuk animasi yang benar-benar butuh orkestrasi |
| Scroll-driven choreography kompleks (opsional, hanya jika Hero butuh pinning/scrubbing lanjutan) | **GSAP + ScrollTrigger** | Hanya dipakai kalau Motion tidak cukup untuk 1-2 momen sinematik di Hero — jangan pakai di seluruh situs, cukup untuk 1 scene saja |

**Kenapa tidak Lottie/particle.js/library berat lain:** proyek ini scope sekolah,
harus tetap ringan di perangkat siswa yang mungkin pakai laptop/HP dengan
spek terbatas. Setiap library tambahan harus dipertanggungjawabkan bobotnya.

### Setup dasar Lenis (di root layout, client component terpisah)

```tsx
// src/components/SmoothScrollProvider.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // matikan momentum scroll kalau user minta reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) lenis.destroy();

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

Bungkus `{children}` di `layout.tsx` dengan komponen ini.

### Pola reveal yang dipakai berulang (variant)

```tsx
// src/lib/motion.ts
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerChildren = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};
```

Easing `[0.22, 1, 0.36, 1]` ("ease-out-expo"-ish) dipilih sengaja — terasa
lebih "premium" dibanding `ease-in-out` default, karena gerakan cepat di awal
lalu melambat halus di akhir, meniru objek fisik yang "mendarat".

---

## 3. Koreografi per Section

### Navbar
- Default transparan di atas Hero. Saat scroll melewati ~80px, background
  bertransisi jadi `bg-white/90 backdrop-blur` — pakai `useScroll` dari Motion
  untuk baca posisi scroll, transisi opacity 200ms.
- Indikator menu aktif (pill marun) pakai **shared layout animation**
  (`layoutId="active-pill"`) supaya saat pindah menu, pill-nya **meluncur**
  ke posisi baru — bukan cuma ganti warna instan. Ini detail kecil yang
  langsung terasa "dikerjakan developer senior".

### Hero — momen paling penting
Ini "pembuka kandaga" yang sesungguhnya, jadi paling banyak dapat perhatian:

1. **Curtain reveal saat load pertama**: 3 panel foto masuk dengan
   `clip-path` dari tertutup penuh ke terbuka, staggered kiri→tengah→kanan
   (delay 100ms antar panel) — seperti tirai yang dibuka satu per satu,
   bukan cuma fade.
2. **Wordmark "KANDAGA"** muncul setelah curtain selesai (delay ~500ms),
   fade+rise halus. **Jangan** animasikan per-huruf terpisah — untuk wordmark
   sebesar ini, split-text animation malah terasa norak untuk konteks
   institusi pendidikan. Simpan trik split-text untuk elemen yang lebih kecil.
3. **Parallax halus** pada 3 panel foto — foto bergerak ±8% lebih lambat dari
   kecepatan scroll (bukan library terpisah, cukup `useTransform` dari Motion
   terhadap scroll progress). Ini yang memberi kesan **kedalaman** tanpa biaya
   performa besar.
4. **CTA "MULAI JELAJAHI"**: hover state punya ring tipis warna emas yang
   "berdenyut" pelan (scale 1 → 1.05 → 1, opacity ring memudar) — bukan
   cuma darken background. Ini menyambungkan warna emas ke asosiasi
   "sesuatu berharga", konsisten dengan sistem badge nanti.

### Gallery Section
- **Filter pills**: sama seperti navbar, background pill aktif pakai shared
  `layoutId` supaya meluncur antar pilihan filter, bukan snap.
- **Tumpukan preview karya (tilted stack)**: saat masuk viewport, ketiga
  gambar animasi dari posisi lebih miring/menjauh ke posisi akhir yang lebih
  rapi — seperti 3 foto polaroid yang "ditata" tangan di meja. Gunakan
  `whileInView` dengan `viewport={{ once: true }}` supaya tidak berulang
  setiap kali di-scroll ulang (mengganggu, bukan restraint).
- **Grid katalog karya (saat sudah ada data asli)**: reveal staggered
  maksimal 6 kartu animasi bersamaan per viewport (batasi jumlah node yang
  animasi serentak — kalau grid 20 kartu, animasikan per baris saat masuk
  viewport, bukan semua 20 sekaligus).

### Stats Section (dark)
- **Count-up angka** ("247+", "18", "3×", "40+") dari 0 ke nilai akhir saat
  section masuk viewport, durasi ~1.2 detik dengan easing yang melambat di
  akhir. Ini kecil tapi efeknya besar — terasa seperti data "sedang
  dikonfirmasi real-time", padahal statis.
- **Aksen kilau emas sangat halus** di background (bukan partikel ramai) —
  cukup 1-2 elemen blur radial warna emas dengan opacity rendah (~8%) yang
  bergerak sangat lambat (20 detik per siklus). Ini elemen "signature" yang
  menghubungkan tema harta karun tanpa menjadi gimmick berat. **Wajib**
  pakai `prefers-reduced-motion` check untuk mematikan animasi ini.

### Why Section (kartu fitur)
- **Tilt-on-hover ringan**: kartu bereaksi ±4 derajat mengikuti posisi kursor
  (pure CSS transform via `onMouseMove`, tanpa library tambahan). Bukan
  efek 3D dramatis — cukup terasa "kartu punya bobot fisik".
- **Ikon check/circle/diamond**: animasi stroke SVG "menggambar diri sendiri"
  (`stroke-dashoffset` transition) saat kartu pertama masuk viewport.

### Badge & Detail Karya (untuk halaman berikutnya)
Ini momen paling representatif dari konsep "Kandaga":
- Medali badge punya **efek kilau sapuan cahaya** (light sweep) sekali saat
  pertama terlihat — pakai `linear-gradient` mask yang bergerak dari kiri ke
  kanan, durasi 800ms, sekali saja (bukan loop, supaya tidak mengganggu).
  Ini yang bikin badge terasa "berharga", bukan sekadar ikon status.
- Transisi galeri media di Detail Karya pakai `AnimatePresence` dari Motion
  untuk cross-fade antar gambar, bukan hard-cut.

---

## 4. Kedalaman Visual Tanpa Berat

"Kedalaman" tidak harus berarti efek 3D atau shader berat. Tiga trik ringan:

1. **Parallax berlapis maksimal 2-3 layer** (bukan puluhan layer seperti
   situs game) — cukup foreground, midground, background bergerak beda
   kecepatan.
2. **Sistem shadow bertingkat** — definisikan 3 token shadow (`shadow-sm`,
   `shadow-md`, `shadow-lg` bawaan Tailwind sudah cukup), pakai konsisten:
   card default = sm, card hover = md, modal/dropdown = lg. Konsistensi ini
   yang menciptakan rasa "kedalaman terstruktur", bukan shadow acak di
   setiap komponen.
3. **Timing yang tidak serentak** — elemen yang muncul berurutan (bukan
   bersamaan) secara psikologis terasa punya "lapisan Z", walau sebenarnya
   flat 2D. Ini prinsip termurah tapi paling efektif.

**Yang sengaja dihindari:** noise/grain texture, glassmorphism berlebihan,
gradient mesh dekoratif — semua ini berat untuk render dan tidak sesuai
identitas Kandaga yang flat & marun-emas-putih.

---

## 5. Budget Performa

| Item | Target |
|---|---|
| Total tambahan JS untuk animasi (Lenis + Motion, gzipped) | < 45kb |
| Animasi yang jalan di atas 1 elemen serentak (viewport) | Maks ~6-8 elemen |
| Durasi micro-interaction (hover, tap) | 150–250ms |
| Durasi reveal section | 400–700ms |
| Durasi transisi halaman (kalau pakai) | < 1 detik |

Aturan tambahan:
- Prioritaskan CSS transition murni untuk hover/focus — simpan JS animation
  library untuk orkestrasi scroll/viewport saja.
- `will-change` hanya ditempel saat elemen benar-benar sedang dianimasikan,
  dilepas setelahnya (Motion sudah handle ini otomatis, tapi kalau custom
  CSS, jangan taruh permanen di banyak elemen — bikin GPU memory bengkak).
- Jangan pasang GSAP untuk seluruh situs kalau Motion sudah cukup — GSAP
  hanya untuk 1 momen sinematik di Hero kalau benar-benar dibutuhkan
  (misalnya scroll-scrubbed pinning), bukan default di semua section.

---

## 6. Accessibility & Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Tambahan di level komponen: matikan Lenis, count-up, dan parallax secara
eksplisit (langsung tampilkan nilai akhir/posisi akhir) — jangan hanya
andalkan CSS override di atas untuk animasi berbasis JS/transform matrix,
karena override CSS murni tidak selalu menjangkau transform yang di-drive
JavaScript.

---

## 7. Checklist Sebelum Ship

- [ ] Semua animasi viewport pakai `once: true` (tidak berulang setiap
      scroll naik-turun — ini kesalahan paling umum yang bikin situs
      terasa "berisik")
- [ ] Tidak ada animasi yang menunda keterbacaan konten utama (headline,
      CTA) lebih dari 300ms
- [ ] `prefers-reduced-motion` teruji, bukan cuma ditulis
- [ ] Tidak lebih dari 1 momen "wow" per halaman (curtain reveal Hero) —
      kalau semua section punya efek dramatis, tidak ada yang terasa
      istimewa lagi
- [ ] Diuji di perangkat kelas menengah-bawah (bukan cuma laptop dev
      kencang) — mengingat audiens termasuk siswa dengan perangkat
      bervariasi

---

## 8. Prinsip Penutup

Animasi terbaik untuk proyek skala sekolah ini bukan yang paling banyak
efeknya, tapi yang **paling konsisten dengan cerita yang dibawa nama
"Kandaga" sendiri**: sesuatu yang berharga, yang diungkap dengan hati-hati,
bukan dipamerkan berlebihan. Itu juga yang akan membedakan situs ini dari
proyek kompetisi lain yang menumpuk animasi generik dari template.
