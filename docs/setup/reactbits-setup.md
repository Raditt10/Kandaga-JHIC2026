# Kandaga — Panduan Pemasangan & Fundamental ReactBits

> Dokumen terpisah dari `design.md`. Tujuannya dua: (1) kamu paham **cara
> kerja** ReactBits, bukan cuma copy-paste, dan (2) keputusan komponen mana
> yang dipasang di Kandaga tetap konsisten dengan prinsip di `design.md`
> (ringan, aman di layar sentuh, 1 momen "wow" per halaman).

---

## 0. Status Verifikasi (baca dulu)

Aku cek langsung ke sumbernya sebelum menulis dokumen ini. Hasilnya:

| Yang kamu sebut | Hasil pengecekan |
|---|---|
| **Flowing Menu** | ✅ Ada di ReactBits. Bergantung pada **GSAP**. Animasi dipicu hover (`mouseenter`/`mouseleave`). |
| **Scroll Expand** | ⚠️ Yang populer bernama `scroll-expansion-hero` / `ScrollExpandMedia`, tapi itu komponen **komunitas di 21st.dev**, bukan bagian ReactBits. |
| **Jelly radio** | ⚠️ Tidak ketemu komponen ber-nama itu di ReactBits. Yang ketemu: **Jelly Button** (21st.dev, komunitas) yang memakai GSAP + canvas dan memuat **rangkaian 215 gambar** dari host eksternal. |
| **Flex Carousel** | ⚠️ Tidak bisa aku konfirmasi ada komponen ber-nama itu. Beberapa carousel ReactBits yang terlihat (mis. Gradient/Parallax/Lenticular Carousel) tercantum di katalog **React Bits Pro (berbayar)**. |

