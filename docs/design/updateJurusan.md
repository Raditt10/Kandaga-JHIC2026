# Update Halaman Jurusan — Audit & Redesign Spec

> Dokumen saudara dari `pm-feedback-review.md`, kali ini untuk halaman
> **Jurusan** (Hero "Tiga Pilar Keahlian" sampai CTA Kemitraan). Sama
> seperti sebelumnya: setiap usulan dinilai dengan 3 kriteria tetap dari
> `design.md` — (1) budget performa, (2) berfungsi di layar sentuh,
> (3) konsisten dengan prinsip *restraint* (1 momen wow per halaman).
>
> Bedanya dengan review sebelumnya: kali ini ada **temuan dari tool
> anotasi otomatis** (kotak kuning di screenshot) yang bukan soal selera —
> itu bug aksesibilitas/tipografi nyata. Aku pisahkan dulu sebelum masuk
> ke perdebatan gaya visual, karena dua kategori ini butuh penanganan beda.

---

## 1. Perbaikan Wajib (P0) — Bukan Opsional, Bukan Soal Selera

Ini semua ditemukan tool anotasi di screenshot, dan **harus diperbaiki
terlepas dari arah desain Awwwards jadi dipakai atau tidak**:

| Temuan | Masalah | Perbaikan |
|---|---|---|
| **Overused font — Inter 85% teks** | Semua elemen (termasuk H1 "Tiga Pilar Keahlian...") memakai Inter. Ini **menyimpang dari sistem tipografi yang sudah kita tetapkan** di `design.md`: heading harus Poppins, body Inter. Ini bukan kebutuhan desain baru — ini bug implementasi dari spec yang sudah ada. | Terapkan ulang `font-heading` (Poppins) ke semua H1–H4 di halaman ini. |
| **Skipped heading level** (`<h1>` → `<h3>` "Slot Model 3D...", lalu `<h2>` "Rekayasa Perangkat Lunak") | Urutan heading harus berjenjang tanpa loncat, wajib untuk screen reader dan SEO. | Audit ulang seluruh heading halaman: `<h1>` judul utama → `<h2>` per section (Deskripsi, Program Unggulan, dst.) → `<h3>` untuk sub-item. Label "3D Model Slot" itu placeholder internal — jangan pakai tag heading sama sekali, cukup `<span>`/`aria-label`. |
| **Low contrast text** (deskripsi hero, badge "Akreditasi A"/"Teaching Factory") | Teks abu-abu tipis di atas latar terang gagal kontras minimum WCAG AA (4.5:1 untuk teks biasa). | Naikkan ke `--color-ink-700` minimum untuk body text di atas putih/krem, bukan `--color-ink-600` atau lebih terang. |
| **Tiny body text / Undersized functional text** (label "3 Thn", "4 Thn", teks status kanan seperti "STATUS: READY") | Di bawah ukuran baca nyaman (idealnya ≥ 14px untuk teks fungsional, ≥16px body utama), dan target tap di mobile jadi terlalu kecil (di bawah 44×44px yang direkomendasikan). | Naikkan minimum jadi `text-sm` (14px) untuk label pendukung, `text-base` untuk body. Perbesar area tap pada chip durasi. |
| **All-caps body text** ("PILIH JURUSAN UNTUK MELIHAT SPESIFIKASI:") | All-caps pada kalimat panjang memperlambat keterbacaan (bentuk huruf jadi seragam, mata kehilangan penanda bentuk kata) dan pada beberapa screen reader diucapkan huruf-per-huruf. | Ubah ke sentence case; all-caps hanya untuk **label pendek** (3–4 kata), sesuai yang sudah kita lakukan di label "GALERI", "TENTANG KARYA" di landing page. |
| **Gradient text overused** (2 penanda "GRADIENT TEXT" di judul yang sama) | Efek gradient pada teks yang sudah bold+besar itu berlebihan — dua efek penekanan sekaligus (bold DAN gradient) saling menghilangkan, bukan saling menguatkan. | Pilih satu: warna solid marun (`--color-primary`) untuk kata kunci, **atau** gradient tipis — jangan dua penekanan sekaligus. |
| **Pill buttons bertumpuk berantakan** (filter jurusan di hero) | Bug layout — bukan soal gaya, ini `flex-wrap` yang tidak diberi `gap` cukup, atau lebar kontainer tidak dihitung dengan benar. | Perbaiki spacing (`gap-3`), pastikan setiap pill match dengan pola sticky filter yang sudah dipakai di Gallery Section. |

