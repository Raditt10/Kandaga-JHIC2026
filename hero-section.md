# Hero Section Redesign — KANDAGA Major Gallery

> File ini adalah spesifikasi (steering) untuk Kiro CLI.
> Tugas: **ganti hero section yang sekarang** dengan desain baru "3 Jurusan, 3 Lingkaran".
> Ikuti semua bagian di bawah. Jika ada konflik antara file ini dan kebiasaan umum, **file ini yang menang**.
>
> **Versi**: v3 — diperbarui 2026-10-03. Perubahan dari v2 ditandai `[v3]`.

---

## 1. Konteks Project

- Nama: **KANDAGA — Major Gallery**
- Fungsi: etalase digital karya terbaik siswa **SMKN 13 Bandung**, terverifikasi sekolah, terbuka untuk industri.
- Bahasa UI: **Bahasa Indonesia**.
- Dev server berjalan di `localhost:3000`.
- Stack **belum pasti** → langkah pertama WAJIB: deteksi stack dari `package.json` dan struktur folder
  (Next.js App Router / Pages Router / React + Vite / dll). Ikuti konvensi yang sudah ada (TypeScript vs JS,
  Tailwind vs CSS Modules vs CSS biasa). **Jangan** ganti stack, **jangan** install framework baru.

## 2. Kondisi Sekarang (yang diganti)

Hero saat ini berisi:
- Navbar berbentuk pill putih melayang: logo `KANDAGA`, menu, tombol `Masuk` (crimson, rounded-full).
- Judul besar `KANDAGA`, sub-judul `M A J O R   G A L L E R Y` (crimson, letter-spacing lebar), paragraf
  "Etalase digital karya terbaik siswa SMKN 13 Bandung terverifikasi sekolah, terbuka untuk industri.",
  tombol `MULAI JELAJAHI`.
- Latar: **3 kolom foto** (gadis bersepeda, gunung, raspberry) yang memudar ke putih.

## 3. Desain Target

Referensi visual: tiga lingkaran crimson yang saling bertumpuk, masing-masing berisi satu siswa (cutout PNG)
dari satu jurusan, dikelilingi ikon outline yang melayang dan cincin konsentris tipis di belakang.

### 3.1 Struktur (atas → bawah)

1. **Navbar** — PERTAHANKAN apa adanya.
2. **Blok teks hero** (rata tengah): `KANDAGA`, `MAJOR GALLERY`, paragraf, tombol `MULAI JELAJAHI`.
   Teks, font, dan warna **sama seperti sekarang**. Tombol tetap mengarah ke `/gallery`.
3. **Panggung 3 lingkaran** (elemen utama baru) tepat di bawah blok teks.
4. [v2] Hero berakhir **flush** (tanpa celah) dengan section di bawahnya. Lingkaran dipotong tepat
   oleh tepi bawah hero (kaki model menyentuh tepi section berikutnya). Tidak ada padding/margin bawah.

### 3.2 Panggung 3 Lingkaran

| Posisi | Jurusan (label default) | Isi lingkaran | Pose siswa |
|---|---|---|---|
| Kiri | **RPL** — Rekayasa Perangkat Lunak | Pola angka biner `0 1` samar | Memegang laptop |
| Tengah | **Kimia Analisis** | Struktur molekul garis | Jas lab, memegang pipet |
| Kanan | **TKJ** — Teknik Komputer & Jaringan | Pola jaringan titik-garis | Memegang kabel LAN |

Aturan geometri [v2]:
- Lingkaran **sempurna** (`aspect-ratio: 1/1`, `border-radius: 9999px`).
- [v2] Diameter desktop: `clamp(300px, 32vw, 600px)`; lingkaran tengah **1.12× lebih besar**.
- Overlap horizontal: **12–18%** dari diameter samping (kiri & kanan menyelip di belakang tengah).
- Kepala siswa di dalam lingkaran; tubuh bawah boleh keluar (dipotong oleh tepi bawah hero).
- [v2] Lingkaran: **radial-gradient** dari `--hero-brand-light` di kiri-atas ke `--hero-brand` di kanan-bawah
  (bukan warna solid flat).
- Pola dekorasi **SVG inline**, opasitas 0.25, [v2] di-mask (`mask-image: radial-gradient`) agar fade di area
  wajah/tubuh model. Tidak mengalahkan siswa.