Artinya: **hanya 1 dari 4 permintaan yang benar-benar komponen ReactBits gratis
yang bisa dipastikan**. Cek nama persis di [reactbits.dev](https://reactbits.dev)
sebelum menjanjikan ke tim. Sisanya, di §6 aku sediakan versi buatan sendiri
yang lebih ringan dan tanpa dependensi baru (memakai Motion yang sudah ada di
stack kita).

> Catatan: katalog ReactBits berubah tiap minggu. Kalau kamu menemukan
> komponen "Jelly Radio" atau "Flex Carousel" di situs resminya, cukup
> ikuti langkah §3 dengan nama komponen itu.

---

## 1. Fundamental: Apa Itu ReactBits & Bagaimana Cara Kerjanya

### Model "copy-paste", bukan paket npm

Ini konsep terpenting. ReactBits **bukan** library yang kamu `npm install`
lalu `import { X } from "react-bits"`. Modelnya seperti shadcn/ui:

```
Kamu jalankan CLI  →  kode komponen DISALIN ke folder project-mu
                      (src/components/...)  →  kamu yang memiliki kodenya
                      →  boleh diedit sesuka hati
```

Konsekuensinya:
- **Tidak ada versi yang "terkunci"** — kodenya milikmu. Update ReactBits
  tidak otomatis mengubah komponenmu.
- **Bundle hanya berisi yang kamu pakai** — tidak ada komponen lain yang ikut.
- **Kamu bertanggung jawab atas kodenya** — kalau ada bug/perf issue, kamu yang
  memperbaiki. Baca kodenya sekali; jangan diperlakukan sebagai kotak hitam.
- **Dependensi ikut per komponen** — misalnya Flowing Menu butuh `gsap`,
  komponen 3D butuh `three`/`ogl`. Setiap komponen menambah bobot sesuai
  dependensinya sendiri.

### 4 varian per komponen

| Varian | Arti | Untuk Kandaga |
|---|---|---|
| JS-CSS | JavaScript + file CSS biasa | ❌ |
| JS-TW | JavaScript + Tailwind | ❌ |
| TS-CSS | TypeScript + file CSS biasa | ⚠️ bisa, tapi ada file `.css` tambahan |
| **TS-TW** | **TypeScript + Tailwind** | ✅ **pilih ini** (project kita TypeScript + Tailwind v4) |

### Gratis vs Pro

- **ReactBits (gratis)**: 110+ komponen dalam 4 kategori — Text Animations,
  Animations, Components, Backgrounds.
- **React Bits Pro**: katalog terpisah berbayar (pembelian sekali bayar) dengan
  lebih banyak komponen & blok halaman. Kalau sebuah komponen cuma ada di
  `pro.reactbits.dev`, itu **berbayar** — jangan sampai tim mengandalkannya
  tanpa memutuskan soal anggaran/lisensi.

Cek juga file `LICENSE` di repo resmi untuk memastikan pemakaian di proyek
kompetisi/sekolah sesuai ketentuan.

---

## 2. Prasyarat di Project Kandaga

Stack kita: **Next.js (App Router) + TypeScript + Tailwind v4**.

Yang perlu dicek sebelum memasang komponen apa pun:

1. `tsconfig.json` punya alias `"@/*": ["./src/*"]` (default `create-next-app`
   dengan opsi `src/`).
2. Node.js versi LTS terbaru, dan `npm`/`pnpm` berjalan normal.
3. Sudah `git commit` — supaya kalau CLI menimpa/menambah file, kamu bisa
   melihat diff-nya dengan jelas.

---

## 3. Cara Memasang (3 Metode)

### Metode A — shadcn CLI (paling umum)

Pola perintah (dari README resmi):

```bash
npx shadcn@latest add @react-bits/<NamaKomponen>-TS-TW

# contoh yang tercantum di README resmi:
npx shadcn@latest add @react-bits/BlurText-TS-TW
```

Untuk Flowing Menu, polanya menjadi:

```bash
npx shadcn@latest add @react-bits/FlowingMenu-TS-TW
```

> Nama persisnya **salin dari halaman komponen** di reactbits.dev — tiap halaman
> menyediakan perintah siap-copy. Pola di atas hanya menunjukkan strukturnya.

Kalau CLI meminta `components.json`, jalankan dulu:

```bash
npx shadcn@latest init
```

lalu ulangi perintah `add`.

### Metode B — jsrepo CLI

Pola perintah (README resmi):

```bash
npx jsrepo add https://reactbits.dev/ts/tailwind/<KategoriKomponen>/<NamaKomponen>

# contoh dari README:
npx jsrepo add https://reactbits.dev/ts/tailwind/TextAnimations/SplitText
```

Nama kategori untuk komponen lain mengikuti halaman komponen masing-masing.

### Metode C — Copy manual (paling mudah dipahami)

Di halaman komponen pilih varian **TypeScript + Tailwind**, lalu salin kodenya
ke file baru. Metode ini bagus untuk **belajar**, karena kamu melihat
persis apa yang masuk ke project. Langkahnya:

1. Buat `src/components/FlowingMenu.tsx`, tempel kodenya.
2. Jalankan `npm install gsap` (dependensi yang disebut halaman komponen).
3. Import dan pakai di halaman.

### Setelah terpasang: 5 hal yang wajib dicek

1. **Lokasi file** — CLI menaruh di folder sesuai `components.json` (sering
   `src/components/ui/...`). Sesuaikan path import-mu.
2. **`"use client"`** — komponen yang memakai hook/GSAP/event handler harus
   client component. Kalau baris ini tidak ada di file hasil salinan, tambahkan
   di baris paling atas.
3. **Dependensi** — cek `package.json` ada `gsap`/`motion`/dll sesuai kebutuhan.
4. **Class Tailwind v4** — bila ada class yang tidak dikenali, cek dulu apakah
   itu utilitas valid di v4 (v4 memakai konfigurasi CSS-first, tanpa
   `tailwind.config.js`).
5. **Uji di HP sungguhan** — bukan cuma responsive mode di browser desktop
   (lihat §7).

---

## 4. Anatomi Komponen: Studi Kasus Flowing Menu

Supaya kamu paham cara kerjanya (bukan hanya memakainya), ini logika inti
Flowing Menu dari kode yang aku baca:

```
Untuk tiap item menu:
  ├─ mouseenter  → hitung sisi terdekat (atas/bawah) dari posisi kursor
  │               → GSAP timeline: taruh "pita marquee" di luar item
  │                 (y: -101% atau +101%), lalu geser ke y: 0%  → pita meluncur MASUK
  └─ mouseleave  → hitung sisi terdekat lagi
                  → geser pita keluar ke sisi tersebut          → pita meluncur KELUAR
```

Ide kuncinya: **arah animasi mengikuti dari mana kursor masuk/keluar**. Itu yang
memberi kesan "mengalir". Durasi ~0.6 detik dengan easing `expo`.

### Props yang dipakai (dari demo komponen)

| Prop | Isi |
|---|---|
| `items` | Array objek: `{ link, text, image }` |
| `link` | Tujuan klik |
| `text` | Label besar item |
| `image` | URL gambar yang muncul di pita marquee |

Komponen membutuhkan **kontainer dengan tinggi jelas** (demo memakai tinggi
tetap), karena item-itemnya mengisi tinggi induknya.

### Yang perlu kamu sadari dari kode ini
- Semua interaksi bertumpu pada **`mouseenter`/`mouseleave`** → tidak ada
  padanannya di layar sentuh. Di HP, item tetap berupa tautan teks biasa yang
  bisa diketuk, tapi **efek pita tidak muncul**. Itu bukan bug; itu keterbatasan
  desainnya.
- Pita marquee berisi animasi CSS **berulang tanpa henti** (`infinite`) selama
  item di-hover. Aman, karena hanya aktif saat hover — tapi tetap perlu
  dimatikan untuk `prefers-reduced-motion`.
- Ada dependensi **GSAP** (puluhan KB; ukuran pastinya cek dengan bundle
  analyzer, §7).

---

## 5. Keputusan Penerapan di Kandaga

Ini bagian penting: memilih **di mana** komponen dipasang, bukan sekadar bisa
atau tidaknya.

| Permintaan | Rekomendasi | Alasan |
|---|---|---|
| **Scroll Expand** ("Kandaga" kecil → membesar → slogan) | ✅ **Ya, tapi bikin sendiri** (§6.1) | Cocok sekali dengan konsep "membuka kandaga" di `design.md`. Versi buatan sendiri memakai Motion yang sudah ada → **0 dependensi baru**, dan kita kontrol performanya. |
| **Flowing Menu** | ✅ **Ya, untuk 1 tempat: daftar Jurusan** (§6.3) | Hanya 3 item (Analis Kimia, TKJ, RPL), masing-masing punya gambar → pas untuk komponen ini. Menambah GSAP, jadi hanya dipakai di sini, di-lazy-load. |
| **Jelly radio** | ✅ **Ya, versi buatan sendiri** (§6.2) | Yang di 21st.dev memuat 215 gambar dari host luar — terlalu berat & rapuh. Versi Motion spring cukup untuk efek "kenyal". |
| **Flex Carousel** | ⏸️ **Tunda dulu** | Belum bisa dipastikan komponennya. Untuk carousel, CSS `scroll-snap` native (tanpa JS) lebih ringan dan ramah sentuh. Kirim nama/tautan halamannya kalau kamu sudah menemukannya, nanti kita evaluasi. |

### Pengecualian anggaran (perlu dicatat di `design.md`)

`design.md` menetapkan GSAP hanya untuk "1 momen sinematik". Dengan Flowing
Menu, kita **memakai jatah itu di daftar Jurusan** (bukan di Hero). Aturan
turunannya:

- Maksimal **1 komponen** berbasis GSAP di seluruh landing page.
- Dimuat dengan `next/dynamic` (lazy) karena posisinya di bawah lipatan layar.
- Tidak memengaruhi LCP Hero.

Kalau nanti ada komponen ReactBits lain yang membawa GSAP/three/ogl, jatah ini
sudah terpakai — evaluasi ulang, jangan otomatis ditambah.

---

## 6. Kode Siap Pakai

### 6.1 `ScrollExpandHero` — versi buatan sendiri (Motion)

Konsep: section tinggi (~250vh) dengan isi `sticky`. Saat scroll, sebuah
"jendela" kecil di tengah **membesar sampai memenuhi layar**; teks "KANDAGA"
memudar, slogan muncul.

```tsx
// src/components/ScrollExpandHero.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export default function ScrollExpandHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Jendela membesar di 0 → 0.6 dari progress scroll
  const clip = useTransform(
    scrollYProgress,
    [0, 0.6],
    [
      "inset(30% 34% 30% 34% round 28px)", // kecil, di tengah
      "inset(0% 0% 0% 0% round 0px)",      // memenuhi layar
    ]
  );
  const wordmarkOpacity = useTransform(scrollYProgress, [0.2, 0.45], [1, 0]);
  const sloganOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const sloganY = useTransform(scrollYProgress, [0.55, 0.8], [24, 0]);

  // Pengguna yang minta reduced motion: langsung tampilkan keadaan akhir
  if (reduce) {
    return (
      <section className="relative flex h-screen items-center justify-center">
        <Image src="/images/smkn13.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-ink/60" />
        <p className="relative z-10 max-w-2xl px-6 text-center font-heading text-3xl font-semibold text-white md:text-5xl">
          Etalase karya siswa, terverifikasi sekolah, terbuka untuk industri.
        </p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[250vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {/* Jendela yang membesar */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <Image
            src="/images/hero-kolaborasi.jpg"
            alt="Siswa SMKN 13 Bandung mengerjakan proyek"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/50" />
        </motion.div>

        {/* Wordmark: terlihat saat jendela masih kecil */}
        <motion.h2
          style={{ opacity: wordmarkOpacity }}
          className="absolute inset-0 flex items-center justify-center font-heading text-5xl font-bold tracking-tight text-white md:text-7xl"
        >
          KANDAGA
        </motion.h2>

        {/* Slogan: muncul setelah jendela penuh */}
        <motion.p
          style={{ opacity: sloganOpacity, y: sloganY }}
          className="absolute inset-0 flex items-center justify-center px-6 text-center font-heading text-3xl font-semibold text-white md:text-5xl"
        >
          Etalase karya siswa, terverifikasi sekolah, terbuka untuk industri.
        </motion.p>
      </div>
    </section>
  );
}
```

**Kenapa `clip-path`, bukan animasi `width`/`height`?** Mengubah `width`/`height`
memaksa browser **menghitung ulang layout di setiap frame scroll** (mahal,
terutama di HP kelas menengah). `clip-path` hanya mempengaruhi tahap *paint*,
jauh lebih murah. Ini contoh prinsip performa yang bisa kamu jelaskan ke juri.

**Yang perlu kamu ganti:** teks slogan (aku pakai kalimat placeholder dari
tagline yang sudah ada — ganti dengan slogan resmi Kandaga) dan path gambar.

**Kompatibilitas dengan Lenis:** aman. Lenis hanya menghaluskan scroll native,
sehingga `useScroll` membaca posisi yang sama.

### 6.2 `JellyRadio` — versi buatan sendiri (Motion spring)

Efek "kenyal" = *squash & stretch*: saat dipilih, elemen sesaat memipih ke
samping lalu memantul kembali. Yang penting: tetap memakai **`<input type="radio">`
asli** supaya keyboard (tombol panah) dan screen reader berfungsi.

```tsx
// src/components/JellyRadio.tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";

type Option = { value: string; label: string };

type Props = {
  name: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export default function JellyRadio({ name, options, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue ?? options[0].value);

  return (
    <div role="radiogroup" className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label key={opt.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => {
                setValue(opt.value);
                onChange?.(opt.value);
              }}
              className="peer sr-only"
            />
            <motion.span
              animate={
                active
                  ? { scaleX: [1, 1.18, 0.94, 1.03, 1], scaleY: [1, 0.82, 1.08, 0.98, 1] }
                  : { scaleX: 1, scaleY: 1 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`block rounded-full border px-5 py-2 text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-ink-300 text-ink-700 hover:border-ink"
              }`}
            >
              {opt.label}
            </motion.span>
          </label>
        );
      })}
    </div>
  );
}
```