**Kenapa bagian ini dipisah duluan:** kalau 7 hal di atas tidak dibereskan,
mengerjakan animasi Awwwards di atasnya sama seperti mengecat ulang rumah
yang pondasinya retak — hasil akhirnya tetap terasa tidak profesional di
mata siapa pun yang memperhatikan detail (termasuk juri).

---

## 2. Menyikapi Klaim "AI Slop" — Setuju Sebagian, Bukan Semua

Kritik di dokumen sumber menyimpulkan: rapi + grid simetris + nested card
= otomatis buruk ("AI Slop"). Aku perlu meluruskan ini sebagai desainer:

**Yang aku setuju:**
- 4 kartu 2×2 dengan ikon di pojok kanan atas + judul + deskripsi pendek
  memang pola paling generik yang ada — hampir semua "SaaS landing page
  generator" menghasilkan pola ini persis. Ini valid dikritik.
- Ikon centang dalam rounded box untuk "Fokus Kompetensi" juga pola
  template yang sama, ditemukan di ribuan situs serupa.

**Yang aku TIDAK setuju — dan ini penting:**
- **Grid/simetri itu sendiri bukan musuh.** Grid adalah alat, bukan gaya.
  Editorial design kelas atas (majalah, buku desain) justru **memakai grid
  secara ketat** — yang membedakan "generic" dari "premium" bukan ada-
  tidaknya grid, tapi **apakah proporsi, jarak, dan hierarki di dalam grid
  itu disengaja atau sekadar default framework**. "Break the grid" tanpa
  alasan sama beresikonya dengan "rapi tanpa jiwa" — dua-duanya bisa gagal.
- Rekomendasi untuk mengganti SEMUA elemen terstruktur (checkbox, kartu)
  dengan animasi kinetik/marquee/hover-reveal berisiko menciptakan masalah
  baru yang sudah kita bahas tuntas di `pm-feedback-review.md`: rusak di
  layar sentuh, menambah bobot render, dan marquee melanggar prinsip kita
  sendiri soal "animasi tidak boleh berulang tanpa henti" (lihat §4).

Jadi pendekatan di bawah ini: **ambil intent kritiknya (jangan generik),
tapi eksekusinya disaring lewat prinsip yang sudah kita pegang sejak
`design.md`**, bukan ditelan mentah-mentah sebagai daftar fitur.

---

## 3. Tinjauan Per Section

### A. Hero Section

| Usulan | Verdict | Alasan |
|---|---|---|
| Ganti H1 jadi Display Serif Italic + Grotesk Bold | **Ditolak** | Menambah *font ketiga* ke sistem yang sudah punya 2 (Poppins/Inter) — menambah bobot loading font, dan serif elegan/italic **bertentangan dengan identitas Kandaga** yang sudah kita bangun (marun-emas-charcoal, motif blueprint/teknik untuk SMK vokasi). Serif italic terasa seperti butik/fashion brand, bukan sekolah teknik. **Yang benar-benar dibutuhkan** cuma menerapkan Poppins Bold yang SUDAH ada di sistem kita (lihat P0 §1) — itu saja sudah menyelesaikan masalah "kehilangan karakter" tanpa font baru. |
| Immersive 3D Scroll (teks pecah, model 3D membesar penuh layar) | **Ditunda — butuh keputusan produksi aset dulu** | Screenshot menunjukkan area 3D masih **placeholder kosong** ("Slot Model 3D Siap Diintegrasikan") — belum ada aset nyata. Menjanjikan animasi 3D sinematik sebelum aset dan pipeline (siapa yang model 3D-nya, format apa, dari device apa dites) diputuskan adalah menaruh gerobak di depan kuda. Three.js/Spline runtime menambah **ratusan KB**, jauh di atas budget 45kb yang kita tetapkan untuk seluruh animasi situs. **Keputusan yang perlu diambil tim dulu**: apakah benar-benar mau berinvestasi bikin 3D asset asli (butuh skill 3D modelling), atau cukup ilustrasi SVG bergaya isometrik yang jauh lebih murah dan tetap terlihat teknikal (selaras dengan motif blueprint yang sudah ada). |
| Floating Dock navigasi jurusan (gaya dock macOS) | **Ditolak** | Dock dengan efek magnify berguna kalau item banyak (menghemat ruang lewat animasi ukuran) — di sini cuma 4 pilihan (Semua/RPL/TKJ/Analis Kimia). Untuk 4 item, dock cuma menambah kompleksitas interaksi tanpa manfaat nyata, dan efek magnify saat hover **tidak ada padanan di layar sentuh** (masalah yang sama berulang dari review sebelumnya). Perbaiki saja jadi sticky pill filter — pola yang **sudah kita bangun dan uji** di Gallery Section landing page, tinggal dipakai ulang di sini untuk konsistensi. |

