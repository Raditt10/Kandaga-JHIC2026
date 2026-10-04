# Isi Pitch Deck — Kandaga (Tim Ijin Tampil, SMKN 13 Bandung)

Disusun dari data nyata proyek pada 4 Oktober 2026. Setiap angka di dokumen ini
punya asal-usul yang bisa ditunjukkan: kueri database, keluaran build, atau
pengukuran browser. Bagian **[PERLU DIGANTI]** menandai klaim di template lama
yang **tidak akurat** dan berisiko jika ditanya juri.

---

## Slide 1 — Cover

| Kolom | Isi |
|---|---|
| `Oleh :` | **Tim Ijin Tampil** |
| `Asal Sekolah :` | **SMKN 13 Bandung** |

Anggota (sudah terisi di template, pertahankan):

- Raffaditya S.
- M. Dzakwan M.A.
- Abdurraffa M.A.
- Sakinah Q.D.
- Dean S.S.

---

## Slide 2 — Masalah & Tujuan

Isi template sudah baik, **pertahankan apa adanya.** Teks pembuka:

> Kandaga hadir sebagai etalase digital terpusat untuk memamerkan karya siswa,
> mengelola arsip dan branding sekolah, serta menghubungkan industri langsung
> dengan talenta berkualitas.

**Catatan penting:** angka `87,2%` dan `62,82%` pada slide ini **bukan dari
aplikasi kita** — itu data riset pihak ketiga. Juri hampir pasti menanyakan
sumbernya. Siapkan sitasinya (nama survei, tahun, jumlah responden, tautan), atau
ganti dengan temuan lapangan Anda sendiri. Saya **tidak bisa memverifikasi**
kedua angka itu dari dalam proyek.

---

## Slide 3 — Fitur & Teknologi

Versi teknologi di template **sudah akurat**, hasil pengecekan langsung ke
`package.json`. Hanya satu perbaikan kecil:

**[PERLU DIGANTI]** `Auth: NextAuth.js v4 + bcrypt` → **`NextAuth.js v4 + bcryptjs`**
Library yang benar-benar terpasang adalah `bcryptjs ^3.0.3`, bukan `bcrypt`.

Versi terverifikasi:

| Klaim template | Versi nyata di proyek | Status |
|---|---|---|
| Framework: Next.js 16 (App Router) | `next 16.3.6` | ✅ |
| UI: React 19 + Tailwind CSS v4 | `react 19.2.8`, `tailwindcss ^4` | ✅ |
| Animasi: Motion + Lenis + GSAP | `motion ^13.4.4`, `lenis ^1.3.26`, `gsap ^3.15.0` | ✅ |
| Auth: NextAuth.js v4 + bcrypt | `next-auth ^4.24.15` + `bcryptjs ^3.0.3` | ⚠️ perbaiki nama paket |
| Database: PostgreSQL + Prisma ORM | `prisma ^6.19.3` | ✅ |
| Language: TypeScript | `typescript ^5` | ✅ |

**Tiga fitur unggulan yang tertulis sudah benar-benar ada di kode**, dan Anda bisa
memperkuatnya dengan angka skala nyata:

> Galeri Karya Terverifikasi — alur kurasi oleh guru pembimbing dan admin, dengan
> pencatatan catatan peninjauan.
> Halaman Jurusan per Program Keahlian — RPL, TKJ, dan Analis Kimia.
> Platform Kemitraan BKK — alur terintegrasi **5 langkah**: daftar akun
> perusahaan → verifikasi koordinator BKK → akses katalog karya → kirim minat →
> BKK meneruskan ke siswa & guru.

**Angka skala yang bisa Anda tambahkan** (terhitung dari kode):

- **40 halaman** aplikasi
- **36 rute API**
- **19 model** pada skema Prisma
- **3 jurusan**: RPL, TKJ, Analis Kimia

---

## Slide 4 — Optimasi & Skalabilitas

Slide ini berisi empat klaim. **Dua di antaranya tidak akurat** dan satu
menyesatkan. Jangan dibawa apa adanya.

### 4a. Performa Edge (ISR & RSC) — **[PERLU DIGANTI]**

Klaim lama: *"Halaman publik dimuat via CDN Edge (TTFB < 100ms)"*.

Masalah: **tidak ada CDN.** Aplikasi berjalan di satu VPS (panel Webuzo). Tidak
ada jaringan edge.

Versi jujur dan tetap kuat:

> **ISR & RSC:** halaman publik dirender di server lalu di-cache dengan
> `revalidate 300` detik. Terverifikasi lewat header `x-nextjs-cache: HIT` dan
> `cache-control: public, s-maxage=300, stale-while-revalidate=600`. Waktu balas
> server terukur **6–14 ms** (ISR cache HIT, 5 pengukuran).