**Tempat pemakaian yang masuk akal (micro-interaction, bukan dekorasi):**
pilihan role di halaman Login (Siswa / Guru / Perusahaan), atau filter jenis
karya di katalog. Jangan dipasang di banyak tempat sekaligus.

**Aksesibilitas otomatis:** bungkus aplikasi dengan
`<MotionConfig reducedMotion="user">` di layout — pengguna yang mengaktifkan
"reduce motion" di sistem operasinya tidak akan melihat animasi transform ini.

### 6.3 Flowing Menu untuk daftar Jurusan

Setelah komponen dipasang lewat §3, pemakaiannya seperti ini. Karena membawa
GSAP, dimuat secara lazy dari **client component**:

```tsx
// src/components/JurusanMenu.tsx
"use client";

import dynamic from "next/dynamic";

// Path import menyesuaikan lokasi hasil pemasangan (cek di project-mu)
const FlowingMenu = dynamic(() => import("@/components/FlowingMenu"), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse bg-ink-100" />,
});

const items = [
  { link: "/jurusan/analis-kimia", text: "Analis Kimia", image: "/images/jurusan-kimia.jpg" },
  { link: "/jurusan/tkj", text: "TKJ", image: "/images/jurusan-tkj.jpg" },
  { link: "/jurusan/rpl", text: "RPL", image: "/images/jurusan-rpl.jpg" },
];

export default function JurusanMenu() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-8 font-heading text-3xl font-semibold text-ink">
        Jelajahi per Jurusan
      </h2>
      {/* Wajib punya tinggi jelas — item mengisi tinggi induknya */}
      <div className="h-[420px] overflow-hidden rounded-2xl">
        <FlowingMenu items={items} />
      </div>
    </section>
  );
}
```

