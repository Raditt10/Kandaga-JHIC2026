# Panduan Lengkap Proyek Kandaga

> Dokumen ini menjelaskan proyek Kandaga dari nol: ide di baliknya, siapa saja
> penggunanya, alur kerja tiap peran, sampai detail teknis seperti dependensi,
> library, model database, dan sistem desain. Ditulis untuk siapa pun yang baru
> masuk ke proyek ini — baik manusia maupun agent — supaya bisa memahami
> keseluruhan sistem tanpa harus membaca seluruh kode.

---

## 1. Ide & Identitas Proyek

**Kandaga** adalah etalase digital dan portal kolaborasi industri untuk
**SMKN 13 Bandung**. Proyek ini dibuat untuk kompetisi **JHIC 2026**.

### Masalah yang diselesaikan

Sekolah vokasi punya dua sisi yang sebenarnya saling membutuhkan tapi tidak
terhubung:

- **Sisi sekolah**: karya tugas akhir siswa (aplikasi web, infrastruktur
  jaringan, hasil riset laboratorium) menumpuk tapi tidak terdokumentasi rapi.
  Tidak ada tempat resmi yang menampilkan karya siswa secara terkurasi.
- **Sisi industri**: perusahaan yang ingin mencari talenta muda atau membuka
  program PKL tidak punya kanal untuk melihat kemampuan siswa secara
  terverifikasi. Semua serba manual dan bergantung relasi personal.

Kandaga menjembatani keduanya: karya siswa diverifikasi dulu oleh guru, baru
tampil di galeri publik, dan perusahaan bisa mengajukan minat kepada siswa
**lewat BKK** — bukan menghubungi siswa langsung.

### Angka kunci proyek

| Item | Nilai |
|---|---|
| Kompetensi keahlian yang dicakup | 3 (RPL, TKJ, Analis Kimia) |
| Peran pengguna | 5 (Student, Teacher, Company, Admin, BKK) + pengunjung publik |
| Halaman (route) | 24 |
| Endpoint API | 12 |
| Model database | 17 model + 2 enum Prisma |

---

## 2. Aktor & Peran (RBAC)

Kandaga memakai **Role-Based Access Control** dengan 5 peran. Pembatasan akses
ditegakkan di `src/proxy.ts` (konvensi Proxy di Next.js 16 — sebelumnya bernama
`middleware.ts`).

| Peran | Domain | Yang bisa dilakukan |
|---|---|---|
| 🎓 **Student** | `/student` | Kelola karya portofolio sendiri, pantau status verifikasi guru |
| 👨‍🏫 **Teacher** | `/teacher` | Menilai & memverifikasi kelayakan karya siswa sebelum tayang di galeri |
| 🏢 **Company** | `/company` | Jelajahi katalog karya terverifikasi, simpan talenta, ajukan minat magang/rekrutmen |
| 💼 **BKK** | `/bkk` | Verifikasi akun perusahaan, meninjau permintaan kontak, manajemen mitra |
| 🛡️ **Admin** | `/admin` | Manajemen pengguna, penetapan peran, audit log |
| 👤 **Publik** | `/`, `/jurusan`, `/gallery`, `/auth/*`, `/mitra/daftar` | Lihat landing page, profil jurusan, galeri karya, dan mendaftar sebagai mitra |

**Prinsip penting**: perusahaan **tidak pernah** menghubungi siswa langsung.
Semua permintaan kontak melewati BKK sebagai perantara. Ini keputusan desain
yang menjaga keamanan dan privasi siswa, dan tercermin di seluruh alur data.

Cara rute dijaga (`src/proxy.ts`):

```ts
// Rute yang wajib punya token
matcher: [
  "/company/:path*", "/student/:path*", "/teacher/:path*",
  "/admin/:path*",   "/bkk/:path*",
  "/mitra/menunggu", "/mitra/ditolak",
]

// Rute publik yang selalu boleh diakses tanpa token
publicRoutes: ["/", "/auth/", "/mitra/daftar", "/mitra/menunggu",
               "/mitra/ditolak", "/jurusan", "/galeri-karya", "/api/"]
```