### B. Deskripsi Jurusan & Kompetensi Utama

| Usulan | Verdict | Alasan |
|---|---|---|
| Editorial layout: lebar kolom dibatasi 60–70 karakter/baris | **Diadopsi** | Ini bukan gaya, ini prinsip keterbacaan dasar (*optimal line length*) — line length yang sekarang memang kepanjangan (terkonfirmasi anotasi tool). Terapkan `max-width` berbasis `ch` unit (`max-w-[65ch]`) pada paragraf deskripsi. |
| Drop cap (huruf pertama raksasa) | **Diadaptasi** | Idenya bagus untuk sentuhan editorial, tapi **pakai Poppins Bold yang sudah ada**, bukan font dekoratif baru. Terapkan hanya di 1 tempat (paragraf pembuka jurusan), jangan di semua paragraf — kalau di semua tempat, efek "istimewa"-nya hilang. |
| Kinetic typography / Marquee untuk daftar teknologi (REACT.JS • FLUTTER • dst) | **Ditolak** | Kita sudah menolak marquee di footer landing page dengan alasan spesifik: animasi loop tanpa henti melanggar prinsip *"1 momen wow, bukan noise berkelanjutan"* di `design.md`. Alasan yang sama berlaku persis di sini — bahkan lebih berisiko karena marquee ini duduk di tengah halaman (area yang dibaca aktif), bukan di footer (area yang biasanya cuma dilewati). |
| **Pengganti untuk kotak centang generik** | **Diadopsi (usulan pengganti)** | Ganti kotak centang dengan **daftar chip/tag** memakai gaya `DimensionLine` yang sudah didefinisikan di `updateLanding.md` (garis penunjuk ala gambar teknik) — bukan kotak rounded dengan ikon centang generik. Reveal dengan stroke-draw saat scroll masuk viewport, pola yang **sudah ada** di Why Section landing page. Nol dependensi baru. |
| Hover Media Reveal (video/gambar melayang mengikuti kursor saat hover teks kompetensi) | **Ditolak, diadaptasi jadi tap-to-expand** | Hover tidak ada di layar sentuh — mati total untuk pengguna mobile (mayoritas trafik kita, ini sudah 3× berulang jadi alasan penolakan di seluruh proyek ini). Selain itu, ini menuntut produksi video/preview per kompetensi yang belum ada pipeline-nya. **Ganti jadi**: klik/tap pada baris kompetensi memperluas panel inline berisi 1 gambar statis + deskripsi — bekerja sama baiknya di desktop maupun mobile, tanpa butuh video. |

### C. Program Unggulan (Nested Cards 2×2)