Letakkan `<JurusanMenu />` di `page.tsx` setelah `WhySection`. Skeleton
`animate-pulse` mencegah layout melompat saat komponen selesai dimuat.

---

## 7. Checklist Sebelum Dianggap Selesai

- [ ] **Uji di HP sungguhan** — tap pada Flowing Menu tetap membuka halaman
      jurusan; scroll-expand terasa mulus, bukan patah-patah.
- [ ] **`prefers-reduced-motion`** teruji (nyalakan di pengaturan OS): scroll
      expand tampil statis, jelly radio tidak memantul, marquee tidak jalan.
- [ ] **Ukur bobot bundle** — pasang `@next/bundle-analyzer`, jalankan build,
      lihat berapa kB yang ditambah GSAP. Catat angkanya di `design.md`.
- [ ] **Hero tidak melambat** — cek LCP dengan Lighthouse sebelum & sesudah
      memasang komponen.
- [ ] **Hanya 1 komponen GSAP** di landing page (aturan §5).
- [ ] **Lisensi** komponen yang dipakai sudah dibaca (terutama kalau ada yang
      dari katalog Pro atau dari 21st.dev, yang lisensinya tertulis "unknown"
      pada beberapa komponen komunitas).
- [ ] **Semua gambar** ada di `public/images/` dengan nama yang dipakai kode.