### 4b. Database Optimal — **[PERLU DIGANTI]**

Klaim lama: *"Full-Text Search (tsvector) dan indeks strategis mempercepat
pencarian, didukung Connection Pooling Prisma."*

Masalah: kolom `search_vector` dan indeks GIN memang **ada** di skema dan
migrasi, tetapi **tidak satu pun kueri memakainya**. Pencarian yang berjalan
sekarang memakai `contains` (ILIKE), yang tidak bisa memanfaatkan indeks GIN
tsvector. Menyebut tsvector "mempercepat pencarian" karena itu tidak benar.

Dua pilihan, pilih salah satu:

**Pilihan A — perbaiki kodenya dulu** (paling kuat, tapi butuh kerja tambahan):
ubah kueri pencarian agar memakai `to_tsquery`/`plainto_tsquery` sehingga indeks
GIN benar-benar terpakai.

**Pilihan B — perbaiki kalimatnya** (aman, jujur):

> **Database Optimal:** PostgreSQL dengan **19 model** Prisma, indeks strategis
> pada kolom yang sering dikueri, kolom `search_vector` bertipe `tsvector`
> beserta indeks GIN sudah terpasang di skema untuk pengembangan pencarian teks.

### 4c. Arsitektur Aman — **[PERLU DIGANTI]**

Klaim lama: *"pengamanan Row-Level Security (RLS) di level database."*

Masalah: **RLS tidak ada sama sekali.** Tidak ada `ENABLE ROW LEVEL SECURITY`
maupun `CREATE POLICY` di seluruh migrasi. Ini klaim yang paling berbahaya karena
mudah dibantah.

Versi jujur, dan sebenarnya tetap layak dibanggakan:

> **Arsitektur Aman:** setiap rute API dilindungi pemeriksaan peran
> (`requireRole`), sesi dikelola NextAuth, kata sandi di-hash dengan bcryptjs, dan
> kolom sensitif disaring dari respons API.

### 4d. Frontend Ringan — **[PERLU DIGANTI]**

Klaim lama: *"bundle JS < 45kb ... performa 60fps"*.

Masalah: **bundle JS bukan < 45 KB.** Hasil pengukuran nyata di browser:
**258 KB terkirim** dalam 14 berkas — sekitar 5,7× klaim. Yang **benar** dari
klaim ini: font memang di-*self-host* (lewat `next/font`, tidak ada permintaan ke
Google saat runtime), dan performanya memang halus.

Versi jujur dengan angka terukur:

> **Frontend Ringan:** font di-*self-host* lewat `next/font` (5 berkas, 59 KB),
> total halaman **1.737 KB dalam 44 permintaan**, CLS **0,0007** (nyaris nol), dan
> waktu frame rata-rata **8,5–9,5 ms** saat menggulir (sekitar 110 FPS) tanpa
> long task.

---

## Slide 5 — Uji Performa & Hasil Analisis

Slide ini masih **Lorem ipsum** di template. Berikut isian siap tempel,
seluruhnya hasil pengukuran, bukan perkiraan.

### Kolom 1 — Performa Halaman (landing page)

> **1.944 ms** Largest Contentful Paint
> **848 ms** First Contentful Paint
> **0,0007** Cumulative Layout Shift (nyaris nol — tidak ada elemen yang
> bergeser saat halaman dimuat)
> **6–14 ms** waktu balas server (ISR cache HIT)
> **0 error** di konsol

### Kolom 2 — Berat Halaman & Optimasi

> Total **1.737 KB dalam 44 permintaan**
> JS 258 KB · CSS 108 KB · gambar 588 KB · font 59 KB
> Aset gambar dikompresi dari **110,88 MB menjadi 0,73 MB** — penghematan
> **99,3%** — dengan mengubah 7 gambar PNG/JPG berukuran berlebih ke WebP pada
> dimensi yang sesuai ukuran tampil sebenarnya.

### Metodologi (sebutkan bila ditanya)

Chrome headless lewat Chrome DevTools Protocol, profil bersih tanpa ekstensi,
cache dikosongkan setiap pengukuran, `prefers-reduced-motion` dipaksa aktif
supaya animasi ikut terhitung, **median dari 3 kunjungan**. Diukur terhadap build
produksi (`npm run build` + `next start`), bukan mode dev.

### Kejujuran yang perlu Anda siapkan