| Usulan | Verdict | Alasan |
|---|---|---|
| Interactive Accordion List (baris vertikal, melebar saat di-hover/klik) | **Diadopsi** | Bekerja baik di semua perangkat (tap untuk buka di mobile, hover opsional cuma sebagai preview di desktop), murni CSS height-transition, tidak butuh library. Cocok kalau konten tiap program cukup padat (banyak teks). |
| Sticky Card Stack (kartu menumpuk saat scroll) | **Diadopsi sebagai alternatif** — *pilih salah satu dari dua ini, jangan berdua* | Efek ini **bisa dibuat murni CSS** (`position: sticky` + `margin-top` bertingkat per kartu), **tanpa GSAP atau library animasi apa pun** — ini beda dari yang biasanya dikira orang butuh JS berat. Cocok kalau kamu mau ritme scroll yang lebih "menghibur" dan konten tiap program singkat (1 gambar + 1-2 kalimat). |
| **Rekomendasi konkret** | — | Kalau isi tiap Program Unggulan **padat teks** (deskripsi panjang, banyak poin) → pakai **Accordion**. Kalau isinya **ringkas dan visual** (1 gambar showcase + judul singkat) → pakai **Sticky Card Stack**. Jangan pasang dua-duanya di halaman yang sama — pilih satu sesuai jenis kontennya. |

### D. Transisi Section / Banner Showcase

| Usulan | Verdict | Alasan |
|---|---|---|
| Dark Mode Scroll Transition (seluruh halaman putih → hitam, karya tampil dengan efek glow/neon) | **Diadopsi, diadaptasi ruang lingkupnya** | Konsepnya kuat (jadi 1 momen wow yang sah untuk halaman ini), tapi **jangan animasikan background seluruh dokumen** — itu mahal untuk browser (repaint area sangat besar tiap frame scroll). Scope transisi warna **hanya ke section ini sendiri** (pola yang sama seperti `ScrollExpandHero` di landing page: pakai `useScroll` dengan `target` di-set ke section ini saja, transisi `background-color`, bukan mengubah tema seluruh halaman). |
| Efek glow/neon pada showcase karya | **Diadopsi dengan syarat kontras** | Boleh, tapi **awas jangan ulangi kesalahan kontras** yang baru saja kita perbaiki di P0 §1 — efek glow/blur di sekitar teks tidak boleh mengorbankan keterbacaan teks itu sendiri. Uji kontras teks-di-atas-glow dengan cara yang sama seperti bagian lain, jangan dianggap "kan cuma efek dekoratif". |

### E. CTA Kemitraan

| Usulan | Verdict | Alasan |
|---|---|---|
| Perbaikan kontras teks abu-abu di atas marun | **Wajib, non-negotiable** | Ini bukan usulan Awwwards, ini bug WCAG yang sudah diidentifikasi sejak `updateLanding.md` §2 untuk section serupa. Ganti jadi teks putih/`--color-cream` di atas marun. |
| Dynamic Interactive Background (grid bereaksi seperti gravitasi mengikuti kursor) | **Ditolak, diadaptasi jadi versi murah** | Simulasi fisik per-garis grid yang bereaksi real-time terhadap kursor butuh render loop (canvas/WebGL) yang jalan tiap frame — mahal, dan sebagian audiens CTA ini adalah pengambil keputusan lini bisnis yang mungkin buka dari HP saat rapat/di jalan. **Ganti dengan** spotlight radial-gradient yang mengikuti posisi kursor (cukup 2 CSS custom property yang di-update lewat 1 listener `pointermove`, digambar oleh GPU) — kesan "hidup" serupa, biaya mendekati nol. |
| Massive Typography untuk headline "Tertarik Merekrut Talenta?" | **Diadopsi** | Murah (cuma `font-size`), dan konsisten dengan prinsip berani di skala tipografi yang sudah kita bahas — kontras ukuran teks (sangat besar vs kecil-fungsional) memang salah satu cara termurah menciptakan kesan premium. |
| Magnetic & Expanding Button | **Diadopsi — reuse komponen yang sudah ada** | Kita sudah membangun efek magnetic pull ini untuk CTA Hero landing page (lihat `design.md`, hasil dari `pm-feedback-review.md` §2). Jangan implementasi ulang dari nol — **ekstrak jadi 1 komponen `MagneticButton` yang dipakai bersama** oleh Hero landing page dan CTA Kemitraan di halaman Jurusan. Ini juga rapi secara kode (DRY), bukan cuma soal desain. |

---

## 4. Komponen Baru/Diubah yang Perlu Dibuat