> Catatan: `/galeri-karya` di daftar itu adalah sisa rute lama. Halaman galeri
> sekarang bernama `/gallery`, dan karena `/gallery` tidak ada di matcher,
> halaman itu tetap bisa diakses publik.

---

## 3. Tech Stack Lengkap

### 3.1 Framework & bahasa

| Teknologi | Versi | Dipakai untuk |
|---|---|---|
| **Next.js** | 16.3.6 | Framework utama — App Router, Turbopack, API Routes |
| **React** | 19.2.8 | Library UI |
| **TypeScript** | 5 | Type safety di client, API route, dan model database |
| **Node.js** | v18.17+ (v20+ disarankan) | Runtime |

Next.js 16 memakai konvensi baru: file middleware bernama **`proxy.ts`**, bukan
`middleware.ts`. Ini pernah menyebabkan white screen di proyek ini saat masih
memakai nama lama.

### 3.2 Database & autentikasi

| Teknologi | Versi | Dipakai untuk |
|---|---|---|
| **PostgreSQL** | — | Database relasional, dengan ekstensi `citext` (email tidak case-sensitive) dan `pgcrypto` (pembuatan UUID) |
| **Prisma ORM** | 6.19.3 | Definisi schema, query type-safe, seeding |
| **NextAuth.js** | 4.24.15 | Autentikasi JWT-based |
| **bcryptjs** | 3.0.3 | Hash password |

Autentikasi berjalan di `src/app/api/auth/[...nextauth]/route.ts`:

- **Strategi session**: `jwt`, berlaku 30 hari.
- **Provider utama**: `CredentialsProvider` — cari user di PostgreSQL lewat Prisma, verifikasi dengan `bcrypt.compare`, tolak kalau `status !== "aktif"`.
- **Provider OAuth**: Google dan GitHub (kondisional — hanya aktif kalau env-nya diisi).
- **Field custom di token**: `id`, `role`, `username`, `verificationStatus`. Dideklarasikan di `src/types/next-auth.d.ts`.

### 3.3 UI & styling

| Teknologi | Versi | Dipakai untuk |
|---|---|---|
| **Tailwind CSS** | v4 | Seluruh styling, lewat `@tailwindcss/postcss` |
| **Lucide React** | 1.48 | Ikon vektor, dipakai di 35 file |
| **Google Fonts** | — | 6 keluarga font (lihat §8) |

Tailwind v4 dikonfigurasi lewat blok `@theme inline` di `src/app/globals.css` —
bukan lewat `tailwind.config.js`.

### 3.4 Animasi & interaksi

Proyek ini memakai **tiga library animasi** dengan peran berbeda. Ini sering
terlihat seperti pemborosan, tapi setelah diaudit ketiganya benar-benar dipakai:

| Library | Versi | Peran | Dipakai di |
|---|---|---|---|
| **motion** (`motion/react`) | 13.4.4 | Animasi deklaratif — reveal, `AnimatePresence`, scroll-linked animation | 17 file (mayoritas komponen landing & jurusan) |
| **gsap** | 3.15 | Animasi timeline yang butuh kontrol presisi | `ui/FlowingMenu.tsx`, `landing/JurusanMenu.tsx` |
| **lenis** | 1.3.26 | Smooth scroll di seluruh halaman | `lib/SmoothScrollProvider.tsx`, `jurusan/JurusanHero.tsx` |

### 3.5 Kecerdasan buatan

| Teknologi | Versi | Dipakai untuk |
|---|---|---|
| **@google/genai** | 2.26 | SDK Google Gemini untuk fitur "Kandaga AI" |

Fitur ini muncul sebagai tombol melayang "Tanya Kandaga AI" di pojok kanan
bawah. Detailnya di §10.

### 3.6 Tooling pengembangan

| Tool | Versi | Fungsi |
|---|---|---|
| **ESLint** + `eslint-config-next` | 9 / 16.3.6 | Linting |
| **tsx** | 4.23 | Menjalankan seed TypeScript (`npm run db:seed`) |
| **Prisma CLI** | 6.19.3 | `db push`, `generate`, `db seed` |

**Catatan audit**: `@types/pg` dan `ts-node` ada di `devDependencies` tapi
**tidak terpakai** — paket `pg` tidak ada sama sekali (Prisma memakai driver
sendiri), dan seed memakai `tsx` bukan `ts-node`. Keduanya kandidat hapus.