- **Bayangan blur abu-abu** di belakang lingkaran kiri & kanan (`radial-gradient`, `filter: blur(55px)`),
  posisi `bottom: 0` (rata dasar stage).
- [v2] **Glow radial crimson** sangat tipis (`.hero-center-glow`) di belakang lingkaran tengah untuk fokus.
- [v2] **Drop-shadow** pada gambar model: `filter: drop-shadow(0 12px 24px rgba(0,0,0,.28))`.

### 3.3 Ikon Melayang [v2 — distribusi 3 zona]

Gunakan **SVG outline** stroke ±1.5px, warna crimson. Variasikan ukuran (28–48px) dan opasitas (0.55–1).
Total: **9–10 ikon**. Di mobile maks **5 ikon** (sisanya `display: none`).
Jaga jarak minimal **24px** dari teks dan wajah model.

**Zona Atas** (sekitar blok teks, 4 ikon, jarak min 32px dari teks):
- `</>` — `left:14%, top:16%`
- Labu erlenmeyer — `left:85%, top:14%`
- Wifi — `left:22%, top:30%`
- API — `left:76%, top:32%`

**Zona Samping Stage** (dekat lingkaran, 4 ikon):
- Molekul — `left:8%, top:52%`
- Keyboard — `left:5%, top:68%`
- Ethernet/RJ45 — `left:93%, top:58%`
- Globe — `left:90%, top:74%`

**Zona Bawah** (luar area model, 2 ikon):
- `404` — `left:11%, top:88%`
- Database — `left:88%, top:90%`

Aturan:
- Posisi pakai persen. **Jangan ada ikon menimpa wajah atau tubuh model.**
- Animasi: float 6–9 detik, ease-in-out, delay berbeda tiap ikon.
- Dekoratif → `aria-hidden="true"`.

### 3.4 Latar

- Latar hero: putih bersih (`#ffffff`).
- Di belakang panggung: **4 cincin/busur konsentris** SVG, stroke crimson sangat pucat
  (opasitas ≈ 0.04–0.09), terpusat di bawah-tengah panggung.
- Tidak ada gradient ungu/biru atau warna di luar palet.

### 3.5 Improvisasi yang DIIZINKAN

- Hover/focus: lingkaran naik `translateY(-10px) scale(1.03)`, transisi 250ms ease-out. **Chip label**
  muncul dengan opacity transition saja (tanpa slide). Hilang saat hover selesai.
- Animasi masuk: fade + naik 16px, durasi 500ms, stagger 80ms (tengah → kiri → kanan), hanya sekali.
- Klik lingkaran → arahkan ke halaman/filter jurusan **hanya jika route sudah ada** (`routeExists` flag).

### 3.6 Yang TIDAK boleh dilakukan

- Jangan ubah navbar, footer, section lain, routing, atau data/API.
- Jangan ubah palet warna brand; ambil crimson dari CSS yang sudah ada
  (fallback: `#8B1A2F`; `--hero-brand-light: #C2254E`).
- Jangan taruh teks di dalam gambar.
- Jangan pakai `localStorage`/library animasi berat (GSAP, Three.js).
- Jangan menghapus komponen hero lama: simpan sebagai `HeroLegacy.tsx`.

## 4. Aset Gambar

```
public/images/hero/
├── siswa-rpl.png      ← siswa kiri (laptop)
├── siswa-kimia.png    ← siswa tengah (jas lab)
└── siswa-tkj.png      ← siswa kanan (kabel LAN)
```

- PNG transparan (cutout), portrait ≥900px.
- `next/image` dengan `priority` + `fill` + `sizes` yang tepat.
- Jika file belum ada: render placeholder siluet CSS/SVG, beri komentar `TODO`.
- `alt` deskriptif.

## 5. Struktur Kode

```
src/components/landing/
├── Hero.tsx              ← pembungkus: blok teks + stage
├── HeroStage.tsx         ← 3 lingkaran + glow + bayangan + cincin konsentris
├── HeroMajorCircle.tsx   ← 1 lingkaran + HERO_MAJORS config
├── HeroFloatingIcons.tsx ← ikon melayang (3 zona)
├── hero.css              ← semua gaya + CSS variables
└── HeroLegacy.tsx        ← cadangan hero lama (jangan hapus)
```

Konfigurasi jurusan (satu sumber kebenaran, di HeroMajorCircle.tsx):

