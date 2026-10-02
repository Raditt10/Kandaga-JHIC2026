# AGENTS.md — Konteks Proyek Kandaga untuk AI Agent

> Baca file ini SEBELUM mengerjakan tugas apa pun di repo ini. Ini bukan
> dokumentasi untuk manusia yang baru gabung tim — ini briefing untuk agent
> yang akan langsung menulis/mengubah kode, supaya tidak mengulang
> keputusan yang sudah diambil atau melanggar aturan yang sudah ditetapkan.
>
> Kalau tool kamu memakai nama file konteks berbeda (`CLAUDE.md`,
> `.cursorrules`, dll), salin/symlink isi file ini ke sana — jangan tulis
> ulang dari nol.

---

## 1. Apa Proyek Ini

**Nama produk:** Kandaga (nama awal saat konsep: "Major Gallery")
**Apa itu:** Platform galeri digital untuk mempublikasikan karya siswa
SMK Negeri 13 Bandung (3 jurusan: Analis Kimia, TKJ, RPL) secara
terverifikasi, dan menghubungkannya ke industri (DUDI) lewat mekanisme
BKK (Bursa Kerja Khusus) sekolah.
**Konteks:** Dibuat untuk kompetisi inovasi siswa **JHIC**. Scope saat ini
adalah **prototipe untuk presentasi/pitch**, bukan produk produksi penuh —
keputusan desain memprioritaskan kejelasan konsep ke juri di atas
kelengkapan fitur 100%.
**Dua proyek terpisah yang berbagi identitas:** (1) platform Kandaga itu
sendiri, (2) website sekolah SMKN 13 Bandung secara umum. Repo ini fokus
ke **Kandaga**.

**Kenapa Kandaga berbeda dari Behance/Instagram/LinkedIn (jangan hilangkan
ini saat membuat fitur baru):**
- Karya melalui kurasi guru sebelum tayang (bukan upload bebas)
- Terintegrasi struktur sekolah (jurusan, guru pembimbing, tahun ajaran)
- Terintegrasi BKK — bukan galeri pajangan, tapi alat *link and match*
  sesuai kebijakan SMK Indonesia

---

## 2. Stack & Struktur Repo

```
src/
  app/
    layout.tsx     # next/font setup (Poppins + Inter), metadata
    page.tsx       # landing page — merangkai komponen dari src/components
    globals.css    # Tailwind v4, CSS-first @theme (TIDAK ADA tailwind.config.js)
  components/
    Navbar.tsx
    Hero.tsx
    GallerySection.tsx
    StatsSection.tsx
    WhySection.tsx
database/
  01_schema.sql     # skema PostgreSQL lengkap (lihat §6)
design.md           # spesifikasi motion/animasi — SUMBER KEBENARAN TUNGGAL untuk animasi
design-rules.md     # aturan struktural wajib (tipografi, heading, nested card, dll)
updateLanding.md    # spesifikasi section "Untuk Industri & Mitra" di landing page
updateJurusan.md    # review + spesifikasi halaman Jurusan
pm-feedback-review.md  # keputusan terima/tolak usulan gaya "Awwwards"
reactbits-setup.md  # panduan pasang komponen ReactBits + 3 komponen custom
AGENTS.md           # file ini
```

**Penting — jangan berasumsi lebih dari yang benar-benar ada:**
Beberapa dokumen `.md` berisi **spesifikasi/kode contoh untuk fitur yang
BELUM diimplementasi sebagai file nyata**. Cek daftar di §7 sebelum
mengasumsikan sebuah komponen sudah ada di `src/components/`.

**Tailwind v4:** konfigurasi lewat `@theme` di `globals.css`, bukan
`tailwind.config.js`. Semua token warna (`--color-primary`, dst.) otomatis
jadi utility class (`bg-primary`, `text-primary`, dst.) — jangan tambah
`tailwind.config.js` kecuali diminta eksplisit.

---

## 3. Design System (Non-negotiable)

### Warna
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-primary` | `#9E1A3D` (marun) | Brand utama, navbar, tombol utama |
| `--color-primary-dark` | `#7A1430` | Hover/pressed |
| `--color-primary-light` | `#F7E3E9` | Background chip ringan |
| `--color-accent` | `#F0C419` (emas) | **HANYA** untuk badge/prestasi — jangan untuk tombol umum |
| `--color-ink` / `-700/-600/-300/-150/-100` | charcoal scale (`#26272B` dasar) | Teks, struktur |
| `--color-cream` | `#FFF8E7` | Background section alternatif |
| `--color-success/-pending/-error/-info` | semantic, terpisah dari brand | Status sistem (approval, dll) |