---

## 4. Struktur Folder

```text
Kandaga-JHIC2026/
├── AGENTS.md                  # Blok aturan Next.js 16 — ditulis otomatis oleh `next dev`
├── CLAUDE.md                  # 12 byte, isinya `@AGENTS.md` (include resmi Claude Code)
├── docs/                      # Semua dokumentasi (dari re-organisasi branch den_gallery)
│   ├── AGENTS.md              # Briefing utama untuk agent
│   ├── alur/alurMitra.md      # Rencana implementasi sisi perusahaan (Fase 0-8)
│   ├── alur/alurKonfirmasiBKK.md  # Alur verifikasi akun dari sisi BKK
│   ├── design/design.md       # Panduan motion & interaction
│   ├── design/design-rules.md # Aturan tipografi & tata letak (anti "AI slop")
│   └── setup/reactbits-setup.md
├── database/
│   └── 02_verifikasi_perusahaan.sql   # Migration: constraint + trigger notifikasi
├── prisma/
│   ├── schema.prisma          # 17 model + 2 enum
│   └── seed.ts                # Seed 5 user demo + 3 jurusan
├── public/
│   ├── logo.png, icons/*.svg, images/*.jpg
├── src/
│   ├── app/
│   │   ├── api/               # 12 API route (lihat §7)
│   │   ├── auth/              # login, register
│   │   ├── admin/ bkk/ company/ student/ teacher/   # 5 dashboard per peran
│   │   ├── gallery/           # galeri karya publik + detail
│   │   ├── jurusan/           # halaman jurusan (indeks + detail)
│   │   ├── mitra/             # daftar, menunggu, ditolak (pendaftaran mitra)
│   │   ├── siswa/             # profil siswa publik
│   │   ├── globals.css        # Token desain (@theme Tailwind v4)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── landing/           # 11 section landing page
│   │   ├── jurusan/           # Komponen halaman jurusan
│   │   ├── bkk/ company/ gallery/ chat/   # Komponen per domain
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # Primitif UI (Skeleton, MagneticButton, JellyRadio, FlowingMenu, dll)
│   ├── data/                  # Data statis (galleryData 37 KB, jurusanData 24 KB)
│   ├── lib/                   # Prisma client, auth helper, motion variants, knowledge base AI
│   └── proxy.ts               # Penjaga rute RBAC (Next.js 16)
```

---

## 5. Alur End-to-End

### 5.1 Alur utama: dari karya siswa sampai perusahaan

```text
[Siswa] unggah karya                   [Guru] verifikasi karya
        ↓                                      ↓
   status: pending  ──────────────────►  status: approved
                                               ↓
                                    [Publik] tampil di /gallery
                                               ↓
[Perusahaan] daftar di /mitra/daftar ──► status: menunggu
                                               ↓
                             [BKK] verifikasi di /bkk/verifikasi
                                    ┌──────────┴──────────┐
                                    ↓                     ↓
                              disetujui               ditolak
                                    ↓                     ↓
                          bisa akses katalog      /mitra/ditolak
                          /company/katalog        (+ alasan tertulis)
                                    ↓
                    [Perusahaan] ajukan minat pada karya
                                    ↓
                        status: terkirim ──► [BKK] /bkk/kontak
                                    ┌───────────┴───────────┐
                                    ↓                       ↓
                              diteruskan                 ditolak
                          ( siswa dihubungi )     ( + catatan wajib )
```

Ada **dua antrian terpisah** di dashboard BKK yang sengaja tidak digabung:

1. **Verifikasi Akun** (`/bkk/verifikasi`) — meninjau pengajuan akun perusahaan.
2. **Antrian Kontak** (`/bkk/kontak`) — meninjau permintaan minat perusahaan ke siswa.

### 5.2 Landing page (publik)

`src/app/page.tsx` menyusun 12 section secara berurutan, tiap section punya
koreografi animasinya sendiri:

| # | Section | Interaksi utama |
|---|---|---|
| 1 | `Navbar` | Session-aware — berubah kalau user sudah login |
| 2 | `Hero` | Curtain reveal 3 panel + tombol magnetik |
| 3 | `ScrollExpandHero` | Jendela kecil melebar penuh layar, "KANDAGA" → slogan |
| 4 | `GallerySection` | Card deck interaktif + auto-advance 7 detik |
| 5 | `StatsSection` | Section gelap + angka count-up |
| 6 | `WhySection` | Tilt-on-hover + SVG stroke draw |
| 7 | `JurusanMenu` | FlowingMenu (GSAP, dimuat lazy) |
| 8 | `IndustrySection` | Layout blueprint + tooltip hotspot |
| 9 | `BKKSection` | Anchor `#cara-kerja-bkk` |
| 10 | `TrustBar` | Logo mitra |
| 11 | `FAQSection` | Accordion dengan overshoot easing |
| 12 | `Footer` | Watermark outline |

### 5.3 Alur per peran

**Siswa** (`/student`): mengelola karya portofolio, memantau status verifikasi
guru (pending/approved/rejected). Profil publik siswa bisa dilihat di `/siswa/[id]`.

**Guru** (`/teacher`): menilai karya siswa, menyetujui publikasi ke galeri,
menambahkan catatan review.

**Perusahaan** (`/company`): empat halaman — `/company/katalog` (jelajah karya),
`/company/tersimpan` (bookmark talenta), `/company/riwayat` (riwayat permintaan +
catatan BKK), `/company/profil` (edit data perusahaan; status verifikasi
read-only).

**BKK** (`/bkk`): dashboard + tiga halaman kerja — `verifikasi`, `kontak`,
`mitra`. Memakai `BKKLayout` sebagai shell.

**Admin** (`/admin`): dashboard di `/admin/dashboard`, `/admin` mengarah ke sana.

### 5.4 Alur pendaftaran mitra (publik, tanpa login)

```text
/mitra/daftar  →  submit form  →  POST /api/mitra/daftar
                                        ↓
                        dibuat: baris users (role=Company)
                             + baris companies (status=pending)
                                        ↓
                              diarahkan ke /mitra/menunggu
```

Setelah login, `verificationStatus` dibawa di JWT/session sehingga
`src/proxy.ts` bisa mengarahkan perusahaan yang belum disetujui tanpa query
database tambahan:

- `pending` → `/mitra/menunggu`
- `ditolak` → `/mitra/ditolak`

---

## 6. Model Data

Schema di `prisma/schema.prisma` — 17 model, 2 enum. Penamaan model memakai
Bahasa Inggris, sementara UI dan dokumen memakai Bahasa Indonesia.

### 6.1 Enum

| Enum | Nilai |
|---|---|
| `Role` | `Student`, `Teacher`, `Company`, `Admin`, `BKK` |
| `ProjectType` | `RPL`, `TKJ`, `KA` |

> Nilai enum Prisma memakai PascalCase (`Student`), sedangkan session JWT
> memakai lowercase (`student`). Fungsi `normalizeRole()` di `src/lib/auth.ts`
> menjembatani keduanya.

### 6.2 Domain pengguna

| Model | Tabel | Isi |
|---|---|---|
| `Users` | `users` | Akun inti: `name` (= username), `email` (citext, unik), `passwordHash`, `status`, `role` |
| `Student` | `students` | Profil siswa: `nis`, `class`, `generation`, `bio`, `currentCareer`, relasi ke `Major` |
| `Teacher` | `teachers` | Profil guru: `nip`, relasi ke `Major` |
| `Company` | `companies` | Profil perusahaan: `name`, `field`, `documentUrl`, `verificationStatus`, `verifiedBy`, `verifiedAt`, `catatanVerifikasi` |
| `Major` | `majors` | Data jurusan: `name`, `fullName`, `image`, `link`, `description` |

### 6.3 Domain karya

| Model | Tabel | Isi |
|---|---|---|
| `Projects` | `projects` | Karya: `title`, `description`, `year`, `type` (enum), `status`, `reviewNotes`, `publishedAt`, `viewCount`, `deletedAt` (soft delete) |
| `ProjectsMedia` | `projects_media` | Gambar/video karya + urutan |
| `ProjectsTool` | `project_tools` | Teknologi yang dipakai karya |
| `ProjectsBadge` | `projects_badge` | Badge/penghargaan karya |
| `SkillTool` | `tools_skills` | Master data tool & skill |
| `Badges` | `badges` | Master data badge |

