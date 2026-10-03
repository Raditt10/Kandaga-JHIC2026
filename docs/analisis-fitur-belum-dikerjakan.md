# Analisis Fitur Utama yang Belum Dikerjakan — Kandaga

Tanggal: 3 Oktober 2026
Cara analisis: pembacaan kode langsung (`src/app/**`), pembandingan dengan spesifikasi
`docs/AGENTS.md`, `docs/alur/alurMitra.md`, dan pemeriksaan langsung ke database PostgreSQL.

Semua klaim di bawah disertai bukti file/baris. Yang tidak dapat saya verifikasi ditandai
*(belum diverifikasi)*.

---

## 1. Yang sudah jalan end-to-end (data dari PostgreSQL)

| Alur | Bukti |
|---|---|
| Login 5 role + guard status verifikasi mitra | `src/lib/auth-options.ts`, `src/proxy.ts` — diuji: 5/5 role berhasil login |
| Registrasi mitra → status menunggu | `/mitra/daftar` + `src/app/api/mitra/daftar/route.ts` |
| BKK verifikasi akun mitra | `/bkk/verifikasi` + `src/app/api/bkk/verifikasi/route.ts` |
| BKK manajemen mitra | `/bkk/mitra` + `src/app/api/bkk/mitra/route.ts` |
| BKK antrian kontak (mesin status 5 tahap) | `/bkk/kontak` + `src/app/api/bkk/kontak/route.ts` — diuji 7/7 skenario otorisasi |
| Perusahaan: katalog, bookmark, ajukan minat, riwayat, profil | `/company/{katalog,tersimpan,riwayat,profil}` + 4 route API |
| Siswa: unggah & kelola karya + status privat | `/student/{create-project,my-projects}`, `src/app/api/student/projects/*`, `src/app/api/upload/route.ts` |
| Galeri publik + detail (hanya karya `approved`) | `src/app/api/gallery/route.ts` (filter), `[id]/route.ts` (404 bila belum terverifikasi) |
| Asisten AI "Tanya Kandaga" | `src/app/api/chat/route.ts` — `GEMINI_API_KEY` **terpasang**, plus fallback lokal berbasis pengetahuan |
| Halaman publik: landing, jurusan, cara kerja BKK, profil siswa | `/`, `/jurusan`, `/jurusan/[slug]`, `/mitra/cara-kerja-bkk`, `/siswa/[id]` |

---

## 2. Belum dikerjakan — P0 (alur inti produk atau klaim yang tidak benar)

### P0-1. Kurasi guru tidak tersambung ke database — portal guru 100% mock

`src/app/teacher/page.tsx` memakai data hardcoded: `initialCurationQueue` (baris 38, 50, 62
semua berstatus `"pending"`) yang disimpan di `useState` (baris 100), dan tabel Riwayat Kurasi
berisi nama-nama statis seperti "Ahmad Rizky Pratama", "EcoSort — AI Computer Vision"
(baris 386–390). **Tidak ada satupun route `/api/teacher/*`** di repo ini.

**Akibat nyata:** karya yang diunggah siswa masuk dengan status `pending`, tetapi **tidak ada
satu pun jalur di UI yang bisa mengubahnya menjadi `approved`**. Karya hanya tayang di galeri
kalau di-approve lewat seed. Ini bertentangan dengan prinsip inti yang dinyatakan sendiri di
`AGENTS.md` §1: *"Karya melalui kurasi guru sebelum tayang (bukan upload bebas)"*.

### P0-2. Panel admin seluruhnya memakai data mock

| Halaman | Sumber data | Bukti |
|---|---|---|
| `/admin/dashboard` | mock | impor `usersDatabase` + `systemAuditLogs`, `projectShowcases`, `mentorsList` (baris 18–19, 195, 210) |
| `/admin/pengguna` | mock | `useState<UserAccount[]>(usersDatabase)` (baris 4, 9) |
| `/admin/audit-log` | mock | `useState(systemAuditLogs)` (baris 4, 9) |
| `/admin/moderasi` | state lokal saja | `useState<Record<string, "approved" \| "rejected">>` (baris 11) — klik tidak memanggil API apa pun |
| `/admin/bkk` | angka hardcoded | "18 Perusahaan", "24 Posisi", "142 Siswa" (baris 10–12) |

`src/lib/users.ts` adalah penyimpanan in-memory, dan `src/lib/adminData.ts` adalah daftar statis.
Admin tidak bisa mengelola pengguna, tidak punya audit log nyata, dan "moderasi" tidak mengubah
apa pun di database.