### Tipografi
- Heading (`h1`–`h4`): **Poppins** (`font-heading`)
- Body: **Inter** (`font-body`)
- **Jangan pernah** tambah font ketiga tanpa alasan kuat — sudah ditolak
  eksplisit sekali (lihat `updateJurusan.md` — usulan serif italic ditolak
  karena menambah bobot & tidak cocok identitas vokasi/teknik).

### Aturan struktural wajib — baca `design-rules.md` secara penuh sebelum
membuat section baru. Ringkasan poin yang paling sering dilanggar:
- Heading **tidak boleh loncat level** (h2 → h4 tanpa h3 = bug)
- Teks fungsional/label minimum **12px**, tidak pernah di bawah 11px
- Paragraf dibatasi `max-w-[65ch]`, jangan biarkan meregang penuh container
- All-caps **hanya** untuk label ≤5 kata, tidak pernah untuk kalimat/konten dinamis
- **Maksimal 1 pola "grid kartu ikon+judul+deskripsi" per halaman** — kalau
  butuh section kedua yang menampilkan beberapa item, pakai pola berbeda
  (accordion, sticky stack, chip list, tabel) — lihat §6 `design-rules.md`
- Setelah 2+ section selesai di halaman yang sama, **selalu scroll baca
  seluruh halaman sekali jalan** sebelum dianggap selesai — jangan hanya
  cek section yang baru dikerjakan secara terisolasi

---

## 4. Prinsip Motion/Animasi

Baca `design.md` sebelum menambah animasi apa pun. Intisari:
- Filosofi: "membuka kandaga" — reveal bermakna, bukan dekorasi
- **Maksimal 1 momen "wow" dramatis per halaman** — jangan tumpuk banyak
  efek dramatis di satu halaman
- Stack animasi: **Lenis** (smooth scroll) + **Motion** (dulu Framer
  Motion) untuk reveal. **GSAP hanya untuk 1 komponen di seluruh situs**
  (Flowing Menu di daftar Jurusan — budget ini sudah dialokasikan, jangan
  tambah GSAP lain tanpa evaluasi ulang)
- Budget performa: total JS animasi tambahan < 45kb gzip
- **Wajib** hormati `prefers-reduced-motion` di setiap animasi baru
- Ditolak secara eksplisit (jangan diusulkan ulang tanpa alasan baru):
  custom cursor, video background sinematik, objek 3D mengikuti kursor,
  horizontal scroll layout, hover-video-preview, marquee/teks berjalan,
  noise/grain overlay, page transition sapuan warna penuh layar —
  alasannya ada di `pm-feedback-review.md` dan `updateJurusan.md`

---

## 5. Sistem Peran (Role) & Mekanisme BKK

6 role: **Pengunjung Publik, Siswa, Guru/Kurator Jurusan, Admin Sekolah,
Koordinator BKK, Perusahaan/DUDI**. Pembagian sengaja dipisah:
teknis-sistem (Admin) vs kualitas-konten (Guru) vs relasi-eksternal (BKK).

**Aturan paling krusial yang TIDAK BOLEH dilanggar di fitur apa pun:**
perusahaan **tidak pernah** kontak siswa secara langsung. Alur wajib:
Perusahaan ajukan minat → antrian Koordinator BKK → BKK tinjau kelayakan →
diteruskan ke siswa **dan** guru pembimbing bersamaan (transparansi), atau
ditolak/diminta klarifikasi. Ini bukan soal UX semata — siswa SMK mayoritas
di bawah umur, jadi kontak eksternal wajib disaring manusia dulu.

**Badge, 4 tier:** Karya Terpilih → Karya Unggulan → Karya Juara Lomba →
Diminati Industri. Guru memberi 3 tier pertama (scope jurusannya sendiri),
**hanya** Koordinator BKK yang boleh memberi tier "Diminati Industri".

---

## 6. Database (lihat `database/01_schema.sql`)

PostgreSQL. Pola kunci yang HARUS dipahami sebelum mengubah skema atau
menulis query:

- **Konteks user via `app_uid()`**: aplikasi set `app.user_id` di awal
  setiap transaksi (`SELECT set_config('app.user_id', '<uuid>', true)`).
  `app_uid() IS NULL` = pengunjung/skrip sistem.
- **Semua aturan role ditegakkan di database** (RLS + trigger), bukan
  cuma di kode aplikasi — kalau bug di server, data tetap aman. Jangan
  "bypass" aturan ini dari sisi aplikasi untuk mempermudah development;
  perbaiki lewat `app.user_id` yang benar.
- Role DB aplikasi: `kandaga_app` (bukan superuser). `password_hash` di
  tabel `users` **tidak bisa** di-SELECT langsung — pakai fungsi
  `login_lookup(email)`.
- Tabel inti: `users`→`siswa`/`guru`/`perusahaan` (1-to-1 profil per role),
  `karya` (status: pending/approved/rejected, soft-delete via
  `deleted_at` untuk arsip alumni — **jangan hard-delete karya**),
  `karya_badge`, `permintaan_kontak` (mesin status mengikuti alur BKK di
  §5), `kerja_sama`, `audit_log`.