### 6.4 Domain interaksi

| Model | Tabel | Isi |
|---|---|---|
| `ContactRequests` | `contact_requests` | Permintaan minat perusahaan ke karya siswa: `purpose` (magang/kerja/kolaborasi), `message`, `status`, `bkkNotes`, `reviewedBy`, `reviewedAt` |
| `Bookmarks` | `bookmarks` | Karya yang disimpan perusahaan |
| `Partnerships` | `partnerships` | Kerja sama yang terbentuk |
| `Notifications` | `notifications` | Notifikasi in-app: `type`, `title`, `content`, `isRead` |
| `AuditLogs` | `audit_logs` | Jejak audit untuk admin |
| `FAQs` | `faqs` | Tanya-jawab, termasuk relasi penanya & penjawab |

### 6.5 Mesin status permintaan kontak

`ContactRequests.status` punya alur tersendiri (dokumentasi di `docs/alur/alurMitra.md` §5):

| Status | Label untuk pengguna | Warna |
|---|---|---|
| `terkirim` | Terkirim, menunggu ditinjau | biru (`info`) |
| `ditinjau` | Sedang ditinjau BKK | kuning (`pending`) |
| `klarifikasi` | Perlu klarifikasi dari Anda | kuning |
| `diteruskan` | Diteruskan ke siswa | hijau (`success`) |
| `ditolak` | Tidak dapat diproses | merah (`error`) |

`bkkNotes` (catatan BKK) **wajib diisi** untuk status `klarifikasi` dan
`ditolak`, supaya perusahaan selalu tahu alasannya.

---

## 7. Daftar Halaman & API Route

### 7.1 Halaman (24)

| URL | Peran | Keterangan |
|---|---|---|
| `/` | publik | Landing page 12 section |
| `/jurusan` | publik | Mengarah ke `/jurusan/rpl` |
| `/jurusan/[slug]` | publik | Detail jurusan (punya `loading.tsx`) |
| `/gallery` | publik | Galeri karya terverifikasi |
| `/gallery/[id]` | publik | Detail karya |
| `/siswa/[id]` | publik | Profil publik siswa (punya `loading.tsx`) |
| `/auth/login` | publik | Login multi-role + panel "Uji Coba 5 Peran" |
| `/auth/register` | publik | Registrasi umum |
| `/mitra/daftar` | publik | Form pendaftaran mitra perusahaan |
| `/mitra/menunggu` | publik | Halaman tunggu setelah daftar |
| `/mitra/ditolak` | publik | Halaman penolakan + alasan |
| `/student` | Student | Dashboard siswa |
| `/teacher` | Teacher | Dashboard guru |
| `/admin` | Admin | Mengarah ke `/admin/dashboard` |
| `/admin/dashboard` | Admin | Dashboard admin (manajemen user, audit log) |
| `/company` | Company | Dashboard perusahaan |
| `/company/katalog` | Company | Jelajah katalog karya |
| `/company/tersimpan` | Company | Talenta tersimpan (bookmark) |
| `/company/riwayat` | Company | Riwayat permintaan |
| `/company/profil` | Company | Edit profil perusahaan |
| `/bkk` | BKK | Dashboard BKK |
| `/bkk/verifikasi` | BKK | Antrian verifikasi akun perusahaan |
| `/bkk/kontak` | BKK | Antrian permintaan kontak |
| `/bkk/mitra` | BKK | Manajemen mitra (riwayat) |

### 7.2 API Route (12)

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Inti NextAuth (login, session, callback OAuth) |
| `/api/auth/register` | POST | Registrasi akun umum |
| `/api/mitra/daftar` | POST | Pendaftaran akun mitra perusahaan |
| `/api/gallery` | GET | Daftar karya untuk galeri |
| `/api/gallery/[id]` | GET | Detail satu karya |
| `/api/company/katalog` | GET | Katalog karya untuk perusahaan |
| `/api/company/bookmark` | POST, DELETE | Tambah & hapus bookmark talenta |
| `/api/company/minat` | POST, GET | Ajukan minat (POST) & lihat riwayat permintaan (GET) |
| `/api/company/profil` | GET, PATCH | Baca & ubah profil perusahaan |
| `/api/bkk/verifikasi` | GET, PATCH | Antrian verifikasi akun + aksi setujui/tolak |
| `/api/bkk/mitra` | GET | Daftar mitra (riwayat) |
| `/api/chat` | POST | Endpoint Kandaga AI |