| Komponen | Status | Catatan |
|---|---|---|
| `MagneticButton` | **Ekstraksi dari kode Hero landing page** | Jadikan komponen reusable dengan prop `radius`/`strength`, dipakai di 2 tempat sekarang. |
| `CompetencyChipList` | **Baru** | Pengganti grid checkmark generik, pakai `DimensionLine` dari `updateLanding.md`. |
| `AccordionList` **atau** `StickyCardStack` | **Baru — pilih satu** | Untuk Program Unggulan, sesuai rekomendasi §3.C. |
| `ScrollColorSection` | **Baru, turunan dari `ScrollExpandHero`** | Untuk transisi dark mode terbatas 1 section (§3.D), pakai teknik `useScroll` + `clip-path`/`background-color` yang sama, bukan animasi tema global. |
| `CursorSpotlight` | **Baru, ringan** | Pengganti murah untuk "grid interaktif" di CTA Kemitraan — 1 listener `pointermove`, 2 CSS variable. |

---

## 5. Struktur Final Halaman Jurusan

```
Navbar (sama seperti landing page — kapsul melayang saat scroll)
Hero
  - Label kecil "PROGRAM KEAHLIAN VOKASI SMKN 13 BANDUNG"
  - H1 (Poppins Bold, warna solid — bukan gradient + bold sekaligus)
  - Deskripsi (max-w-65ch, kontras ink-700)
  - Sticky pill filter jurusan (bukan floating dock)
  - CTA ganda: "Pelajari Detail Program" (solid) / "Lihat Portofolio Karya" (outline)
  - Badge akreditasi & Teaching Factory (ukuran teks dinaikkan ke text-sm)
  - Slot ilustrasi kanan: SVG isometrik dulu, 3D nyata jadi keputusan
    terpisah (lihat §3.A)
Deskripsi Jurusan & Kompetensi
  - Paragraf editorial (max-w-65ch, drop cap di paragraf pembuka saja)
  - CompetencyChipList (bukan grid checkmark)
Program Unggulan
  - AccordionList ATAU StickyCardStack (pilih 1, lihat §3.C)
Transisi Showcase
  - ScrollColorSection: putih → hitam, karya dengan efek glow (kontras diuji)
CTA Kemitraan
  - Perbaikan kontras (wajib)
  - Massive typography headline
  - CursorSpotlight background
  - MagneticButton (komponen yang sama dengan Hero landing page)
Footer (sama seperti landing page)
```

---

## 6. Ringkasan Keputusan

| Status | Jumlah | Contoh |
|---|---|---|
| **P0 — wajib, non-negotiable** | 7 | Font heading, skip heading level, kontras, ukuran teks, all-caps, gradient ganda, layout pill rusak |
| **Diadopsi** | 8 | Editorial line-length, chip pengganti checkmark, accordion/stack, dark transition (di-scope ulang), fix kontras CTA, massive typography, magnetic button (reuse) |
| **Diadaptasi** | 4 | Drop cap (font existing), hover-reveal → tap-to-expand, dynamic grid → cursor spotlight, dark transition → scoped per section |
| **Ditolak** | 3 | Font serif ketiga, floating dock, marquee kinetic typography |
| **Ditunda (butuh keputusan tim)** | 1 | 3D model interaktif — perlu keputusan produksi aset sebelum dieksekusi |

---

## 7. Langkah Berikutnya

1. Kerjakan **P0 §1 dulu** — ini bisa selesai dalam hitungan jam dan
   langsung menaikkan kualitas persepsi halaman ini tanpa animasi apa pun.
2. Putuskan **Accordion vs Sticky Card Stack** untuk Program Unggulan
   berdasarkan kepadatan konten yang sebenarnya (§3.C).
3. Bawa pertanyaan 3D model (§3.A) ke rapat tim — ini keputusan produksi
   konten, bukan keputusan kode semata.
4. Setelah komponen `MagneticButton` diekstrak, update juga pemakaiannya
   di Hero landing page supaya keduanya benar-benar memakai kode yang sama
   (bukan disalin dua kali).
5. Tambahkan ringkasan halaman ini ke `design.md` di bagian koreografi,
   supaya tetap satu sumber kebenaran lintas halaman — atau kalau kamu mau
   `design.md` tetap murni untuk landing page, tegaskan itu di judul
   dokumennya, dan biarkan `updateJurusan.md` jadi rujukan mandiri untuk
   halaman ini.