---

## 8. Troubleshooting Umum

| Gejala | Penyebab & solusi |
|---|---|
| `window is not defined` / `document is not defined` | Komponen dirender di server. Tambahkan `"use client"`; bila masih error, muat dengan `dynamic(..., { ssr: false })` dari dalam client component. |
| `Module not found: gsap` | Dependensi belum terpasang: `npm install gsap`. |
| Error soal hook di Server Component | File belum diberi `"use client"` di baris pertama. |
| Warning hydration mismatch | Komponen membaca `window`/`Math.random()` saat render pertama. Pindahkan ke `useEffect`. |
| Item Flowing Menu menyusut/hilang | Kontainer induk tidak punya tinggi. Beri `h-[420px]` atau sejenisnya. |
| Class Tailwind tidak berefek | Cek apakah utilitasnya valid di Tailwind v4 dan apakah token warna (`bg-primary` dst.) sudah terdaftar di `@theme` pada `globals.css`. |
| Scroll expand tersendat di HP | Pastikan memakai `clip-path` (bukan `width`/`height`), gambar sudah dikompres, dan tidak ada animasi lain aktif bersamaan di area yang sama. |

---

## 9. Catatan Tindak Lanjut untuk `design.md`

Tambahkan (ringkas) ke bagian yang relevan:

1. **Hero/Scroll**: `ScrollExpandHero` (jendela membesar → slogan) sebagai
   "momen wow" utama — menggantikan curtain reveal *atau* dipakai bersama
   dengan syarat curtain reveal disederhanakan (jangan dua momen dramatis
   berdampingan; lihat Aturan Emas §1).
2. **Jurusan**: Flowing Menu = satu-satunya komponen GSAP di landing page.
3. **Micro-interaction**: `JellyRadio` khusus pilihan role & filter.
4. **Daftar penolakan**: tambahkan "Jelly Button 21st.dev (215 frame dari host
   eksternal)" dan "Flex Carousel (belum terverifikasi)".

Perhatikan poin 1: kalau Hero sekarang sudah punya curtain reveal + magnetic
CTA, menambah scroll-expand berarti **dua momen dramatis di area yang
berdekatan**. Sebaiknya putuskan salah satu jadi bintang utama, dan yang lain
diturunkan intensitasnya.