Semua API route yang butuh proteksi memakai pola yang sama:

```ts
const session = await getServerSession(authOptions)
if (!session?.user?.id) → 401
if (session.user.role?.toLowerCase() !== "bkk") → 403
```

---

## 8. Sistem Desain

Token desain didefinisikan di `src/app/globals.css` lewat `@theme inline`
(Tailwind v4, tanpa `tailwind.config.js`).

### 8.1 Warna

| Token | Nilai | Fungsi |
|---|---|---|
| `--color-primary` | `#8B1A2F` | Marun — warna identitas utama |
| `--color-primary-dark` | `#6B1424` | Marun gelap untuk hover |
| `--color-cream` | `#F5F0E8` | Krem, latar section industri |
| `--color-ink` | `#1A1A1A` | Teks utama (bukan hitam pekat) |
| `--color-ink-700` | `#3D3D3D` | Teks sekunder |
| `--color-ink-600` | `#555555` | Label kecil |
| `--color-ink-300` | `#CCCCCC` | Teks nonaktif |
| `--color-ink-150` | `#E8E8E8` | Garis/border |
| `--color-ink-100` | `#F2F2F2` | Latar lembut |
| `--color-accent` | `#E8C97A` | Emas untuk logo & badge |

### 8.2 Tipografi

| Token | Font | Fungsi |
|---|---|---|
| `--font-heading` | Poppins | Semua judul |
| `--font-sans` | Inter | Teks isi |
| `--font-mono` | Geist Mono | Angka, email, label teknis |
| `--font-tangerine` | Tangerine | Aksen dekoratif |
| `--font-montserrat` | Montserrat | Aksen |
| `--font-bebas` | Bebas Neue | Aksen |

### 8.3 Aturan desain wajib (`docs/design/design-rules.md`)

Dokumen ini dibuat khusus untuk mencegah tampilan terasa seperti hasil AI
generik. Isinya batas keras, bukan saran:

1. **Ukuran teks minimum** — tidak boleh ada teks fungsional yang terlalu kecil.
2. **Hierarki heading** — `h1` satu per halaman, tidak melompat level.
3. **Panjang baris** — teks deskriptif maksimal `max-w-[65ch]`.
4. **Larangan nested cards** — kartu di dalam kartu adalah akar kesan "AI slop".
5. **Kontras** — teks memakai `ink-700` atau lebih gelap.
6. **Checklist §8** wajib dijalankan sebelum satu halaman dianggap selesai.

### 8.4 Panduan motion (`docs/design/design.md`)

Filosofinya bernama **"Membuka Kandaga"**. Prinsipnya: gerakan harus punya
makna, tidak sekadar dekorasi. Ada budget performa dan dukungan
`prefers-reduced-motion` untuk aksesibilitas.

Variant animasi yang dipakai berulang dikumpulkan di `src/lib/motion.ts`
(`revealUp`, `staggerChildren`, dll.) supaya konsisten.

---

## 9. Data Statis & Pola Fallback

Ini bagian arsitektur yang mudah terlewat, tapi menjelaskan banyak perilaku
aplikasi.

### 9.1 Tiga sumber data

| Sumber | File | Isi |
|---|---|---|
| **Database** | `prisma/schema.prisma` | Data nyata: user, karya, permintaan kontak |
| **Data statis** | `src/data/galleryData.ts` (37 KB), `src/data/jurusanData.ts` (24 KB) | Konten jurusan & sampel karya |
| **Data landing** | `src/lib/data.ts` (12 KB) | Semua teks landing page terpusat, dipakai 8 komponen |

### 9.2 Pola "database dulu, fallback statis"

`src/app/api/gallery/route.ts` mencoba Prisma dulu; kalau database kosong, ia
jatuh ke data statis:

```ts
// 1. Coba ambil dari database Prisma
const dbProjects = await prisma.projects.findMany({ ... })
// → kalau kosong/gagal, pakai getGalleryProjects() dari @/data/galleryData
```