```ts
export const HERO_MAJORS = [
  { id: "rpl",   label: "RPL",            full: "Rekayasa Perangkat Lunak",       image: "/images/hero/siswa-rpl.png",   pattern: "binary",   href: "/karya?jurusan=rpl" },
  { id: "kimia", label: "Kimia Analisis", full: "Analisis Kimia",                 image: "/images/hero/siswa-kimia.png", pattern: "molecule", href: "/karya?jurusan=kimia" },
  { id: "tkj",   label: "TKJ",            full: "Teknik Komputer dan Jaringan",   image: "/images/hero/siswa-tkj.png",   pattern: "network",  href: "/karya?jurusan=tkj" },
];
```

CSS variables utama (di `.hero-root`):

```css
--hero-brand:        #8B1A2F;
--hero-brand-mid:    #A01535;
--hero-brand-light:  #C2254E;
--d:       clamp(280px, 31vw, 590px);          /* [v3] diameter samping */
--d-mid:   calc(var(--d) * 1.12);               /* [v3] diameter tengah */
--overlap: calc(var(--d) * -0.15);
--model-h: calc(var(--d) * 1.45);              /* [v3] tinggi model */
--enter-dur:    0.5s;
--hover-dur:    0.25s;
```

### [v3] Perbaikan Model Bergeser

**Akar masalah v2**: `.hero-circle-student-wrap` punya `left:50%; transform:translateX(-50%)`,
dan `<img>` di dalamnya (next/image fill) **juga** menghasilkan `position:absolute; left:0`.
Kombinasi ini membuat gambar bergeser ±250px ke kiri.

**Fix v3**:
- `.hero-circle-student-wrap`: `position:absolute; inset:0` — TIDAK ada `left`/`transform`.
- `<img>` (next/image dengan `width`/`height` fixed, bukan `fill`):
  `position:absolute; bottom:0; left:50%; transform:translateX(-50%)` — centering **satu kali saja**.
- Placeholder siluet hanya dirender melalui `useState imgError` — tidak ada di DOM saat gambar berhasil.

### [v3] Ikon di Hero-Root

**Akar masalah v2**: `HeroFloatingIcons` ada di dalam `HeroStage`, sehingga `position:absolute inset:0`
hanya mencakup stage → semua ikon sejajar model, zona atas kosong.

**Fix v3**: `HeroFloatingIcons` dipindah ke `Hero.tsx`, langsung di dalam `hero-root`.
`inset:0` sekarang mencakup seluruh tinggi hero termasuk area teks.

## 6. Layout & Celah Bawah [v3]

```
.hero-root {
  min-height: 100svh;
  overflow: hidden;
  padding-top: clamp(106px, 10vw, 128px);
  display: flex;
  flex-direction: column;
}

/* Blok teks menyerap ruang kosong di atas stage, tanpa mengubah spacing internal. */
.hero-text-block {
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: clamp(14px, calc(38px - 1.25vw), 26px);
}

/* Jarak paragraf → tombol */
.hero-cta-wrapper { margin-top: clamp(24px, 2.2vw, 36px); }

/* Stage tidak tumbuh; tetap menempel di dasar hero. */
.hero-stage {
  flex: 0 0 auto;
  align-items: flex-end;
  padding-top: clamp(48px, 3.5vw, 56px);
  min-height: calc(var(--d-mid) * 0.60);
}
```

Nilai spacing final:
- Ruang ekstra diserap oleh `margin-top: auto` pada blok teks, bukan dengan membesarkan gap CTA ke lingkaran.
- Padding atas menjaga clearance navbar minimum 32px saat viewport pendek; di mobile gunakan 108px.
- Navbar → judul KANDAGA: adaptif terhadap tinggi ruang yang tersedia; minimum clearance **32px**.
- Paragraf → tombol: `clamp(24px, 2.2vw, 36px)` ≈ **28px** di 1280px
- Tombol → puncak lingkaran tengah: sekitar **70–74px** normal dan tetap di atas **48px** saat hover.
- Pada 1280×940: navbar → judul sekitar **87px**; tombol → lingkaran sekitar **70px** normal / **53px** saat hover.
- Catatan: target 110px navbar dan 70px CTA tidak dapat dicapai bersamaan pada tinggi 940px dengan ukuran teks dan lingkaran saat ini; pertahankan clearance navbar 32px dan jarak hover minimum 48px tanpa membesarkan hero.

