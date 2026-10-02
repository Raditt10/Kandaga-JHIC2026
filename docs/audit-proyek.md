# Audit Proyek Kandaga — Analisis Kebutuhan & Pembersihan

> Hasil audit teknis atas repo `Kandaga-JHIC2026` sebagai dasar perapian proyek.
> Metode: penelusuran rujukan impor di seluruh `src/`, pemeriksaan langsung ke
> database PostgreSQL proyek, dan pengecekan pemakaian tiap dependency.
> Semua penghapusan dilakukan lewat Recycle Bin, bukan hapus permanen.

---

## 1. Ringkasan

| Kategori | Jumlah |
|---|---|
| File dihapus (terbukti tidak dirujuk) | 9 file + 1 folder kosong |
| File yang **sengaja dipertahankan** meski tampak tidak perlu | 5 |
| Rekomendasi yang butuh keputusanmu (belum dijalankan) | 4 |
| Temuan risiko | 1 (serius) |

Yang paling penting dari audit ini bukan daftar hapusannya, tapi **1 temuan
risiko** di §6: ada migration database yang belum pernah dijalankan, padahal
kode aplikasi sudah mengasumsikan efeknya ada.

---

## 2. Tech stack — apa yang benar-benar dipakai

| Dependency | Terpakai di | Verdict |
|---|---|---|
| `next` 16.3.6 + `react` 19.2.8 | seluruh app | inti |
| `typescript` 5 | seluruh app | inti |
| `tailwindcss` v4 (`@tailwindcss/postcss`) | seluruh UI | inti |
| `prisma` + `@prisma/client` 6.19.3 | 11 file (`lib/prisma.ts` dsb.) | inti |
| `next-auth` 4.24.15 | auth + 8 API route | inti |
| `bcryptjs` | `api/auth/register`, `[...nextauth]` | inti |
| `lucide-react` | 35 file | inti |
| `motion` (`motion/react`) | 17 file | inti animasi |
| `gsap` | `ui/FlowingMenu.tsx`, `landing/JurusanMenu.tsx` | dipakai (2 komponen) |
| `lenis` | `lib/SmoothScrollProvider.tsx`, `jurusan/JurusanHero.tsx` | dipakai (2 file) |
| `@google/genai` | `api/chat/route.ts` | dipakai (widget "Tanya Kandaga AI") |

Tiga library animasi berdampingan (`motion`, `gsap`, `lenis`) terlihat boros,
tapi setelah dicek **ketiganya benar-benar dipakai** dan perannya berbeda:
`motion` untuk animasi deklaratif, `gsap` untuk timeline di menu jurusan,
`lenis` untuk smooth scroll. Tidak ada yang layak dihapus di sini — konsolidasi
hanya akan menghemat sedikit ukuran bundle dengan biaya refactor besar.

---

## 3. Sudah dihapus, beserta alasannya

Semua baris di bawah terbukti **nol rujukan impor** di seluruh `src/` —
diverifikasi dua kali: sekali dengan deteksi otomatis, sekali lagi dengan
pencarian langsung nama file (untuk menangkap bentuk impor yang tidak standar).

### File sumber

| File | Alasan |
|---|---|
| `src/components/Navbar.tsx` | Versi lama dari Navbar. Yang dipakai sekarang `src/components/layout/Navbar.tsx` (5 rujukan). File ini masih memakai API usang (`onOpenLogin`, `onSelectCategory`) dan 0 rujukan. |
| `src/components/jurusan/CompetencyChipList.tsx` | 0 rujukan. |
| `src/components/jurusan/JurusanCollaboration.tsx` | 0 rujukan. |
| `src/components/jurusan/JurusanNavTabs.tsx` | 0 rujukan — namanya cuma muncul di sebuah **komentar** di `app/jurusan/[slug]/loading.tsx`. |
| `src/components/jurusan/tabs/FasilitasTab.tsx` | 0 rujukan. |
| `src/components/jurusan/tabs/KarirTab.tsx` | 0 rujukan (folder `tabs/` jadi kosong, ikut dihapus). |
| `src/components/ui/index.ts` | Barrel file yang tidak pernah diimpor; 0 penggunaan bentuk `from "@/components/ui"`. Komponen di dalamnya tetap dipakai langsung satu per satu. |

### Aset & artefak build

| File | Alasan |
|---|---|
| `public/logo.svg` | 0 rujukan di `.ts/.tsx/.css/.md/.json/.mjs`. Yang dipakai `public/logo.png` (dipakai di `BKKLayout`, `Navbar`, dll). |
| `tsconfig.tsbuildinfo` | Artefak build TypeScript (293 KB). Sudah masuk `.gitignore`, dibuat ulang otomatis. |