Konsekuensinya: **galeri tetap terisi meski database masih kosong**. Saat ini
`projects` = 0 baris, jadi yang tampil di `/gallery` sepenuhnya berasal dari
data statis. Ini disengaja untuk keperluan demo, tapi perlu disadari supaya
tidak salah menyimpulkan bahwa data sudah masuk database.

### 9.3 Sisa pendekatan mock

`src/lib/users.ts` adalah database user **in-memory** (bukan PostgreSQL). File
ini masih dipakai oleh `src/app/admin/dashboard/page.tsx`. Jadi dashboard admin
saat ini membaca daftar user dari data mock, sementara login memakai database
sungguhan — ketidakkonsistenan yang perlu diselesaikan.

---

## 10. Kandaga AI

Fitur chatbot yang muncul sebagai tombol melayang **"Tanya Kandaga AI"** di
pojok kanan bawah setiap halaman.

- **Komponen**: `src/components/chat/ChatWidget.tsx`
- **Endpoint**: `src/app/api/chat/route.ts`
- **Otak**: `src/lib/kandaga-knowledge.ts` — berisi `KANDAGA_SYSTEM_INSTRUCTION`,
  instruksi sistem lengkap berisi profil sekolah, daftar jurusan, dan alur
  platform, ditulis dalam Bahasa Indonesia.
- **Model**: Google Gemini lewat SDK `@google/genai`, dikonfigurasi dengan
  `GEMINI_API_KEY`.

**Fallback offline**: kalau `GEMINI_API_KEY` belum dipasang, endpoint tidak
error — ia mengembalikan jawaban dari basis pengetahuan lokal
(`getLocalFallbackResponse()`), yang mencocokkan kata kunci seperti "jurusan"
atau "kompetensi" dengan jawaban yang sudah disiapkan. Jadi fitur ini tetap
berfungsi saat demo tanpa koneksi API.

---

## 11. Konfigurasi & Environment

### 11.1 Variabel `.env`

| Variabel | Wajib | Fungsi |
|---|---|---|
| `DATABASE_URL` | ✅ | Koneksi PostgreSQL |
| `NEXTAUTH_URL` | ✅ | Base URL aplikasi |
| `NEXTAUTH_SECRET` | ✅ | Kunci penandatanganan JWT |
| `GEMINI_API_KEY` | — | Mengaktifkan Kandaga AI sungguhan |
| `GOOGLE_CLIENT_ID` / `SECRET` | — | Login Google |
| `GITHUB_ID` / `GITHUB_SECRET` | — | Login GitHub |
| `FACEBOOK_CLIENT_ID` / `SECRET` | — | Disediakan, belum dipakai kode |
| `LINKEDIN_CLIENT_ID` / `SECRET` | — | Disediakan, belum dipakai kode |

Provider OAuth Google & GitHub bersifat **kondisional**: hanya didaftarkan ke
NextAuth kalau env-nya terisi, jadi aplikasi tetap jalan tanpa kredensial OAuth.

> `FACEBOOK_*` dan `LINKEDIN_*` ada di `.env` dan tombolnya tampil di halaman
> login, tapi provider-nya belum didaftarkan di `authOptions` — tombol itu belum
> berfungsi.

### 11.2 File konfigurasi lain

| File | Isi |
|---|---|
| `next.config.ts` | `images.remotePatterns` untuk `picsum.photos` & `images.unsplash.com` |
| `tsconfig.json` | Path alias `@/*` → `./src/*` |
| `postcss.config.mjs` | Plugin `@tailwindcss/postcss` |
| `eslint.config.mjs` | ESLint 9 flat config + `eslint-config-next` |
| `prisma.config.ts` | `defineConfig({})` + `import "dotenv/config"` |
| `pnpm-workspace.yaml` | `allowBuilds` untuk paket Prisma & esbuild |

### 11.3 Package manager

Repo ini memuat **dua lockfile**: `package-lock.json` (npm) dan
`pnpm-lock.yaml` (pnpm). Dari pemeriksaan `node_modules`, yang benar-benar
dipakai adalah **npm** (`node_modules/.package-lock.json` ada, sedangkan
`.modules.yaml` dan `.pnpm` tidak ada). Sebaiknya dipilih satu supaya semua
anggota tim mendapat pohon dependensi yang sama.

