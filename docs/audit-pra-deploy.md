# Audit Pra-Deploy — Kandaga JHIC 2026

Tanggal audit: 4 Oktober 2026 · Cabang: `main` (`1b61860`) · Metode: pembacaan kode, build, dan pengecekan langsung ke environment.

**Kesimpulan singkat:** aplikasinya **bisa di-build dan layak deploy**, tetapi **jangan deploy dulu** sebelum tiga hal ini dibereskan — satu di antaranya akan langsung mematikan fitur saat production. Fitur inti (Siswa, Guru, BKK, Perusahaan) sudah benar-benar memakai database; modul **Admin justru yang paling belum jadi**.

---

## 0. Tiga Hal yang Menghalangi Deploy

| # | Masalah | Dampak | Tindakan |
|---|---|---|---|
| 1 | **Migrasi database ketinggalan 1 kolom** — `projects.score` ada di `schema.prisma:148` tapi **tidak pernah dibuat oleh migrasi mana pun** (0 kemunculan di `prisma/migrations/**`). Tabel histori `_prisma_migrations` juga **tidak ada** | 🔴 **Produksi akan error.** Database dibangun lewat `prisma db push` (bukan migrasi), jadi kolomnya ada di laptop Anda tapi **tidak akan ada** di server. Kurasi nilai oleh Guru (`lib/teacher-scope.ts:52,80`) akan gagal dengan `P2022 column does not exist` | Tambahkan migrasi untuk kolom `score`, lalu **uji `prisma migrate deploy` ke database kosong** dan bandingkan dengan schema |
| 2 | **Aset publik 184,80 MB** — 7 berkas foto saja menghabiskan ~183 MB | 🔴 Bandwidth, waktu build, dan limit penyedia hosting. Foto 41 MB diunduh siswa lewat kuota seluler | Konversi 7 foto ini ke WebP (hemat 60–90%). Lihat §1.2 |
| 3 | **Lint gagal** — `npm run lint` keluar dengan kode 1: **149 masalah (55 error, 94 warning)** | 🟠 Pipeline CI/CD akan merah kalau lint dijalankan sebelum build | Perbaiki error `react-hooks` (lihat §4.4); sisanya bisa di-*warn* |

Ketiganya bisa diselesaikan dalam hitungan jam, bukan hari.

---

## 1. Kesiapan Deploy

### 1.1 Database

| Item | Kondisi |
|---|---|
| Provider | PostgreSQL (database `Kandaga`, `localhost:5432`) |
| Model / tabel | 18 model → 18 tabel, **cakupan migrasi sudah lengkap** |
| Folder migrasi | 2 (`20261002142219_reinit_prisma`, `20261002175816_update_schema`) |
| **Riwayat migrasi di DB** | ❌ **`_prisma_migrations` tidak ada** → database dibangun via `db push` |
| **Migrasi vs schema** | ❌ **Tidak cocok**: `projects.score` tidak dibuat migrasi |
| Seed | `prisma/seed.ts`, `prisma/seed-demo.ts` |
| Konfigurasi | `prisma.config.ts` ada; `package.json#prisma` memicu peringatan deprecation Prisma 7 |

**Arti praktisnya:** skema database lokal Anda dan skema hasil migrasi **berbeda**. Selama masih di laptop, perbedaan ini tidak terasa karena `db push` menyamakan kolom. Begitu pindah ke server bersih dengan `prisma migrate deploy`, kolom `score` tidak akan terbentuk.

**Cara membuktikan sendiri** (aman, tidak menyentuh database Anda):

```powershell
# 1. Tunjuk DATABASE_URL ke database KOSONG sementara, lalu:
npx prisma migrate deploy
# 2. Bandingkan hasilnya dengan schema — kalau ada keluaran, berarti ada drift:
npx prisma migrate diff --from-url $env:DATABASE_URL --to-schema-datamodel prisma/schema.prisma --script
```

Alternatif yang lebih aman untuk data yang sudah ada: jadikan migrasi yang ada sebagai *baseline* lalu tambahkan migrasi baru untuk `score`:

```powershell
npx prisma migrate resolve --applied 20261002142219_reinit_prisma
npx prisma migrate resolve --applied 20261002175816_update_schema
# lalu buat migrasi untuk kolom yang kurang:
npx prisma migrate dev --name tambah_score_projects
```

### 1.2 Aset publik — 184,80 MB

| Berkas | Ukuran | Ditampilkan sebesar |
|---|---|---|
| `images/MODELKA.png` | **41,87 MB** | ±384×512 px |
| `images/hero/siswa-rpl.png` | **40,24 MB** | ±384×512 px |
| `images/hero/siswa-kimia.png` | **36,97 MB** | ±384×512 px |
| `images/MODELRPL.png` | 20,82 MB | ±384×512 px |
| `images/smkn13.jpg` | 14,45 MB | layar penuh |
| `images/hero/siswa-tkj.png` | 14,33 MB | ±384×512 px |
| `images/MODELTKJ.png` | 14,33 MB | ±384×512 px |
| **7 berkas** | **≈183 MB** | **dari total 184,80 MB** |

Menampilkan gambar 42 MB pada ukuran 384 px adalah pemborosan terbesar di proyek ini — jauh lebih besar dampaknya daripada seluruh temuan optimisasi kode di §4. Mengonversi ke WebP pada ukuran tampil yang wajar bisa memangkasnya menjadi **di bawah 2 MB total**.

Catatan: `components/landing/TrustBar.tsx:31` memakai `unoptimized`, sehingga 8 logo mitra dilayani ukuran asli tanpa optimisasi Next.

### 1.3 Environment & Konfigurasi

**File `.env` aman** — ada, dan **tidak terlacak git** (`.env` tidak ada di repo). Tidak ada rahasia yang bocor ke commit.

Namun **6 dari 12 variabel tidak dipakai kode mana pun**:

| Variabel | Status |
|---|---|
| `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | ✅ dipakai (Prisma / NextAuth) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | ✅ dipakai (`lib/auth-options.ts:87`) |
| `GEMINI_API_KEY` | ✅ dipakai (`api/chat/route.ts:76`) |
| `GITHUB_ID`, `GITHUB_SECRET` | ⚠️ **tidak dipakai** — `GitHubProvider` tidak pernah diimpor |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | ⚠️ **tidak dipakai** |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | ⚠️ **tidak dipakai** |

Login OAuth yang benar-benar aktif hanya **Google**. Tiga provider lain hanya konfigurasi mati — hapus dari `.env` produksi atau implementasikan, jangan biarkan menggantung.

**Variabel yang WAJIB ada di server produksi:**

```
DATABASE_URL      # PostgreSQL produksi
NEXTAUTH_URL      # URL publik, mis. https://kandaga.sekolah.sch.id
NEXTAUTH_SECRET   # acak & berbeda dari dev
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GEMINI_API_KEY    # opsional — tanpa ini chat AI jatuh ke basis pengetahuan lokal
REDIS_URL         # OPSIONAL — tanpa Redis otomatis pakai cache memori
```

**Redis tidak wajib.** Lapisan cache baru sudah dirancang dengan *fallback* ke memori; sudah dibuktikan 4/4 tes lolos tanpa server Redis.

### 1.4 Risiko Dua Lockfile

`package-lock.json` (314 KB, npm) **dan** `pnpm-lock.yaml` (174 KB) sama-sama ada. Proyek ini di-build dengan **npm**. Dua lockfile membuat penyedia hosting bisa memilih package manager yang berbeda dan menghasilkan pohon dependensi yang tidak terduga. **Hapus `pnpm-lock.yaml`** (atau tentukan satu package manager lewat field `packageManager` di `package.json`).

### 1.5 Yang Sudah Beres

- ✅ `npm run build` — sukses, 57 halaman
- ✅ `npx tsc --noEmit` — 0 error
- ✅ Proteksi rute berjalan (terbukti: `/student`, `/teacher`, `/bkk`, `/company` membalas **307 → `/auth/login`**). Ditangani `src/proxy.ts` — Next 16 memang memakai nama `proxy` untuk middleware (`validateMiddlewareProxyExports` ada di dist Next)
- ✅ `.env` tidak terlacak git
- ✅ Route publik memang publik, route `/api/*` dijaga per-route

---

## 2. Struktur Proyek

**Skala:** 38 halaman · **22 API route** · 18 model Prisma · 74 berkas ber-`"use client"`

Peta per peran (`src/app`):

```
Publik      /  /gallery  /gallery/[id]  /jurusan  /jurusan/[slug]  /siswa/[id]
            /mitra/daftar  /mitra/menunggu  /mitra/ditolak  /mitra/cara-kerja-bkk
Auth        /auth/login  /auth/register
Admin (9)   /admin/dashboard  pengguna  moderasi  moderasi/[id]  bkk
            blud  trend-karya  pendaftaran-mitra  pengaturan
Siswa (5)   /student  create-project  my-projects  my-projects/[id]  post-project
Guru (1)    /teacher
BKK (5)     /bkk  kontak  mitra  verifikasi  pengaturan
Perusahaan  /company  katalog  profil  riwayat  tersimpan  pengaturan
```

**Titik yang perlu dirapikan:**

- `/student/post-project` hanya `redirect()` dan **tidak ada satu pun tautan internal yang menunjuk ke sana** → rute yatim, boleh dihapus
- `src/proxy.ts:87` masih memuat entri `publicRoutes` untuk `/galeri-karya` yang **sudah dihapus** → entri mati
- **6 komponen yatim** (tidak diimpor siapa pun): `chat/ChatWidget.tsx`, `landing/HeroLegacy.tsx`, `ui/CursorSpotlight.tsx`, `ui/Spinner.tsx`, `ui/CardSkeleton.tsx`, `ui/DetailSkeleton.tsx`
- 3 helper mati di `src/lib/data.ts`: `getJurusan`, `getProject`, `getProjectsByJurusan`
- `components/landing/GallerySection.tsx:152` — state `activeFilter` di-set tombol filter tapi **tidak pernah dipakai memfilter**; pil filternya kosmetik

**Duplikasi nyata:**

| Hal | Lokasi A | Lokasi B | Catatan |
|---|---|---|---|
| "Karya Saya" | Tab `karya-saya` di `student/page.tsx:234-239` | Halaman penuh `student/my-projects/page.tsx` | **Tab A punya fungsi palsu**: modal unggah hanya `setProjects([...])` tanpa POST (`student/page.tsx:184-214`), dan tombol "Edit Draf" **tanpa `onClick`** (`:618-623`). Pengguna mengira karyanya tersimpan padahal tidak. |
| Alur buat karya | Modal di `student/page.tsx:747-875` | `student/create-project/page.tsx` (form asli, POST di `:247`) | Hapus modal, arahkan ke halaman asli |
| Galeri | `components/landing/GallerySection.tsx` (data dummy) | `app/gallery/page.tsx` (DB) | Dua permukaan, sumber data berbeda |

---

## 3. Kelengkapan Fitur — Mana yang Sudah Jalan

**Ringkasan: 22 halaman database · 10 mock · 3 redirect · 3 statis (memang begitu).**

### ✅ Sudah benar-benar memakai database (22)

`auth/login` · `auth/register` · `gallery` · `gallery/[id]` · `mitra/daftar` · `teacher` · `student/create-project` · `student/my-projects` · `student/my-projects/[id]` · `bkk` · `bkk/kontak` · `bkk/mitra` · `bkk/verifikasi` · `bkk/pengaturan` · `company` · `company/katalog` · `company/profil` · `company/riwayat` · `company/tersimpan` · `company/pengaturan` · `admin/bkk` · `admin/pendaftaran-mitra`

Semuanya lewat API route dengan Prisma + penjaga peran (`lib/api-auth.ts`) + sesi NextAuth.

### 🔴 Modul Admin masih "kulit" — 6 dari 9 halaman

Paradoksnya: sisi Siswa, Guru, BKK, dan Perusahaan sudah penuh database, tetapi **panel Admin yang paling belum jadi**.

| Halaman | Masalah | Bukti |
|---|---|---|
| `admin/dashboard` | Semua angka metrik hardcoded — "128", "14", "+38 Karya", "42 Industri"; daftar karya & mitra dari array mock. **Tidak ada satu pun panggilan API** | `admin/dashboard/page.tsx:18,53,75,99,121`; `lib/adminData.ts:29,64` |
| `admin/moderasi/[id]` | Tombol **Verifikasi/Tolak hanya `setState` lokal** — tidak menyentuh database. Status karya tidak berubah di mana pun | `moderasi/[id]/page.tsx:63-79` |
| `admin/pengguna` | Edit/hapus pengguna hanya mengubah array **in-memory** (`globalThis`) — **hilang saat reload** | `lib/users.ts:50-59`; `admin/pengguna/page.tsx:140-143,168-171` |
| `admin/trend-karya` | Seluruh grafik & KPI angka fiktif (142, 28, 1.240, 48%) | `trend-karya/page.tsx:23-60,92,103,114,127` |
| `admin/blud` | Data kontrak & jasa hardcoded; 3 tombol hanya `alert()`; **tidak ada API BLUD sama sekali** | `blud/page.tsx:38-110,139,219,325` |
| `admin/pengaturan` | Tombol "Simpan" hanya menampilkan badge "Tersimpan" — tidak menyimpan apa pun | `admin/pengaturan/page.tsx:17-21` |

**Ini risiko operasional, bukan sekadar kosmetik:** moderator bisa menekan "Verifikasi" pada karya dan melihat notifikasi sukses, padahal karya itu tetap `pending` selamanya. Keputusan moderasi diambil berdasarkan karya fiktif dari `lib/adminData.ts`.

### 🟠 Setengah jalan

| Halaman | Bagian yang jalan | Bagian yang palsu |
|---|---|---|
| `student/page.tsx` | Tab karya (DB) | Peluang magang mock (`:108-139`); "Ajukan Minat via BKK" hanya `alert()` (`:667`); modal unggah tidak tersimpan (`:184-214`) |
| `gallery` & `gallery/[id]` | DB | **Fallback ke data mock** kalau tabel kosong/error (`api/gallery/route.ts:82-88`) → publik bisa melihat "karya" yang tidak ada di database |
| `siswa/[id]` | — | Profil & portofolio 100% dari `STUDENT_PROFILES` hardcoded (`data/galleryData.ts:70`) — padahal data aslinya sudah ada di tabel `students`/`projects` |
| Landing `/` | — | Statistik "200+ Karya, 50+ Siswa, 15+ Guru" hardcoded (`lib/data.ts:182-187`); kartu galeri dari data yang dikomentari sendiri "data dummy, ganti dengan API Fase 2" (`data.ts:104-107`) |

### 🟢 Statis karena memang begitu (bukan bug)

`mitra/menunggu`, `mitra/ditolak`, `mitra/cara-kerja-bkk`, `jurusan/[slug]` (kurikulum statis), `jurusan/page` & `admin/page` (redirect index).

---

## 3.5 Cakupan Backend

Diukur langsung dari `route.ts`, `schema.prisma`, dan pemakaian di kode.

| Ukuran | Hasil |
|---|---|
| Endpoint nyata | **22** |
| Endpoint yang dipanggil frontend tapi **tidak ada** route-nya | **0** — kontrak frontend↔backend utuh, tidak ada panggilan ke endpoint hantu |
| Endpoint **tanpa penjagaan auth** | 7 dari 22 — 4 di antaranya memang publik (`auth/register`, `mitra/daftar`, `gallery`, `gallery/[id]`); 3 perlu ditinjau (lihat di bawah) |
| Model Prisma yang dipakai | **17 dari 18** |
| Model Prisma **tidak dipakai** | `Partnerships` — tabel dan migrasinya ada, tetapi tidak ada kode yang menyentuhnya |
| Endpoint belum tersambung | `/api/cache/image` — tidak dipanggil kode maupun `next.config.ts` |
| Metode `/api/notifications` | `GET` + `PATCH` — berbasis polling, **tanpa realtime** (tidak ada socket.io) |

### Yang perlu ditinjau dari sisi keamanan backend

| Endpoint | Alasan |
|---|---|
| `/api/chat` | **Tanpa auth.** Siapa pun bisa memanggilnya dan menghabiskan kuota `GEMINI_API_KEY`. ✅ **Sudah diperbaiki** — kini dibatasi 20 permintaan per 10 menit per IP (balas 429) |
| `/api/media/[filename]` | Menyajikan berkas dari `public/assets/uploads` tanpa auth. ✅ **Tidak bermasalah** — setelah diperiksa, `/api/upload` hanya menerima berkas gambar dan sudah dijaga `requireStudent()`, sedangkan dokumen legalitas mitra bukan berkas lokal melainkan URL eksternal yang diisi pendaftar. Jadi tidak ada dokumen sensitif di folder itu |

### Yang jelas belum ada backend-nya

**Tidak ada satu pun route `/api/admin/*`.** Artinya seluruh fungsi admin berikut tidak punya sisi server:

- setujui/tolak karya (moderasi)
- kelola pengguna
- kontrak & jasa BLUD
- analitik tren karya
- pengaturan global admin

Ini akar penyebab mengapa 6 halaman admin di §3 masih memakai data mock dan tombol-tombolnya tidak mengubah apa pun.

---

## 4. Optimisasi

### 4.1 Sudah bagus — pertahankan

- ✅ **Cache Redis + fallback memori** baru terpasang (`lib/redis.ts`) — terbukti 4/4 tes lolos tanpa server Redis
- ✅ `/api/cache/image` — proxy gambar eksternal ber-cache **dengan proteksi SSRF** (tolak host privat, hanya izinkan host terdaftar, `cache/image/route.ts:54-68`). ⚠️ **Catatan:** endpoint ini belum dipanggil kode mana pun dan `next.config.ts` tidak menunjuk ke sana, jadi **saat ini belum memberi manfaat** — perlu disambungkan dulu (mis. sebagai `images.loader`) agar berguna
- ✅ `/api/media/[filename]` + rewrite `/assets/uploads/*` — `Cache-Control: max-age=604800, immutable`. Sudah tersambung lewat `next.config.ts:21-23`
- ✅ Upload menyimpan ke cache → akses berikutnya tanpa baca disk (`api/upload/route.ts`)
- ✅ Invalidasi cache pada perubahan proyek oleh Siswa & Guru
- ✅ `gsap` sudah di-*code-split* dengan benar via `next/dynamic` (`JurusanMenu.tsx:9-14`)
- ✅ `company/katalog` dan `notifications` sudah memakai `skip`/`take`
- ✅ Singleton Prisma benar (`lib/prisma.ts:4`)
- ✅ **0 tag `<img>` mentah** — semuanya `next/image`

### 4.2 Gambar: 26 tag `fill` tanpa `sizes`

Tanpa `sizes`, `next/image` memakai default `100vw` → browser mengunduh varian lebar penuh **bahkan untuk logo 32 px**. Lokasi paling merugikan:

| Lokasi | Container | Bukti |
|---|---|---|
| `components/layout/Navbar.tsx:84` | logo **32 px** — muncul di **setiap halaman** | `w-8 h-8` di `:83` |
| `components/layout/Footer.tsx:100` | logo 32 px | `:99` |
| `components/dashboard/DashboardShell.tsx:193` | logo 32 px | — |
| `components/landing/ScrollExpandHero.tsx:15,44` | hero 70vh — **tanpa `sizes` dan tanpa `priority`** | kandidat LCP |
| `components/jurusan/JurusanHero.tsx:154` | foto model ±384 px | `max-w-sm` |
| `app/company/riwayat/page.tsx:92` | thumbnail **80 px** | `h-20 w-20` |
| `app/admin/moderasi/[id]/page.tsx:194` | showcase 288 px + `priority` | `h-72` |

Contoh yang sudah benar: `components/gallery/ProjectCard.tsx:82`.

### 4.3 Pemuatan data: halaman galeri publik adalah *client waterfall*

`app/gallery/page.tsx:1` dan `app/gallery/[id]/page.tsx:1` keduanya `"use client"` dan mengambil data lewat **`fetch` di dalam `useEffect`** (`gallery/page.tsx:34`, `gallery/[id]/page.tsx:47`). Artinya: HTML awal **kosong**, konten baru muncul setelah hidrasi + fetch. Untuk halaman publik utama, ini merugikan SEO dan waktu tampil pertama.

Koroborasi dari dalam repo sendiri: `seo-audit/run-pc/tech_seo_report.pdf` mencatat **"Needs Js Render" pada 13 dari 18 halaman (72,2%)**.

**Perbaikan:** jadikan keduanya Server Component — ambil data langsung via Prisma di server, kirim hasilnya sebagai props ke sub-komponen klien (toolbar/pagination). Tambahkan `export const revalidate` untuk halaman detail.

### 4.4 Cache data belum dipakai, dan ada invalidasi yang sia-sia

- **0** kemunculan `revalidate` / `unstable_cache` di seluruh `src`
- `/api/gallery` dan `/api/gallery/[id]` **selalu** query Prisma tiap request, tanpa cache — padahal `lib/redis.ts` sudah menyediakan `getCache`/`setCache`
- **Dead code:** `invalidateGalleryCache()` dipanggil di `api/teacher/projects/[id]/route.ts:129-135` untuk menghapus kunci `gallery:*`, tetapi **tidak ada satu pun route yang pernah menulis kunci itu** → invalidasi menghapus sesuatu yang tidak pernah ada
- `ensureStudentProfile()` (`api/student/projects/route.ts:19-30`) melakukan `findUnique` (+ `create`) di **setiap GET** — operasi tulis terselubung di endpoint baca

### 4.5 Kueri Prisma berisiko

**(a) N+1 di dalam loop** — N round-trip serial per simpan proyek:

- `api/student/projects/route.ts:193-198` — `for (const name of toolNames) { await prisma.skillTool.upsert(...) }`
- `api/student/projects/[id]/route.ts:226-232` — pola sama saat edit

Perbaikan: `findMany({ where: { name: { in: names } } })` + `createMany` → 2 kueri, bukan N.

**(b) `findMany` tanpa paginasi** (memori & waktu respons meledak saat data bertambah):

| Lokasi | Yang diambil tanpa batas |
|---|---|
| `api/gallery/route.ts:9-40` | **Seluruh tabel projects approved + semua relasi** — dikirim ke klien tiap kunjungan |
| `api/teacher/projects/route.ts:68,73` | Antrean + riwayat |
| `api/bkk/mitra/route.ts:35` | Semua perusahaan |
| `api/bkk/kontak/route.ts:92` | Semua permintaan kontak |
| `api/bkk/verifikasi/route.ts:35` | Semua pending |
| `api/company/minat/route.ts:117` | Semua riwayat per perusahaan |

**(c) Tanpa `select` → kolom sensitif ikut terbaca:**

- `api/gallery/route.ts:9` dan `api/gallery/[id]/route.ts:14` memakai `include` penuh, sehingga `passwordHash` siswa & pembimbing **terbaca dari database** lewat `student: { include: { user: true } }`. Tidak ikut terkirim ke klien (di-map ulang), tetapi polanya berbahaya — satu perubahan kecil bisa membocorkannya.
- `api/akun/route.ts:32-39` — `users.findUnique` tanpa `select` → `passwordHash` terbawa
- `api/mitra/daftar/route.ts:62-64` — cek duplikat tanpa `select`

### 4.6 Bundle

| Temuan | Detail |
|---|---|
| **`lenis` di root layout** | `app/layout.tsx:3,36` → dimuat di **setiap halaman**, termasuk dashboard & halaman login yang tidak butuh smooth scroll |
| **`motion` di 18 komponen**, termasuk `Footer.tsx:6` | Footer ada di setiap halaman publik → `motion` ikut masuk hampir semua bundle |
| **Landing memuat 13 pohon komponen klien** | `app/page.tsx` merender 11 section klien, hampir semuanya beranimasi |
| **Dataset mock 882 baris masuk bundle klien** | `src/data/galleryData.ts` diimpor statis oleh 3 halaman publik (`gallery/page.tsx:10`, `gallery/[id]/page.tsx:11`, `siswa/[id]/page.tsx:9`) — padahal data aslinya ada di database |
| **8 bobot font** | Poppins 5 (500–900) + Inter 3 (400–600). 2 bobot per keluarga biasanya cukup |

### 4.7 Lint: 149 masalah (55 error, 94 warning)

| Aturan | Jumlah | Sifat |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | 88 | Kosmetik |
| `@typescript-eslint/no-explicit-any` | 25 | Tipe longgar |
| `react-hooks/set-state-in-effect` | 23 | **Performa** — memicu render berantai |
| `react-hooks/rules-of-hooks` | **3** | 🔴 **Bug nyata** — hook dipanggil kondisional, bisa mematahkan komponen saat runtime |
| `react-hooks/immutability` | 3 | Risiko state tidak terdeteksi |
| `react-hooks/exhaustive-deps` | 2 | Bug halus |
| `react-hooks/purity` | 1 | Risiko render tidak stabil |

Prioritaskan **`rules-of-hooks` (3)** dan `set-state-in-effect` (23); sisanya bisa ditunda.

---

## 5. Keamanan

### Sudah baik

- ✅ **Proteksi rute berjalan** — `src/proxy.ts` memakai `withAuth`, `/company/*` diperiksa tambahan berdasarkan `verificationStatus` (pending → `/mitra/menunggu`, ditolak → `/mitra/ditolak`)
- ✅ Penjaga peran di API (`lib/api-auth.ts`: `requireStudent`, `requireTeacher`, `requireRole`)
- ✅ Password di-hash (bcrypt) — `api/auth/register/route.ts:42`
- ✅ **Proteksi SSRF** di proxy gambar (`api/cache/image/route.ts:13-68`) — menolak `localhost`, rentang IP privat, `.local`, `.internal`, dan hanya mengizinkan host terdaftar
- ✅ Hapus karya = **soft delete** (`deleted_at`), bukan hapus permanen
- ✅ `.env` tidak masuk git

### Perlu diperhatikan

| Temuan | Bukti | Risiko |
|---|---|---|
| `passwordHash` terbaca dari DB (tidak terkirim) | `api/gallery/route.ts:9`, `api/akun/route.ts:32` | Sedang — perbaiki dengan `select` |
| Aksi admin tidak berdampak ke data | `admin/moderasi/[id]/page.tsx:63-79` | **Integritas data** — keputusan moderasi tidak tercatat |
| `console.log(error)` tertinggal di handler error produksi | `api/auth/register/route.ts:64` | Rendah |
| Dokumen legalitas mitra adalah URL eksternal yang diisi sendiri pendaftar (tidak diunggah ke server) | `mitra/daftar/page.tsx:365-366`; `api/mitra/daftar/route.ts:29` | Sedang — verifikasi mitra bersandar pada tautan yang belum diperiksa keasliannya. Bukan celah kebocoran data, tapi kualitas verifikasi |

---

## 6. Tautan Rusak — Terlihat Pengunjung

**11 dari 14 tautan footer menuju 404.** Footer dirender di hampir semua halaman publik. Semua berasal dari `src/lib/data.ts:32-48` dan dirender `components/layout/Footer.tsx:150-184`.

| file:line | href | Keterangan |
|---|---|---|
| `lib/data.ts:32` | `/galeri` | Seharusnya `/gallery` (**salah ketik rute**) |
| `lib/data.ts:33-35` | `/leaderboard`, `/tentang`, `/kontak` | Rute tidak ada |
| `lib/data.ts:39-41` | `/verifikasi`, `/akademi`, `/komunitas` | Rute tidak ada |
| `lib/data.ts:45-48` | `/talenta`, `/mitra`, `/magang`, `/kontak` | Rute tidak ada |

**Kartu galeri di homepage** menautkan ke 5 rute tak ada: `/etalase/riset-logam-berat`, `/etalase/absensi-iot`, `/etalase/manajemen-perpustakaan`, `/etalase/kolaborasi-siswa`, `/etalase/monitoring-jaringan` (`lib/data.ts:115-159`, diklik via `GallerySection.tsx:77,331`).

**CTA "Pelajari cara kerja BKK"** → `/faq#bkk` (`IndustrySection.tsx:213`) padahal `/faq` tidak ada; maksudnya anchor di landing: `/#faq` atau `/#cara-kerja-bkk`.

---

## 7. Urutan Pengerjaan yang Disarankan

### Tahap 1 — Wajib sebelum deploy (½ hari)

1. **Perbaiki drift migrasi** untuk `projects.score`; uji `prisma migrate deploy` di database kosong (§1.1)
2. **Kecilkan 7 foto** di `public/images` (§1.2) — dampak terbesar per usaha
3. **Hapus `pnpm-lock.yaml`** agar package manager tidak ambigu (§1.4)
4. **Perbaiki 11 tautan footer + 5 tautan `/etalase/*`** (§6) — paling kelihatan pengunjung
5. **Hentikan fallback mock galeri** (`api/gallery/route.ts:82-88`) atau beri label jelas, agar publik tidak melihat karya fiktif
6. Bersihkan `.env` produksi dari 6 variabel mati (§1.3)

### Tahap 2 — Minggu pertama setelah live

7. **Tambal modul Admin** — minimal `admin/moderasi/[id]` supaya Verifikasi/Tolak benar-benar menulis ke database (§3). Ini yang paling berisiko secara operasional
8. **Hapus tab "Karya Saya" palsu** di `student/page.tsx` (§2) — pengguna mengira karyanya tersimpan
9. **Ubah `/gallery` jadi Server Component** (§4.3) — SEO halaman publik utama
10. **Perbaiki 3 pelanggaran `rules-of-hooks`** (§4.7)

### Tahap 3 — Peningkatan

11. Tambah `sizes` pada 26 tag gambar (§4.2)
12. Paginasi 6 endpoint yang belum terbatas; tambah `select` untuk hindari `passwordHash` (§4.5)
13. Ganti N+1 `skillTool.upsert` dengan `createMany` (§4.5a)
14. Pakai cache Redis untuk `/api/gallery` — sekaligus mengaktifkan `invalidateGalleryCache` yang sekarang jadi dead code (§4.4)
15. Pindahkan `lenis` keluar dari root layout; pangkas bobot font; hapus 6 komponen yatim (§2, §4.6)

---

## 8. Kesimpulan

**Yang sudah kuat:** arsitektur berperan dengan penjagaan akses yang benar, empat dari lima dashboard sudah sepenuhnya database, lapisan cache gambar/media modern dengan Redis opsional, proteksi SSRF, soft delete, dan build bersih tanpa error tipe.

**Yang harus dibereskan dulu:** satu kolom yang hilang dari riwayat migrasi (akan mematikan fitur kurasi nilai di produksi), 184 MB aset gambar, tautan footer yang 404, dan modul Admin yang tombol-tombolnya belum menulis apa pun.

**Penilaian:** fondasinya layak deploy; yang kurang adalah penyelesaian di tepi-tepinya. Tahap 1 di atas bisa diselesaikan dalam setengah hari dan menutup seluruh risiko yang bisa mematikan aplikasi saat production.