- View siap pakai untuk halaman Next.js: `v_katalog_publik`,
  `v_profil_siswa_publik`, `v_leaderboard`, `v_antrian_review` (guru),
  `v_antrian_kontak` (BKK), `v_kontak_diteruskan` (siswa/guru). **Pakai
  view ini**, jangan query tabel mentah dari API route kalau viewnya
  sudah menyediakan data yang dibutuhkan — view ini sudah menyaring kolom
  sensitif (email, NIS, password_hash tidak ikut terekspos).

---

## 7. Status Implementasi Saat Ini (Jangan Asumsikan Lebih)

**Sudah jadi kode nyata** (`src/components/`): `Navbar`, `Hero`,
`GallerySection`, `StatsSection`, `WhySection`. Ini landing page utama,
sudah melalui 1 putaran review (`pm-feedback-review.md`) dan 1 update
(Login jadi outline button).

**Baru spesifikasi/kode contoh di markdown, BELUM jadi file component
sungguhan** — kalau diminta kerjakan ini, buat file barunya, jangan cari
file yang tidak ada:
- `IndustrySection` / section "Untuk Industri & Mitra" (spek lengkap di `updateLanding.md`)
- `ScrollExpandHero`, `JellyRadio`, `JurusanMenu`/`FlowingMenu` (kode contoh di `reactbits-setup.md`)
- `MagneticButton` (saat ini masih inline di dalam `Hero.tsx` — §3.E
  `updateJurusan.md` meminta ini diekstrak jadi komponen reusable, **belum
  dikerjakan**)
- `CompetencyChipList`, `AccordionList`/`StickyCardStack`,
  `ScrollColorSection`, `CursorSpotlight` (semua di `updateJurusan.md` §4)
- Seluruh **halaman Jurusan** (Hero "Tiga Pilar Keahlian", Detail Jurusan,
  Program Unggulan, section "Solusi Utuh", CTA Kemitraan) — sudah ada
  beberapa putaran review desain (`updateJurusan.md`, `design-rules.md`)
  tapi berdasarkan screenshot terakhir, implementasinya **masih
  mengulang pelanggaran `design-rules.md`** (nested card ganda, heading
  skip level, teks di bawah 12px, line-length kepanjangan). Kalau
  ditugaskan mengerjakan/memperbaiki halaman ini, **checklist
  `design-rules.md` §8 wajib dijalankan sebelum dianggap selesai.**
- Backend/API routes, autentikasi, koneksi database ke Next.js — skema
  SQL sudah ada, tapi belum ada kode integrasi (ORM/query layer) di repo ini

---

## 8. Keputusan Terbuka (Belum Final — Jangan Diputuskan Sepihak oleh Agent)

Kalau tugas menyentuh salah satu area ini, **tanya dulu ke pengguna**,
jangan asumsikan satu pilihan sendiri:

1. Badge "Diminati Industri": apakah perusahaan ajukan dulu lalu
   dikonfirmasi BKK/Guru, atau perusahaan beri langsung? (lihat README
   proyek lama, belum ada keputusan final tertulis di dokumen terbaru)
2. Accordion vs Sticky Card Stack untuk Program Unggulan di halaman
   Jurusan — tergantung kepadatan konten aktual (`updateJurusan.md` §3.C)
3. Aset 3D di Hero halaman Jurusan — sengaja ditunda, butuh keputusan tim
   soal produksi aset (siapa model 3D-nya, format, budget performa)
4. Koordinasi lanjutan setelah permintaan kontak "diteruskan" — difasilitasi
   dalam platform atau di luar sistem manual?

---

## 9. Cara Kerja yang Diharapkan dari Agent

1. **Baca dokumen relevan dulu** sebelum menulis kode — jangan re-derive
   keputusan desain/warna/komponen dari nol kalau sudah ada spesnya.
2. **Jalankan checklist `design-rules.md` §8** pada setiap halaman/section
   baru sebelum melaporkan tugas selesai.
3. **Jangan tambah dependency baru** (library animasi, UI kit, dll) tanpa
   mengecek budget performa di `design.md` §5 — proyek ini sengaja dibuat
   ringan untuk perangkat kelas menengah-bawah (audiens siswa/sekolah).
4. **Konsisten dengan komponen yang sudah ada** — kalau pola yang
   dibutuhkan sudah ada (mis. sticky filter, stroke-draw icon reveal,
   shared layout animation untuk pill aktif), pakai ulang polanya, jangan
   reimplementasi dengan pendekatan berbeda di tempat lain.
5. Kalau menemukan konflik antara dokumen (misalnya spesifikasi lama vs
   baru), **laporkan konfliknya**, jangan diam-diam pilih salah satu.