### Konfigurasi

`.gitignore` ditambah dua entri supaya artefak otomatis tidak lagi muncul di
`git status`:

- `/node-compile-cache` — cache kompilasi Node (548 file, 2,54 MB) yang selama ini tampil sebagai untracked.
- `/.agents/skills` — dibuat ulang otomatis oleh script `postinstall: prisma skills sync`.

**Verifikasi:** `npx tsc --noEmit` → exit code 0, tanpa error. Tidak ada rute yang rusak karena semua file yang dihapus memang tidak dirujuk.

---

## 4. Sengaja DIPERTAHANKAN meski terlihat tidak perlu

Bagian ini sama pentingnya dengan §3 — beberapa hal kelihatan seperti sampah,
tapi punya alasan kuat untuk tetap ada. Saya sengaja tidak menghapusnya.

### 4.1 `database/02_verifikasi_perusahaan.sql` — **JANGAN DIHAPUS**

Ini file yang paling mudah salah nilai. Isinya ternyata **cocok dengan skema
Prisma yang asli** dan justru sangat dibutuhkan:

```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS catatan_verifikasi text;
ALTER TABLE companies ADD CONSTRAINT perusahaan_catatan_ditolak_chk ...
CREATE TRIGGER trg_company_verif_notify AFTER UPDATE OF verification_status ON companies ...
```

Fakta yang membuat file ini penting:

1. Nama tabel yang dipakai (`companies`), kolom (`verification_status`,
   `catatan_verifikasi`), dan tabel notifikasi (`notifications` dengan
   `user_id/type/title/content`) **semuanya persis sama** dengan `schema.prisma`.
2. Kolom `catatan_verifikasi` inilah yang hilang dari database dan sempat
   membuat **semua login gagal** (`PrismaClientKnownRequestError` P2022), karena
   `authorize()` memakai `include: { companyProfile: true }`. Waktu itu kolomnya
   ditambahkan manual; file ini bagian ke-1 dari migration itu.
3. Saya periksa langsung ke database: **0 trigger, 0 view, 0 function aplikasi**
   di schema `public`. Artinya **migration ini belum pernah dijalankan.**

Jadi file ini adalah pekerjaan yang belum dieksekusi, bukan file mati. Yang
keliru cuma dua hal kecil di header-nya: penomoran `02_` menyiratkan ada
`01_schema.sql` (padahal tidak ada, database dibangun lewat `prisma db push`),
dan komentarnya menyebut `-d kandaga` padahal nama database di `.env` adalah
`Kandaga`.

### 4.2 Sisanya

| Item | Alasan dipertahankan |
|---|---|
| `AGENTS.md` (root, 687 byte) | Ditulis dan **ditambahkan ulang otomatis oleh `next dev`** (blok `nextjs-agent-rules`). Menghapusnya hanya akan membuat file itu muncul lagi sebagai perubahan uncommitted. |
| `CLAUDE.md` (12 byte) | Hanya berisi `@AGENTS.md` — mekanisme include resmi Claude Code. Valid, tidak duplikasi konten. |
| `src/types/index.ts` | Detektor otomatis saya sempat menandainya mati, tapi setelah dicek manual **dipakai 8 file** lewat impor barrel `from "@/types"` (`ProjectCard`, `FAQSection`, `IndustrySection`, `StatsSection`, `WhySection`, `Footer`, `galleryData`, `lib/data`). |
| `.agents/skills/prisma-*` | Dibuat otomatis oleh `prisma skills sync` di `postinstall`. Sekarang masuk `.gitignore`, bukan dihapus. |

---

## 5. Rekomendasi yang butuh keputusanmu

Belum saya jalankan karena menyentuh cara kerja tim atau butuh operasi berat.

### 5.1 Dua lockfile bercampur — prioritas tinggi

Repo punya `package-lock.json` (npm, 311 KB, terbaru) **dan** `pnpm-lock.yaml`
(pnpm, 174 KB) plus `pnpm-workspace.yaml`.

Bukti mana yang benar-benar dipakai: `node_modules/.package-lock.json` **ada**,
sedangkan `node_modules/.modules.yaml` dan `node_modules/.pnpm` **tidak ada**.
Artinya dependensi di mesin ini di-install pakai **npm**; pnpm tidak pernah
dipakai di sini.