### P0-3. Notifikasi belum ada sama sekali (Fase 6 `alurMitra.md` belum dikerjakan)

Tidak ada route API maupun halaman/dropdown notifikasi. Pemeriksaan database: tabel
`notifications` berisi **0 baris** dan tidak ada kode yang menulisnya (`grep` hanya menemukan
`deleteMany` di seed dan penyebutan di teks naratif).

Sementara itu UI sudah **menjanjikan** notifikasi:

| Lokasi | Klaim |
|---|---|
| `src/app/mitra/daftar/page.tsx:381` | "Anda akan menerima notifikasi melalui email maksimal 1×24 jam kerja" |
| `src/app/student/page.tsx:821` | "Guru pembimbing akan menerima notifikasi untuk menilai karya Anda" |
| `src/app/api/bkk/verifikasi/route.ts` | mengklaim notifikasi dikirim otomatis |

Untuk prototype kompetisi, klaim di UI yang tidak terjadi adalah risiko presentasi.

### P0-4. Sisi siswa & guru tidak pernah melihat permintaan kontak yang "diteruskan"

`contactRequests` hanya dibaca oleh dua tempat: `src/app/api/bkk/kontak/route.ts` (sisi BKK) dan
`src/app/api/company/minat/route.ts` (sisi perusahaan). **Tidak ada halaman atau API untuk siswa
maupun guru.**

`AGENTS.md` §5 mewajibkan permintaan yang diteruskan sampai "ke siswa **dan** guru pembimbing
bersamaan (transparansi)". Saat ini status di database berubah menjadi `diteruskan`, tetapi
pihak yang dituju tidak punya cara melihatnya — alur BKK terputus tepat di langkah terakhir,
yaitu langkah yang paling penting bagi produk ini.

### P0-5. Karya dihapus permanen — melanggar aturan proyek sendiri

`src/app/api/student/projects/[id]/route.ts` memakai `prisma.projects.delete()` (baris ~271),
padahal `AGENTS.md` §6 menyatakan tegas: *"soft-delete via `deleted_at` untuk arsip alumni —
**jangan hard-delete karya**"*.

Catatan: kolom `deleted_at` sudah ada di skema dan sudah dipakai filter di API galeri, jadi
infrastrukturnya siap — tinggal perilaku hapusnya diubah.

---

## 3. Belum dikerjakan — P1 (fitur yang sudah dijanjikan spesifikasi / UI, dampak menengah)

### P1-1. Sistem badge 4 tier tidak ada

`AGENTS.md` §5 menetapkan 4 tier dengan otoritas berbeda: Guru memberi 3 tier pertama
(sebatas jurusannya), dan **hanya** Koordinator BKK yang boleh memberi "Diminati Industri".
Faktanya tidak ada satu pun kode yang **menulis** badge — `ProjectsBadge` hanya muncul sebagai
`deleteMany()` di `prisma/seed.ts:16`. `badgeTier` (gold/silver/bronze) hanya ada di data statis
`src/data/galleryData.ts` dan `src/components/gallery/ProjectCard.tsx`, sehingga karya dari
database tidak akan pernah punya badge.

### P1-2. Pencarian dan tombol Pesan/Notifikasi di dashboard hanya dekoratif

Di `src/components/dashboard/DashboardShell.tsx`:
- `searchQuery` hanya dideklarasikan (baris 99) dan dipakai sebagai `value` (baris 306) —
  **tidak ada logika penyaringan sama sekali**;
- tombol Pesan (baris 316) dan Notifikasi (baris 324) hanya punya `aria-label`, tanpa handler.

Ketiganya muncul di kelima dashboard (Admin, Siswa, Guru, Perusahaan, BKK), jadi terlihat
paling menonjol saat presentasi.

### P1-3. Dua widget dashboard BKK belum diisi padahal API-nya sudah ada

`src/app/bkk/page.tsx` baris 81–121: widget "Antrian Kontak" dan "Mitra Terdaftar" menampilkan
"—" hardcoded, sementara `/api/bkk/kontak?count=true` dan `/api/bkk/mitra` sudah tersedia dan
sudah dipakai halaman lain. Ini perbaikan murah dengan hasil visual langsung.

### P1-4. Upload dokumen legalitas mitra belum ada