### Chip Label [v3]

Chip dipindah ke **dalam** lingkaran bagian bawah:
```css
.hero-label-chip {
  position: absolute;
  bottom: 7%;          /* dalam lingkaran, tidak bisa keluar ke tombol */
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;          /* di atas foto model */
  opacity: 0;
  visibility: hidden;
}
/* Hanya muncul saat hover/focus-visible — opacity transition 200ms */
```
Posisi lama `bottom: calc(100% + 10px)` (di atas lingkaran) menyebabkan chip muncul tepat di bawah tombol CTA dan terlihat tanpa hover.

## 7. Perbaikan Bug Hover [v2]

**Akar masalah**: animasi masuk (`heroCircleEnter`) dan transform hover berada pada elemen yang **sama**.
Saat hover → CSS rule `animation: none` menimpa. Saat hover-out → rule itu hilang →
browser menjalankan ulang `heroCircleEnter` dari awal (slide-up lagi).

**Solusi — dua wrapper terpisah**:

```
.hero-circle-enter-wrap   ← animation: heroCircleEnter (sekali, fill-mode: both)
                             TIDAK PERNAH diubah setelah mount
  └─ .hero-circle-hover-wrap ← HANYA transition: transform, box-shadow
                                TIDAK ADA keyframe di sini
       ├─ .hero-circle          (background radial-gradient)
       ├─ .hero-circle-pattern  (pola SVG + mask)
       ├─ .hero-circle-student-wrap → <Image>
       └─ .hero-label-chip      (opacity-only, tanpa slide)
```

Hover rule:
```css
.hero-circle-hover-wrap:hover,
.hero-circle-hover-wrap:focus-visible {
  transform: translateY(-10px) scale(1.03);
  transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
}
```

Saat hover-out: transition balik 250ms ke posisi semula. Tidak ada keyframe baru.

## 8. Responsif

| Lebar | Perilaku |
|---|---|
| ≥ 1024px | `--d: clamp(280px, 31vw, 590px)`, semua 10 ikon |
| 640–1023px | `--d: clamp(200px, 30vw, 340px)`, ikon 6–7 |
| < 640px | `--d: clamp(105px, 37vw, 195px)`, overlap 20%, maks 5 ikon |

- Tidak boleh ada scroll horizontal di 360px (`overflow: hidden` pada `.hero-root`).
- Teks `KANDAGA` memakai `clamp(2.75rem, 8vw, 5.5rem)`.

## 9. Aksesibilitas & Performa

- Hormati `prefers-reduced-motion: reduce` → matikan semua animasi.
- Kontras teks ke latar putih ≥ 4.5:1.
- Elemen interaktif bisa difokus keyboard dengan `:focus-visible` ring.
- 3 gambar siswa dimuat `priority` (LCP); ikon & pola = SVG inline (tanpa request tambahan).
- Tidak ada layout shift: gambar pakai `fill` + `sizes`, wrapper punya dimensi CSS eksplisit.

## 10. Definition of Done

- [ ] `localhost:3000` menampilkan hero baru; 3 foto latar lama sudah hilang.
- [ ] Navbar identik dengan sebelumnya.
- [ ] 3 lingkaran crimson bertumpuk dengan gradient, tengah paling besar & paling depan.
- [ ] Tidak ada celah/strip putih antara dasar hero dan section berikutnya.
- [ ] Bayangan blur abu-abu kiri/kanan dan cincin konsentris pucat terlihat.
- [ ] Glow radial crimson tipis di belakang lingkaran tengah.
- [ ] 10 ikon outline melayang di 3 zona (5 di mobile), `aria-hidden`.
- [ ] Hover/focus: gerak maju + chip label, tanpa slide-up saat hover-out.
- [ ] Tanpa gambar siswa pun halaman tetap rapi (placeholder siluet).
- [ ] Tidak ada scroll horizontal di 360px; build tanpa error (`npm run lint`/`npm run build` lolos).
- [ ] Tidak ada dependency baru.

## 11. Format Laporan Akhir dari Kiro

Setelah selesai, jawab singkat:
1. Penyebab bug animasi hover dan cara fix.
2. Daftar file yang dibuat/diubah.
3. Nilai ukuran/posisi utama yang dipakai.
4. Apa yang perlu dilakukan user.