---

## 12. Alur Setup Development

```bash
# 1. Clone & install
git clone https://github.com/Raditt10/Kandaga-JHIC2026.git
cd Kandaga-JHIC2026
npm install

# 2. Buat .env (lihat §11.1)

# 3. Siapkan database
npx prisma db push        # terapkan schema ke PostgreSQL
npx prisma generate       # generate Prisma Client
npm run db:seed           # isi 5 user demo + 3 jurusan

# 4. Jalankan
npm run dev               # http://localhost:3000

# 5. Verifikasi build produksi
rm -rf .next
npm run build
npm run start
```

### Akun demo hasil seed

Semua memakai password **`password123`**:

| Username | Peran | Diarahkan ke |
|---|---|---|
| `siswa13` | student | `/student` |
| `admin13` | admin | `/admin` |
| `mitra_perusahaan` | company | `/company` |
| `guru13` | teacher | `/teacher` |
| `bkk13` | bkk | `/bkk` |

### Script `package.json`

| Script | Perintah | Fungsi |
|---|---|---|
| `dev` | `next dev` | Dev server (Turbopack) |
| `build` | `next build` | Build produksi |
| `start` | `next start` | Jalankan hasil build |
| `lint` | `eslint` | Linting |
| `db:seed` | `tsx prisma/seed.ts` | Seeding |
| `postinstall` | `prisma skills sync \|\| exit 0` | Sinkronisasi skill agent Prisma (dibuat otomatis) |

---

## 13. Kondisi Saat Ini & Utang Teknis

Bagian ini penting supaya tidak salah menyimpulkan kondisi proyek dari
tampilannya saja.

### 13.1 Database kosong untuk data konten

| Tabel | Jumlah baris |
|---|---|
| `projects` (karya) | **0** |
| `students` | **0** |
| `teachers` | **0** |
| `companies` | 2 (1 disetujui) |
| `users` | 7 |
| `contact_requests` | 0 |
| `notifications` | 0 |

Artinya: galeri tampil terisi **hanya karena data statis** (§9.2), dashboard
siswa/guru belum punya profil, dan perusahaan belum bisa mengajukan minat karena
tidak ada karya berstatus `approved`. Untuk demo yang meyakinkan, database perlu
diisi data contoh.

### 13.2 Migration belum diterapkan

`database/02_verifikasi_perusahaan.sql` berisi constraint dan trigger notifikasi
yang cocok dengan schema Prisma, tapi **belum pernah dijalankan**. Hasil
pemeriksaan langsung ke database: **0 trigger, 0 view, 0 function aplikasi**.

Akibatnya `src/app/api/bkk/verifikasi/route.ts` mengembalikan pesan
*"Notifikasi dikirim otomatis"* padahal tidak ada notifikasi yang dibuat, dan
aturan "tolak wajib disertai catatan" tidak dijaga database.

### 13.3 Dokumen vs kenyataan

`docs/alur/alurMitra.md` §2 memerintahkan pemakaian view & trigger database
(`v_katalog_publik`, `app_uid()`, `permintaan_guard`) yang **tidak ada** di
database. `docs/AGENTS.md` juga masih menyatakan banyak fitur "BELUM" dibuat
padahal sudah jalan. Dokumen-dokumen ini perlu diselaraskan.

### 13.4 Ringkasan utang teknis

| Prioritas | Item |
|---|---|
| Tinggi | Isi database dengan data contoh (karya + profil siswa/guru) |
| Tinggi | Putuskan: jalankan migration SQL, atau perbaiki dokumen agar jujur |
| Tinggi | Satukan package manager (hapus salah satu lockfile) |
| Sedang | `admin/dashboard` masih memakai user mock dari `src/lib/users.ts` |
| Sedang | Selaraskan `docs/AGENTS.md` dengan kondisi repo |
| Rendah | Hapus devDependency tak terpakai (`@types/pg`, `ts-node`) |
| Rendah | Rapikan sisa `/galeri-karya` di `src/proxy.ts` dan tombol OAuth yang belum aktif |