LCP **1.944 ms** masuk kategori "baik" (< 2.500 ms) tetapi belum "sangat baik"
(< 1.200 ms). Kalau juri menanyakan target perbaikan, jawabannya jelas: LCP
didominasi gambar hero dan animasi masuk. Angka ini juga bisa berbeda di VPS
Anda karena latensi jaringan — **ukur ulang di server produksi** sebelum maju,
dan pakai angka dari sana.

---

## Slide 6 & 7 — Hasil Deploy Website

Empat slot tangkapan layar: **Landing Page**, **Jurusan**, **Dashboard Siswa**,
**Pengaturan Siswa**.

**Saya sarankan Anda mengambil keempatnya langsung dari situs yang sudah
di-deploy**, bukan dari `localhost`. Alasannya: slide ini berjudul "Hasil Deploy",
jadi yang ditampilkan seharusnya benar-benar situs di server — lengkap dengan
domainnya. Tampilannya identik dengan versi lokal, tetapi kredibilitasnya berbeda.

Tips pengambilan: gunakan lebar jendela **1440 px** dan mode terang, tangkap
seluruh halaman untuk Landing Page, dan potong pada bagian yang paling meyakinkan
(bilah jurusan RPL/Kimia/TKJ pada hero, kartu galeri karya, tabel karya pada
dashboard siswa).

---

## Slide 8 — Kesimpulan

Masih placeholder di template. Isian siap tempel:

> **Judul: Etalase Karya yang Menghubungkan Sekolah dan Industri**
>
> Kandaga mengubah karya siswa dari dokumen yang tercecer menjadi portofolio
> resmi yang terkurasi dan dapat ditemukan industri. Siswa mendapat ruang
> publikasi yang diakui sekolah; guru pembimbing mendapat alur kurasi yang
> tercatat; perusahaan mitra mendapat jalur resmi menuju talenta terverifikasi
> melalui BKK. Dibangun dengan Next.js 16, React 19, dan PostgreSQL, platform ini
> sudah berjalan, terukur, dan siap dikembangkan ke sekolah lain.

---

## Peringatan penting: angka basis data saat ini adalah data demo

Bagian statistik di situs sekarang menampilkan **3 jurusan, 7 karya terverifikasi,
4 siswa, 3 guru** (terverifikasi langsung dari `/api/stats`). Namun pemeriksaan
database menunjukkan **ini data seed/demo**, bukan pengguna nyata:

- 9 karya, dengan 18 media yang sebagian besar menunjuk `picsum.photos`
  (gambar placeholder acak, bukan karya siswa sungguhan)
- 4 siswa dan 3 guru — akun demo dari `prisma/seed.ts`
- 0 lowongan magang, 1 kemitraan

**Jangan sajikan angka ini sebagai bukti traksi.** Kalau juri bertanya "sudah
berapa pengguna?", jawaban yang aman: *"Ini data pilot dari lingkungan uji kami;
platformnya siap menerima data sungguhan ketika dioperasikan sekolah."* Menyebut
"4 siswa berkontribusi" sebagai capaian justru membuka pertanyaan yang tidak
nyaman.

---

## Ringkasan koreksi yang wajib dilakukan

| Slide | Klaim di template | Masalah | Tindakan |
|---|---|---|---|
| 3 | `bcrypt` | Paket sebenarnya `bcryptjs` | Ganti nama paket |
| 4a | "CDN Edge" | Tidak ada CDN; satu VPS | Ganti ke deskripsi ISR + angka TTFB nyata |
| 4b | "tsvector mempercepat pencarian" | Indeks ada tapi kueri tidak memakainya | Perbaiki kode, atau lunakkan kalimat |
| 4c | "Row-Level Security (RLS)" | **Tidak ada sama sekali** | Ganti ke `requireRole` + NextAuth + bcryptjs |
| 4d | "bundle JS < 45kb" | Terukur 258 KB | Ganti dengan angka terukur |
| 2 | "87,2%" dan "62,82%" | Sumber tidak ada di proyek | Siapkan sitasi riset |
| 5, 8 | Lorem ipsum | Belum diisi | Pakai isian di dokumen ini |
| 6, 7 | Slot screenshot | Kosong | Ambil dari situs terdeploy |

Satu hal terakhir yang perlu Anda ketahui: pada `next.config.ts` masih ada
`cpus: 1` dan `webpackBuildWorker: false`. Keduanya dipasang untuk menekan
pemakaian memori saat build di VPS 4 GB — dan build Anda **masih kena OOM killer**
(`SIGKILL`) menurut tangkapan layar sebelumnya, dengan swap hanya 512 MB. Tambahkan
swap sebelum hari presentasi supaya proses deploy tidak gagal di menit terakhir.