Menyimpan dua lockfile berbahaya: dua orang bisa mendapat pohon dependensi
berbeda dan bug "jalan di laptopku" mulai muncul. Sarannya hapus
`pnpm-lock.yaml` + `pnpm-workspace.yaml` — **tapi konfirmasi dulu ke anggota tim
yang memakainya** (`pnpm-lock.yaml` masuk lewat branch `den_gallery`).

### 5.2 Dua devDependency tidak terpakai

| Paket | Bukti | Tindakan |
|---|---|---|
| `@types/pg` | Paket `pg` tidak ada di `dependencies`, `node_modules/pg` tidak ada, dan tidak ada `from "pg"` di `src/`. Prisma memakai driver sendiri. | hapus dari `package.json` |
| `ts-node` | Terpasang, tapi tidak dipakai di script mana pun. Seed memakai `tsx` (`"db:seed": "tsx prisma/seed.ts"`). | hapus dari `package.json` |

Keduanya butuh `npm install` setelah diedit supaya `package-lock.json` ikut
sinkron — dan itu operasi yang bergantung jaringan ke registry npm, jadi saya
tidak menjalankannya tanpa persetujuanmu.

### 5.3 `.next/` sudah 1,4 GB

3.140 file, **1.397 MB**. Sudah masuk `.gitignore` jadi tidak mengotori repo,
tapi besar di disk. Bisa dihapus dengan aman — konsekuensinya dev server
berikutnya akan rebuild penuh (lebih lambat sekali). Saya tidak menghapusnya
sekarang karena dev server kamu sedang jalan (PID 32156 di port 3000).

### 5.4 `docs/AGENTS.md` isinya sudah kedaluwarsa

File briefing agent itu masih menggambarkan kondisi repo lama. Contohnya §7
menyatakan halaman Jurusan, komponen `IndustrySection`/`ScrollExpandHero`/
`JellyRadio`/`JurusanMenu`, dan seluruh backend/API/auth **"BELUM"** dibuat —
padahal semuanya sudah ada dan jalan. Ini berbahaya: agent berikutnya bisa
membangun ulang sesuatu yang sudah selesai.

Sesuai aturan di dokumen itu sendiri §9 poin 5 ("laporkan konfliknya, jangan
diam-diam pilih salah satu"), saya tidak mengubahnya. Perlu ditulis ulang.

---

## 6. Temuan risiko

**Migration `02_verifikasi_perusahaan.sql` belum pernah dijalankan, padahal kode
sudah mengasumsikan efeknya ada.**

Akibatnya konkret, bukan teoretis:

- `src/app/api/bkk/verifikasi/route.ts` mengembalikan pesan ke pengguna
  *"Akun perusahaan berhasil disetujui. **Notifikasi dikirim otomatis**."*
  Faktanya **tidak ada notifikasi apa pun yang dibuat** — tabel `notifications`
  masih 0 baris dan tidak ada trigger yang mengisinya. Pesan itu menjanjikan
  sesuatu yang tidak terjadi.
- Constraint `perusahaan_catatan_ditolak_chk` tidak ada, jadi aturan "tolak wajib
  disertai catatan" **tidak** dijaga database. Untuk route baru
  (`api/bkk/kontak`) saya menegakkan aturan itu di layer API agar tidak
  bergantung pada database.
- `AGENTS.md`/`alurMitra.md` §2 memerintahkan memakai `v_katalog_publik`,
  `app_uid()`, dan trigger untuk menegakkan aturan bisnis. **Semuanya tidak ada
  di database.** Siapa pun yang mengikuti instruksi itu akan menulis query ke
  objek yang tidak eksis.

Dua pilihan penyelesaian yang perlu kamu putuskan:

1. **Jalankan migration-nya** (`psql -d Kandaga -v ON_ERROR_STOP=1 -f database/02_verifikasi_perusahaan.sql`) — memberi constraint + notifikasi otomatis sungguhan, tapi dokumen §2 masih menjanjikan banyak hal lain yang tidak ada.
2. **Tinggalkan database apa adanya** dan perbaiki dokumennya supaya jujur bahwa penegakan aturan ada di layer aplikasi (Prisma), bukan di database.

---

## 7. Status akhir

- `npx tsc --noEmit` → **exit 0, tanpa error** setelah semua penghapusan.
- Tidak ada file di §3 yang dihapus permanen — semuanya di Recycle Bin kalau perlu dikembalikan.
- `.gitignore` diperbarui agar artefak otomatis tidak lagi muncul di `git status`.