`src/app/api/mitra/daftar/route.ts:29` — dokumen legalitas masih berupa string URL yang
diketik sendiri, dengan komentar `// mock URL — diisi dari upload atau placeholder`.
`alurMitra.md` §6 poin 2 memang mengizinkan penundaan sampai setelah kompetisi, jadi ini
catatan, bukan pelanggaran.

### P1-5. Penegakan aturan di level database tidak ada

Pemeriksaan langsung ke database: **0 trigger, 0 view**.

`AGENTS.md` §6 menyatakan seluruh aturan role ditegakkan lewat RLS + trigger, dan meminta
halaman Next.js memakai view siap pakai (`v_katalog_publik`, `v_antrian_review`,
`v_antrian_kontak`, `v_kontak_diteruskan`, `v_leaderboard`, `v_profil_siswa_publik`). Semuanya
tidak ada; logika hidup di API route.

Ini bukan cacat yang terlihat juri, tetapi sudah terbukti berdampak: celah otorisasi yang saya
temukan dan perbaiki (IDOR pada `[id]`, `/api/upload` tanpa autentikasi) justru muncul karena
tidak ada lapisan penjaga di database.

---

## 4. Butuh keputusan pemilik produk (bukan pekerjaan teknis)

`AGENTS.md` §8 sudah menandai empat hal ini sebagai belum final — sebaiknya diputuskan sebelum
dikerjakan:

1. Badge "Diminati Industri": perusahaan mengajukan lalu BKK/Guru mengonfirmasi, atau perusahaan
   memberi langsung?
2. Accordion vs Sticky Card Stack untuk Program Unggulan di halaman Jurusan.
3. Aset 3D di Hero halaman Jurusan (ditunda, menunggu keputusan produksi aset).
4. Setelah permintaan kontak "diteruskan", koordinasi lanjutannya difasilitasi di dalam platform
   atau di luar sistem?

Tambahan temuan: **`/student/post-project` mengembalikan HTTP 307** *(belum diverifikasi ke mana
arahnya)*. Ada dua halaman untuk mengunggah karya (`create-project` dan `post-project`) yang
berpotensi membingungkan.

---

## 5. Peringatan: dokumen spesifikasi sudah usang

`docs/AGENTS.md` §7 masih menyatakan:

> "Backend/API routes, autentikasi, koneksi database ke Next.js — skema SQL sudah ada, tapi belum
> ada kode integrasi (ORM/query layer) di repo ini"

Padahal saat ini sudah ada autentikasi lengkap, 16 route API, dan integrasi Prisma. §7 juga masih
menganggap halaman Jurusan dan `IndustrySection`/`JurusanMenu` belum dibuat (sekarang sudah ada),
dan §2 masih menyebut `src/components/Navbar.tsx` serta `database/01_schema.sql` sebagai acuan,
padahal `Navbar.tsx` sudah dihapus dan database nyata dibangun lewat Prisma.

Ini bukan sekadar kerapian: instruksi usang membuat pembaca berikutnya (manusia atau agent)
salah menilai apa yang sudah ada — persis jenis kesalahan yang §7 ingin dicegah.

---

## 6. Rekomendasi urutan pengerjaan

Diurutkan berdasarkan "nilai untuk juri per jam kerja":

| # | Pekerjaan | Kenapa didahulukan | Perkiraan |
|---|---|---|---|
| 1 | Kurasi guru tersambung DB (`/api/teacher/*` + halaman guru baca data nyata) | membuat klaim "dikurasi guru" jadi benar; melengkapi alur inti siswa → guru → galeri | sedang |
| 2 | Sisi siswa & guru melihat permintaan kontak yang diteruskan | menutup alur BKK di langkah terakhir yang paling penting | sedang |
| 3 | Isi 2 widget `/bkk` + sambungkan pencarian dashboard | perubahan kecil, terlihat langsung di 5 dashboard | kecil |
| 4 | Notifikasi (Fase 6 `alurMitra.md`) atau ubah klaim di UI | menghilangkan janji UI yang tidak terjadi | kecil–sedang |
| 5 | Admin pakai data nyata (`/admin/pengguna`, audit log, moderasi) | panel admin jadi bisa didemokan, bukan pajangan | sedang–besar |
| 6 | Soft-delete karya sesuai `AGENTS.md` §6 | kepatuhan aturan, mencegah kehilangan data | kecil |
| 7 | Sistem badge 4 tier | fitur "wow" yang paling jelas terlihat di kartu galeri | sedang |

Lamanya tidak saya cantumkan dalam jam karena bergantung pada siapa yang mengerjakan; kolom
terakhir hanya perbandingan relatif.
